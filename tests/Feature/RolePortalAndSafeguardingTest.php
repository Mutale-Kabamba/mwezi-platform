<?php

namespace Tests\Feature;

use App\Models\CommunityPost;
use App\Models\CommunityServiceHub;
use App\Models\CommunityTopic;
use App\Models\CyclePrediction;
use App\Models\CycleProfile;
use App\Models\Donation;
use App\Models\ProductAndEmergencyRequest;
use App\Models\SmsAlertLog;
use App\Models\SponsorshipCampaign;
use App\Models\TrustedConnection;
use App\Models\User;
use App\Services\HpczVerificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RolePortalAndSafeguardingTest extends TestCase
{
    use RefreshDatabase;

    public function test_ensure_user_role_enforces_portal_rbac_boundaries(): void
    {
        $primary = User::factory()->create(['role' => 'primary_user', 'onboarding_completed_at' => now()]);
        $partner = User::factory()->create(['role' => 'community_partner', 'onboarding_completed_at' => now()]);
        $reviewer = User::factory()->create(['role' => 'health_reviewer', 'onboarding_completed_at' => now()]);
        $admin = User::factory()->create(['role' => 'admin', 'onboarding_completed_at' => now()]);

        // Primary user blocked from all operational portals
        $this->actingAs($primary)->get('/portal/partner')->assertStatus(403);
        $this->actingAs($primary)->get('/portal/reviewer')->assertStatus(403);
        $this->actingAs($primary)->get('/portal/admin')->assertStatus(403);

        // Partner can access partner portal, blocked from reviewer & admin
        $this->actingAs($partner)->get('/portal/partner')->assertStatus(200);
        $this->actingAs($partner)->get('/portal/reviewer')->assertStatus(403);
        $this->actingAs($partner)->get('/portal/admin')->assertStatus(403);

        // Reviewer can access reviewer portal, blocked from partner & admin
        $this->actingAs($reviewer)->get('/portal/reviewer')->assertStatus(200);
        $this->actingAs($reviewer)->get('/portal/partner')->assertStatus(403);
        $this->actingAs($reviewer)->get('/portal/admin')->assertStatus(403);

        // Admin can access admin portal
        $this->actingAs($admin)->get('/portal/admin')->assertStatus(200);
    }

    public function test_community_girls_only_topics_and_posts_are_isolated_from_trusted_contacts_and_donors(): void
    {
        $primary = User::factory()->create(['role' => 'primary_user', 'onboarding_completed_at' => now()]);
        $companion = User::factory()->create(['role' => 'trusted_contact', 'onboarding_completed_at' => now()]);
        $donor = User::factory()->create(['role' => 'donor_sponsor', 'onboarding_completed_at' => now()]);

        $girlsTopic = CommunityTopic::create([
            'name' => 'First Period Safe Space',
            'slug' => 'first-period-safe-space',
            'description' => 'Girls only discussions',
            'audience_scope' => 'girls_only',
            'sort_order' => 1,
        ]);

        $publicTopic = CommunityTopic::create([
            'name' => 'General Menstrual Health',
            'slug' => 'general-menstrual-health',
            'description' => 'Open community discussions',
            'audience_scope' => 'open_community',
            'sort_order' => 2,
        ]);

        // Companion & donor cannot post into a girls_only topic
        $this->actingAs($companion)->post('/community/posts', [
            'topic_id' => $girlsTopic->id,
            'title' => 'Attempted Companion Post',
            'body' => 'Should be blocked',
            'is_anonymous' => true,
        ])->assertStatus(403);

        $this->actingAs($donor)->post('/community/posts', [
            'topic_id' => $girlsTopic->id,
            'title' => 'Attempted Donor Post',
            'body' => 'Should be blocked',
            'is_anonymous' => true,
        ])->assertStatus(403);

        // Primary user CAN post into girls_only topic
        $this->actingAs($primary)->post('/community/posts', [
            'topic_id' => $girlsTopic->id,
            'title' => 'Safe Girl Question',
            'body' => 'Asking safely in girls-only circle',
            'is_anonymous' => true,
        ])->assertRedirect();

        $this->assertDatabaseHas('community_posts', [
            'topic_id' => $girlsTopic->id,
            'title' => 'Safe Girl Question',
        ]);

        // Public topic remains accessible
        $this->assertDatabaseHas('community_topics', ['id' => $publicTopic->id, 'audience_scope' => 'open_community']);
    }

    public function test_companion_invite_code_verification_and_accept_flow(): void
    {
        $primary = User::factory()->create(['role' => 'primary_user', 'onboarding_completed_at' => now()]);
        $companion = User::factory()->create(['role' => 'trusted_contact', 'onboarding_completed_at' => now()]);

        $connection = TrustedConnection::create([
            'primary_user_id' => $primary->id,
            'contact_name' => 'Aunty Mary',
            'contact_channel' => '+260977112233',
            'relationship' => 'aunt',
            'invite_code' => 'MWZ-TEST99',
            'status' => 'invited',
            'permissions' => ['cycle_phase' => true, 'tips' => true, 'care_reminders' => true],
        ]);

        // Public invite code lookup works without auth
        $this->postJson('/companion/verify-code', ['code' => 'mwz-test99'])
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'connection' => [
                    'invite_code' => 'MWZ-TEST99',
                    'contact_name' => 'Aunty Mary',
                    'relationship' => 'aunt',
                ],
            ]);

        // Companion accepts pending request
        $connection->update(['trusted_user_id' => $companion->id, 'status' => 'pending']);
        $this->actingAs($companion)
            ->post("/trusted-circle/requests/{$connection->id}/accept")
            ->assertRedirect();

        $this->assertDatabaseHas('trusted_connections', [
            'id' => $connection->id,
            'status' => 'active',
        ]);
    }

    public function test_broadpay_webhook_processing_is_idempotent(): void
    {
        $campaign = SponsorshipCampaign::create([
            'title' => 'Keep Girls in School',
            'description' => 'Dignity kits for rural schools',
            'target_amount_zmw' => 10000,
            'raised_amount_zmw' => 0,
            'cost_per_girl_zmw' => 150,
            'is_active' => true,
        ]);

        $donation = Donation::create([
            'campaign_id' => $campaign->id,
            'donor_name' => 'Zambia Sponsor',
            'amount_zmw' => 300,
            'girls_supported_count' => 2,
            'donation_type' => 'dignity_kit',
            'payment_channel' => 'mtn_momo',
            'payment_reference' => 'MWZ-DON-IDEM-01',
            'payment_status' => 'pending',
            'is_anonymous' => false,
        ]);

        $payload = [
            'reference' => 'MWZ-DON-IDEM-01',
            'status' => 'successful',
            'lencoReference' => 'LENCO-998877',
        ];

        // First webhook marks completed & increments campaign raised amount
        $this->postJson('/webhooks/broadpay', $payload)
            ->assertStatus(200)
            ->assertJson(['success' => true]);

        // Second duplicate webhook must be idempotent (no double increment)
        $this->postJson('/webhooks/broadpay', $payload)
            ->assertStatus(200)
            ->assertJson(['success' => true]);

        $campaign->refresh();
        $donation->refresh();

        $this->assertEquals('completed', $donation->payment_status);
        $this->assertEquals(300, (int) $campaign->raised_amount_zmw);
    }

    public function test_hpcz_verification_service_and_admin_override(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'onboarding_completed_at' => now()]);
        $reviewer = User::factory()->create([
            'role' => 'health_reviewer',
            'hpcz_registration_number' => 'HPCZ-ZM-4455',
            'onboarding_completed_at' => now(),
        ]);

        // Without external HPCZ endpoint configured, format-valid registration enters pending
        $service = app(HpczVerificationService::class);
        $result = $service->verify($reviewer, 'HPCZ-ZM-4455');

        $this->assertEquals('pending', $result['status']);
        $this->assertEquals('pending', $reviewer->fresh()->hpcz_verification_status);

        // Admin manually approves HPCZ status via route
        $this->actingAs($admin)
            ->post("/portal/admin/users/{$reviewer->id}/verify-hpcz", [
                'status' => 'verified',
                'notes' => 'Confirmed against HPCZ registry.',
            ])
            ->assertRedirect();

        $reviewer->refresh();
        $this->assertEquals('verified', $reviewer->hpcz_verification_status);
        $this->assertNotNull($reviewer->hpcz_verified_at);

        // When external HPCZ endpoint is configured and returns verified, auto-verifies
        config(['services.hpcz.endpoint' => 'https://hpcz.example.zm/verify']);
        Http::fake([
            'https://hpcz.example.zm/verify*' => Http::response(['verified' => true, 'notes' => 'Active license'], 200),
        ]);

        $autoResult = $service->verify($reviewer, 'HPCZ-ZM-4455');
        $this->assertEquals('verified', $autoResult['status']);
    }

    public function test_ussd_menu_and_sms_alerts_dispatch_correctly(): void
    {
        $girl = User::factory()->create([
            'role' => 'primary_user',
            'phone' => '+260977556677',
            'onboarding_completed_at' => now(),
        ]);

        CycleProfile::create([
            'user_id' => $girl->id,
            'average_cycle_length' => 28,
            'average_period_length' => 5,
        ]);

        CyclePrediction::create([
            'user_id' => $girl->id,
            'predicted_start_date' => now()->addDays(2)->toDateString(),
            'predicted_end_date' => now()->addDays(7)->toDateString(),
            'confidence_score' => 0.90,
        ]);

        // USSD root menu
        $this->post('/ussd', ['phoneNumber' => '+260977556677', 'text' => ''])
            ->assertStatus(200)
            ->assertSee('CON Welcome to Mwezi');

        // USSD option 1: Cycle forecast
        $this->post('/ussd', ['phoneNumber' => '+260977556677', 'text' => '1'])
            ->assertStatus(200)
            ->assertSee('your next expected period window starts');

        // USSD option 3: Helplines
        $this->post('/ussd', ['phoneNumber' => '+260977556677', 'text' => '3'])
            ->assertStatus(200)
            ->assertSee('Childline Zambia: 116');

        // Partner marks request ready_for_pickup -> triggers SMS log
        $partner = User::factory()->create(['role' => 'community_partner', 'onboarding_completed_at' => now()]);
        $hub = CommunityServiceHub::create([
            'organization_name' => 'Kamwala Youth Hub',
            'hub_type' => 'youth_center',
            'address' => 'Plot 12 Kamwala Road, Lusaka',
            'latitude' => -15.4167,
            'longitude' => 28.2833,
            'contact_phone' => '+260977000111',
            'district' => 'Lusaka',
            'province' => 'Lusaka',
            'manager_user_id' => $partner->id,
            'verification_status' => 'verified',
        ]);

        $req = ProductAndEmergencyRequest::create([
            'user_id' => $girl->id,
            'assigned_hub_id' => $hub->id,
            'request_code' => 'REQ-SMS-01',
            'request_type' => 'free_monthly_pack',
            'status' => 'pending',
        ]);

        $this->actingAs($partner)
            ->post("/portal/partner/fulfill/{$req->id}", ['status' => 'ready_for_pickup'])
            ->assertRedirect();

        $this->assertDatabaseHas('sms_alert_logs', [
            'user_id' => $girl->id,
            'alert_type' => 'supply_pickup',
        ]);

        // Companion readiness command dispatches SMS when active companion exists
        $companion = User::factory()->create([
            'role' => 'trusted_contact',
            'phone' => '+260966443322',
            'onboarding_completed_at' => now(),
        ]);

        TrustedConnection::create([
            'primary_user_id' => $girl->id,
            'trusted_user_id' => $companion->id,
            'contact_name' => 'Mother',
            'contact_channel' => '+260966443322',
            'relationship' => 'mother',
            'invite_code' => 'MWZ-READYNOW',
            'status' => 'active',
            'permissions' => ['cycle_phase' => true, 'tips' => true, 'care_reminders' => true],
        ]);

        $this->artisan('mwezi:send-readiness-alerts --days=2')
            ->assertExitCode(0);

        $this->assertTrue(
            SmsAlertLog::where('user_id', $companion->id)
                ->where('alert_type', 'companion_readiness')
                ->exists()
        );
    }

    public function test_role_specific_registration_persists_role_metadata(): void
    {
        // 1. Primary user with age_band, province, district, pin_code
        $this->post('/register', [
            'name' => 'Mutinta Banda',
            'phone' => '+260977100200',
            'password' => 'SecretPass123!',
            'password_confirmation' => 'SecretPass123!',
            'role' => 'primary_user',
            'preferred_language' => 'bem',
            'age_band' => '14_17_secondary',
            'province' => 'Copperbelt',
            'district' => 'Kitwe',
            'pin_code' => '4321',
        ])->assertRedirect(route('onboarding.wizard', absolute: false));

        $girl = User::where('phone', '+260977100200')->firstOrFail();
        $this->assertEquals('Copperbelt', $girl->province);
        $this->assertEquals('Kitwe', $girl->district);
        $this->assertNotNull($girl->pin_code_hash);
        $this->assertDatabaseHas('cycle_profiles', [
            'user_id' => $girl->id,
            'age_band' => '14_17_secondary',
        ]);
        $this->post('/logout');

        // 2. Community partner creates pending CommunityServiceHub directly on register
        $this->post('/register', [
            'name' => 'Grace Mwamba',
            'email' => 'grace@kabwehub.zm',
            'password' => 'SecretPass123!',
            'password_confirmation' => 'SecretPass123!',
            'role' => 'community_partner',
            'organization_name' => 'Kabwe Girls Safe Space',
            'hub_type' => 'safe_space',
            'province' => 'Central',
            'district' => 'Kabwe',
            'address' => 'Plot 45 Independence Way',
        ])->assertRedirect(route('onboarding.wizard', absolute: false));

        $this->assertDatabaseHas('community_service_hubs', [
            'organization_name' => 'Kabwe Girls Safe Space',
            'hub_type' => 'safe_space',
            'verification_status' => 'pending',
        ]);
        $this->post('/logout');

        // 3. Health reviewer stores clinical specialty, HPCZ number, and review locales
        $this->post('/register', [
            'name' => 'Dr. Chanda Phiri',
            'email' => 'chanda@clinic.zm',
            'password' => 'SecretPass123!',
            'password_confirmation' => 'SecretPass123!',
            'role' => 'health_reviewer',
            'clinical_specialty' => 'Midwifery',
            'hpcz_registration_number' => 'HPCZ-ZM-9001',
            'review_locales' => ['en', 'nya'],
        ])->assertRedirect(route('onboarding.wizard', absolute: false));

        $reviewer = User::where('email', 'chanda@clinic.zm')->firstOrFail();
        $this->assertEquals('Midwifery', $reviewer->clinical_specialty);
        $this->assertEquals('HPCZ-ZM-9001', $reviewer->hpcz_registration_number);
        $this->assertEquals('pending', $reviewer->hpcz_verification_status);
        $this->post('/logout');

        // 4. Donor sponsor stores donor_default_anonymous
        $this->post('/register', [
            'name' => 'Bwalya Holdings',
            'phone' => '+260966888999',
            'password' => 'SecretPass123!',
            'password_confirmation' => 'SecretPass123!',
            'role' => 'donor_sponsor',
            'donor_default_anonymous' => true,
        ])->assertRedirect(route('onboarding.wizard', absolute: false));

        $this->assertDatabaseHas('users', [
            'phone' => '+260966888999',
            'role' => 'donor_sponsor',
            'donor_default_anonymous' => 1,
        ]);
    }

    public function test_primary_user_vital_menstrual_data_and_guardian_multi_tier_dependents(): void
    {
        // 1. Primary user registers with vital menstrual health data
        $lmp = now()->subDays(10)->toDateString();
        $this->post('/register', [
            'name' => 'Thandiwe Zulu',
            'phone' => '+260977334455',
            'password' => 'SecretPass123!',
            'password_confirmation' => 'SecretPass123!',
            'role' => 'primary_user',
            'age_band' => '14_17_secondary',
            'has_started_period' => true,
            'last_period_start' => $lmp,
            'average_cycle_length' => 29,
            'average_period_length' => 6,
            'cycle_regularity' => 'irregular',
            'typical_symptoms' => ['Cramps', 'Fatigue'],
            'preferred_product_type' => 'reusable_pads',
        ])->assertRedirect(route('onboarding.wizard', absolute: false));

        $girl = User::where('phone', '+260977334455')->firstOrFail();
        $profile = CycleProfile::where('user_id', $girl->id)->firstOrFail();
        $this->assertTrue($profile->has_started_period);
        $this->assertEquals(29, $profile->average_cycle_length);
        $this->assertEquals(6, $profile->average_period_length);
        $this->assertEquals('irregular', $profile->cycle_regularity);
        $this->assertEquals(['Cramps', 'Fatigue'], $profile->typical_symptoms);
        $this->assertEquals('reusable_pads', $profile->preferred_product_type);
        $this->assertDatabaseHas('cycle_predictions', ['user_id' => $girl->id]);
        $this->post('/logout');

        // 2. Guardian provisions Tier 1 (10-14) sub-account and Tier 2 (15-19) consent invite
        $guardian = User::factory()->create(['role' => 'trusted_contact', 'onboarding_completed_at' => now()]);

        $this->actingAs($guardian)->post('/trusted-circle/dependents', [
            'tier' => 'tier_1_10_14',
            'child_name' => 'Luyando',
            'child_age' => 12,
            'username' => 'luyando_12',
            'pin_code' => '2468',
            'luna_ai_level' => 'guided',
            'emergency_alerts' => true,
            'tip_sharing' => true,
        ])->assertRedirect();

        $this->assertDatabaseHas('users', [
            'name' => 'Luyando',
            'username' => 'luyando_12',
            'role' => 'primary_user',
        ]);

        $this->actingAs($guardian)->post('/trusted-circle/dependents', [
            'tier' => 'tier_2_15_19',
            'child_name' => 'Chisomo',
            'child_age' => 16,
            'contact_channel' => '+260977998877',
        ])->assertRedirect();

        $this->assertDatabaseHas('trusted_connections', [
            'contact_name' => 'Chisomo',
            'status' => 'invited',
            'relationship' => 'guardian',
        ]);
    }

    public function test_ages_10_to_13_blocked_from_self_registration_and_managed_via_parent_panel(): void
    {
        // 1. Direct self-registration for 10-13 is rejected
        $this->post('/register', [
            'name' => 'Young Girl',
            'phone' => '+260977111222',
            'password' => 'SecretPass123!',
            'password_confirmation' => 'SecretPass123!',
            'role' => 'primary_user',
            'age_band' => '10_13_early_teen',
        ])->assertSessionHasErrors('age_band');

        // 2. Parent / Guardian registration panel provisions 10-13 child & redirects to Companion Hub
        $this->post('/register', [
            'name' => 'Mrs. Mutale',
            'phone' => '+260977222333',
            'password' => 'SecretPass123!',
            'password_confirmation' => 'SecretPass123!',
            'role' => 'parent_guardian',
            'province' => 'Lusaka',
            'district' => 'Kafue',
            'child_tier_group' => 'tier_1',
            'child_name' => 'Tasha',
            'child_age' => 11,
            'child_username' => 'tasha_11',
            'child_pin_code' => '1357',
            'luna_ai_level' => 'guided',
            'emergency_alerts' => true,
            'tip_sharing' => true,
        ])->assertRedirect(route('trusted-circle.companion', absolute: false));

        $this->assertDatabaseHas('users', [
            'phone' => '+260977222333',
            'role' => 'trusted_contact',
            'district' => 'Kafue',
        ]);

        $child = User::where('username', 'tasha_11')->firstOrFail();
        $this->assertEquals('primary_user', $child->role);
        $this->assertNotNull($child->pin_code_hash);
        $this->assertDatabaseHas('cycle_profiles', [
            'user_id' => $child->id,
            'age_band' => '10_13_early_teen',
        ]);
    }

    public function test_per_tier_feature_gates_enforce_safeguarding_policies(): void
    {
        $topic = CommunityTopic::create([
            'name' => 'Open Youth Forum',
            'slug' => 'open-youth-forum',
            'description' => 'General discussion',
            'audience_scope' => 'open_community',
            'sort_order' => 1,
        ]);

        // Tier 1 (10-13): blocked from community & donations, luna_ai_level defaults to restricted/guided
        $tier1 = User::factory()->create(['role' => 'primary_user', 'onboarding_completed_at' => now()]);
        CycleProfile::create(['user_id' => $tier1->id, 'age_band' => '10_13_early_teen']);

        $this->actingAs($tier1)->get('/community')->assertRedirect('/dashboard');
        $this->actingAs($tier1)->get('/support/sponsor')->assertRedirect('/dashboard');
        $this->actingAs($tier1)->post('/community/posts', [
            'topic_id' => $topic->id,
            'title' => 'Test',
            'body' => 'Body',
        ])->assertStatus(403);
        $this->actingAs($tier1)->post('/sponsor', [
            'donation_type' => 'reusable_pad_pack',
            'amount_zmw' => 150,
            'payment_method' => 'broadpay_momo',
        ])->assertStatus(403);

        // Tier 2 (14-17 minor): allowed community, blocked from direct donations, sponsor portal & dependent provisioning
        $tier2 = User::factory()->create(['role' => 'primary_user', 'onboarding_completed_at' => now()]);
        CycleProfile::create(['user_id' => $tier2->id, 'age_band' => '14_17_secondary']);

        $this->actingAs($tier2)->get('/community')->assertStatus(200);
        $this->actingAs($tier2)->get('/support/sponsor')->assertRedirect('/dashboard');
        $this->actingAs($tier2)->post('/trusted-circle/dependents', [
            'tier' => 'tier_1_10_14',
            'child_name' => 'Blocked',
        ])->assertStatus(403);
        $this->actingAs($tier2)->post('/sponsor', [
            'donation_type' => 'reusable_pad_pack',
            'amount_zmw' => 150,
            'payment_method' => 'broadpay_momo',
        ])->assertStatus(403);
        $tier2Policy = $tier2->fresh()->tierPolicy();
        $this->assertFalse($tier2Policy['can_view_fertility_analytics']);
        $this->assertFalse($tier2Policy['can_export_cycle_data']);

        // Tier 4B (community_partner): blocked from public community posting
        $partner = User::factory()->create(['role' => 'community_partner', 'onboarding_completed_at' => now()]);
        $this->actingAs($partner)->post('/community/posts', [
            'topic_id' => $topic->id,
            'title' => 'Partner Post',
            'body' => 'Should be blocked',
        ])->assertStatus(403);

        // Tier 3 (18-24+): full access policy
        $tier3 = User::factory()->create(['role' => 'primary_user', 'onboarding_completed_at' => now()]);
        CycleProfile::create(['user_id' => $tier3->id, 'age_band' => '18_24_young_adult']);
        $policy = $tier3->fresh()->tierPolicy();
        $this->assertTrue($policy['can_access_community']);
        $this->assertTrue($policy['can_post_community']);
        $this->assertTrue($policy['can_donate']);
        $this->assertEquals('full', $policy['luna_ai_level']);
    }

    public function test_tracker_visibility_respects_tier1_menarche_gender_and_shared_consent(): void
    {
        // 1. Tier 1 pre-menarche: no personal tracker UI
        $tier1Pre = User::factory()->create(['role' => 'primary_user', 'gender' => 'female', 'has_personal_cycle' => true, 'onboarding_completed_at' => now()]);
        CycleProfile::create(['user_id' => $tier1Pre->id, 'age_band' => '10_13_early_teen', 'has_started_period' => false]);
        $this->assertFalse($tier1Pre->fresh()->tierPolicy()['can_use_personal_tracker']);
        $this->actingAs($tier1Pre)->get('/cycle')->assertRedirect('/dashboard');

        // 2. Tier 1 post-menarche: personal tracker unlocked
        $tier1Post = User::factory()->create(['role' => 'primary_user', 'gender' => 'female', 'has_personal_cycle' => true, 'onboarding_completed_at' => now()]);
        CycleProfile::create(['user_id' => $tier1Post->id, 'age_band' => '10_13_early_teen', 'has_started_period' => true]);
        $this->assertTrue($tier1Post->fresh()->tierPolicy()['can_use_personal_tracker']);
        $this->actingAs($tier1Post)->get('/cycle')->assertStatus(200);

        // 3. Female parent still going through cycles: keeps personal tracker
        $femaleParentActive = User::factory()->create(['role' => 'trusted_contact', 'gender' => 'female', 'has_personal_cycle' => true, 'onboarding_completed_at' => now()]);
        $this->assertTrue($femaleParentActive->fresh()->tierPolicy()['can_use_personal_tracker']);

        // 4. Female parent past cycle age: no personal tracker
        $femaleParentPast = User::factory()->create(['role' => 'trusted_contact', 'gender' => 'female', 'has_personal_cycle' => false, 'onboarding_completed_at' => now()]);
        $this->assertFalse($femaleParentPast->fresh()->tierPolicy()['can_use_personal_tracker']);
        $this->actingAs($femaleParentPast)->get('/cycle')->assertRedirect('/dashboard');

        // 5. Male parent/partner/clinician: no personal tracker, only views shared tracker if child/partner consents
        $maleGuardian = User::factory()->create(['role' => 'trusted_contact', 'gender' => 'male', 'has_personal_cycle' => false, 'onboarding_completed_at' => now()]);
        $this->assertFalse($maleGuardian->fresh()->tierPolicy()['can_use_personal_tracker']);
        $this->assertFalse($maleGuardian->fresh()->tierPolicy()['can_view_shared_tracker']);

        TrustedConnection::create([
            'primary_user_id' => $tier1Post->id,
            'trusted_user_id' => $maleGuardian->id,
            'invite_code' => 'MWZ-DAD-01',
            'contact_name' => $maleGuardian->name,
            'contact_channel' => '+260977000010',
            'relationship' => 'father',
            'status' => 'active',
            'permissions' => ['cycle_phase' => true, 'tips' => true],
        ]);

        $dadPolicy = $maleGuardian->fresh()->tierPolicy();
        $this->assertFalse($dadPolicy['can_use_personal_tracker']);
        $this->assertTrue($dadPolicy['can_view_shared_tracker']);
        $this->assertEquals("Your Child's Tracker", $dadPolicy['shared_tracker_label']);
        $this->actingAs($maleGuardian)->get('/cycle')->assertRedirect('/trusted-circle/companion');
    }
}
