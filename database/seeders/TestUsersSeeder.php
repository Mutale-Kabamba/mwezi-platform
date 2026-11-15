<?php

namespace Database\Seeders;

use App\Models\CommunityServiceHub;
use App\Models\CyclePrediction;
use App\Models\CycleProfile;
use App\Models\TrustedConnection;
use App\Models\User;
use App\Models\UserPrivacySetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        // 1. Primary User - Tier 1 (Ages 10-13, Parent-Managed)
        $tier1 = User::updateOrCreate(
            ['username' => 'mutinta_t1'],
            [
                'name' => 'Mutinta Phiri (Tier 1)',
                'email' => 'tier1@mwezi.org',
                'phone' => '+260971000001',
                'password' => $password,
                'pin_code_hash' => Hash::make('1111'),
                'role' => 'primary_user',
                'preferred_language' => 'en',
                'province' => 'Lusaka',
                'district' => 'Lusaka',
                'onboarding_completed_at' => now(),
            ]
        );
        $this->ensureDefaults($tier1, '10_13_early_teen', false);

        // 2. Primary User - Tier 2 (Ages 14-17)
        $tier2 = User::updateOrCreate(
            ['email' => 'natasha@mwezi.org'],
            [
                'name' => 'Natasha Banda (Tier 2)',
                'username' => 'natashab',
                'phone' => '+260971234567',
                'password' => $password,
                'pin_code_hash' => Hash::make('1234'),
                'role' => 'primary_user',
                'preferred_language' => 'en',
                'province' => 'Lusaka',
                'district' => 'Lusaka',
                'onboarding_completed_at' => now(),
            ]
        );
        $this->ensureDefaults($tier2, '14_17_secondary', true);

        // 3. Primary User - Tier 3 (Ages 18-24+)
        $tier3 = User::updateOrCreate(
            ['email' => 'mwila@mwezi.org'],
            [
                'name' => 'Mwila Chanda (Tier 3)',
                'username' => 'mwilac',
                'phone' => '+260971000003',
                'password' => $password,
                'role' => 'primary_user',
                'preferred_language' => 'bem',
                'province' => 'Copperbelt',
                'district' => 'Kitwe',
                'onboarding_completed_at' => now(),
            ]
        );
        $this->ensureDefaults($tier3, '18_24_young_adult', true);

        // 4. Parent / Guardian (Tier 4A)
        $parent = User::updateOrCreate(
            ['email' => 'parent@mwezi.org'],
            [
                'name' => 'Mrs. Grace Phiri (Parent)',
                'username' => 'grace_parent',
                'phone' => '+260977000004',
                'password' => $password,
                'role' => 'trusted_contact',
                'preferred_language' => 'en',
                'province' => 'Lusaka',
                'district' => 'Lusaka',
                'onboarding_completed_at' => now(),
            ]
        );
        $this->ensureDefaults($parent, '25_plus', true);

        TrustedConnection::updateOrCreate(
            [
                'primary_user_id' => $tier1->id,
                'trusted_user_id' => $parent->id,
            ],
            [
                'invite_code' => 'MWZ-T1-DEMO1',
                'contact_name' => $parent->name,
                'contact_channel' => $parent->phone,
                'relationship' => 'guardian',
                'status' => 'active',
                'permissions' => [
                    'tier' => 'tier_1_10_13',
                    'child_age' => 12,
                    'luna_ai_level' => 'guided',
                    'emergency_alerts' => true,
                    'tip_sharing' => true,
                    'cycle_phase' => true,
                    'tips' => true,
                    'care_reminders' => true,
                ],
            ]
        );

        // 5. Trusted Companion
        $companion = User::updateOrCreate(
            ['email' => 'chileshe@mwezi.org'],
            [
                'name' => 'Chileshe Banda (Companion)',
                'username' => 'chilesheb',
                'phone' => '+260977654321',
                'password' => $password,
                'role' => 'trusted_contact',
                'preferred_language' => 'bem',
                'province' => 'Lusaka',
                'district' => 'Lusaka',
                'onboarding_completed_at' => now(),
            ]
        );
        $this->ensureDefaults($companion, '25_plus', true);

        // 6. Community Partner (Hub Manager)
        $partner = User::updateOrCreate(
            ['email' => 'partner@playitforward.org'],
            [
                'name' => 'Sister Mary Phiri (Partner)',
                'username' => 'maryphiri',
                'phone' => '+260965112233',
                'password' => $password,
                'role' => 'community_partner',
                'preferred_language' => 'nya',
                'province' => 'Lusaka',
                'district' => 'Lusaka',
                'onboarding_completed_at' => now(),
            ]
        );
        $this->ensureDefaults($partner, '25_plus', true);

        CommunityServiceHub::updateOrCreate(
            ['manager_user_id' => $partner->id],
            [
                'organization_name' => 'Play It Forward Zambia Hub',
                'hub_type' => 'ngo',
                'province' => 'Lusaka',
                'district' => 'Lusaka',
                'address' => 'Plot 14B, Kabulonga Road, Lusaka',
                'latitude' => -15.4244,
                'longitude' => 28.3219,
                'contact_phone' => '+260965112233',
                'operating_hours' => 'Mon - Fri: 08:00 - 16:30',
                'offers_free_pads' => true,
                'offers_emergency_kits' => true,
                'offers_reusable_pads' => true,
                'offers_health_referrals' => true,
                'free_pads_qty' => 150,
                'emergency_kits_qty' => 60,
                'current_reusable_pads_stock' => 80,
                'verification_status' => 'verified',
            ]
        );

        // 7. Health Reviewer (HPCZ Clinician)
        $reviewer = User::updateOrCreate(
            ['email' => 'dr.mwamba@mwezi.org'],
            [
                'name' => 'Dr. Mwamba Tembo (Reviewer)',
                'username' => 'drmwamba',
                'phone' => '+260955998877',
                'password' => $password,
                'role' => 'health_reviewer',
                'preferred_language' => 'en',
                'province' => 'Lusaka',
                'district' => 'Lusaka',
                'clinical_specialty' => 'Adolescent & Reproductive Health',
                'hpcz_registration_number' => 'HPCZ-ZM-2048',
                'hpcz_verification_status' => 'verified',
                'hpcz_verified_at' => now(),
                'review_locales' => ['en', 'bem', 'nya'],
                'onboarding_completed_at' => now(),
            ]
        );
        $this->ensureDefaults($reviewer, '25_plus', true);

        // 8. Donor / Sponsor
        $donor = User::updateOrCreate(
            ['email' => 'sarah.jenkins@globalgiving.org'],
            [
                'name' => 'Sarah Jenkins (Sponsor)',
                'username' => 'sarahj',
                'phone' => '+260977000008',
                'password' => $password,
                'role' => 'donor_sponsor',
                'preferred_language' => 'en',
                'donor_default_anonymous' => false,
                'onboarding_completed_at' => now(),
            ]
        );
        $this->ensureDefaults($donor, '25_plus', true);

        // 9. System Administrator
        $admin = User::updateOrCreate(
            ['email' => 'admin@mwezi.org'],
            [
                'name' => 'Mwezi System Admin',
                'username' => 'mwezi_admin',
                'phone' => '+260977000009',
                'password' => $password,
                'role' => 'admin',
                'admin_scope' => 'System_SuperAdmin',
                'preferred_language' => 'en',
                'province' => 'Lusaka',
                'district' => 'Lusaka',
                'onboarding_completed_at' => now(),
            ]
        );
        $this->ensureDefaults($admin, '25_plus', true);
    }

    private function ensureDefaults(User $user, string $ageBand, bool $hasStarted): void
    {
        UserPrivacySetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'allow_anonymous_forum_default' => true,
                'share_cycle_with_trusted' => $ageBand === '10_13_early_teen',
                'share_symptoms_with_trusted' => false,
                'receive_discreet_notifications' => true,
                'data_retention_consent_at' => now(),
            ]
        );

        $lmp = $hasStarted ? now()->subDays(12)->toDateString() : null;

        CycleProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'age_band' => $ageBand,
                'has_started_period' => $hasStarted,
                'average_cycle_length' => $ageBand === '10_13_early_teen' ? 32 : 28,
                'average_period_length' => 5,
                'cycle_regularity' => 'regular',
                'typical_symptoms' => $hasStarted ? ['Cramps', 'Fatigue'] : [],
                'preferred_product_type' => 'disposable_pads',
                'last_period_start' => $lmp,
            ]
        );

        if ($lmp) {
            CyclePrediction::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'predicted_start_date' => now()->addDays(16)->toDateString(),
                    'predicted_end_date' => now()->addDays(21)->toDateString(),
                    'confidence_score' => 0.90,
                ]
            );
        }
    }
}

