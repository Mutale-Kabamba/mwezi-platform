<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\UserPrivacySetting;
use App\Models\TrustedConnection;
use App\Models\CycleProfile;
use App\Models\CycleLog;
use App\Models\CyclePrediction;
use App\Models\EducationalCategory;
use App\Models\EducationalResource;
use App\Models\EducationalResourceTranslation;
use App\Models\MythAndFact;
use App\Models\UserLearningProgress;
use App\Models\LunaKnowledgeChunk;
use App\Models\CommunityServiceHub;
use App\Models\MenstrualProductCatalog;
use App\Models\ProductAndEmergencyRequest;
use App\Models\SponsorshipCampaign;
use App\Models\Donation;
use App\Models\HealthReferral;
use App\Models\CommunityTopic;
use App\Models\CommunityPost;
use App\Models\CommunityComment;
use App\Models\Faq;
use App\Models\SupportTicket;
use App\Models\MeImpactEvent;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. CREATE ALL 6 ROLES WITH TEST ACCOUNTS
        $primaryUser = User::create([
            'name' => 'Natasha Banda',
            'username' => 'natashab',
            'email' => 'natasha@mwezi.org',
            'phone' => '+260971234567',
            'password' => Hash::make('password'),
            'role' => 'primary_user',
            'preferred_language' => 'en',
            'bio' => 'Secondary school student in Lusaka. Passionate about health education and sports.',
            'discreet_mode_enabled' => false,
            'pin_code_hash' => Hash::make('1234'),
        ]);

        $trustedContact = User::create([
            'name' => 'Chileshe Banda',
            'username' => 'chilesheb',
            'email' => 'chileshe@mwezi.org',
            'phone' => '+260977654321',
            'password' => Hash::make('password'),
            'role' => 'trusted_contact',
            'preferred_language' => 'bem',
            'bio' => 'Supportive older sister and mentor.',
        ]);

        $communityPartner = User::create([
            'name' => 'Sister Mary Phiri',
            'username' => 'maryphiri',
            'email' => 'partner@playitforward.org',
            'phone' => '+260965112233',
            'password' => Hash::make('password'),
            'role' => 'community_partner',
            'preferred_language' => 'nya',
            'bio' => 'Program Coordinator at Play It Forward Zambia (Community Hub & Sports Outreach).',
        ]);

        $healthReviewer = User::create([
            'name' => 'Dr. Mwamba Tembo',
            'username' => 'drmwamba',
            'email' => 'dr.mwamba@mwezi.org',
            'phone' => '+260955998877',
            'password' => Hash::make('password'),
            'role' => 'health_reviewer',
            'preferred_language' => 'en',
            'bio' => 'Adolescent & Reproductive Health Specialist, Lusaka Apex Medical University.',
        ]);

        $donorSponsor = User::create([
            'name' => 'Sarah Jenkins',
            'username' => 'sarahj',
            'email' => 'sarah.jenkins@globalgiving.org',
            'phone' => '+447700900123',
            'password' => Hash::make('password'),
            'role' => 'donor_sponsor',
            'preferred_language' => 'en',
            'bio' => 'International dignity partner supporting girl child education in Sub-Saharan Africa.',
        ]);

        $adminUser = User::create([
            'name' => 'Mwezi Core Team',
            'username' => 'mweziadmin',
            'email' => 'admin@mwezi.org',
            'phone' => '+260979000111',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'preferred_language' => 'en',
            'bio' => 'Platform administration, safeguarding and monitoring & evaluation.',
        ]);

        // 2. PRIVACY & TRUSTED CIRCLE SETUP
        UserPrivacySetting::create([
            'user_id' => $primaryUser->id,
            'allow_anonymous_forum_default' => true,
            'share_cycle_with_trusted' => true,
            'share_symptoms_with_trusted' => true,
            'receive_discreet_notifications' => true,
            'data_retention_consent_at' => now(),
        ]);

        TrustedConnection::create([
            'primary_user_id' => $primaryUser->id,
            'trusted_user_id' => $trustedContact->id,
            'invite_code' => 'MWEZI-7749-BAND',
            'contact_name' => 'Chileshe Banda',
            'contact_channel' => 'chileshe@mwezi.org',
            'relationship' => 'sibling',
            'permissions' => ['cycle_phase', 'care_reminders', 'support_tips'],
            'status' => 'active',
        ]);

        // 3. CYCLE ENGINE DATA (PROFILE, HISTORICAL LOGS & PREDICTION)
        $lastPeriod = Carbon::now()->subDays(12);
        CycleProfile::create([
            'user_id' => $primaryUser->id,
            'average_cycle_length' => 28,
            'average_period_length' => 5,
            'last_period_start' => $lastPeriod->toDateString(),
            'contraceptive_or_health_notes' => 'Using mild iron supplement during heavy days. Regular 28-day cycle rhythm.',
        ]);

        // Seed 5 consecutive days of last period
        $intensities = ['heavy', 'heavy', 'medium', 'light', 'spotting'];
        for ($i = 0; $i < 5; $i++) {
            $logDate = (clone $lastPeriod)->addDays($i);
            CycleLog::create([
                'user_id' => $primaryUser->id,
                'logged_date' => $logDate->toDateString(),
                'flow_intensity' => $intensities[$i],
                'symptoms' => ['Mild abdominal cramps', 'Tender breasts', 'Lower back ache'],
                'moods' => ['Reflective', 'Calm', 'Fatigued'],
                'pad_changes_count' => ($i < 2 ? 4 : 3),
                'private_notes' => 'Drank warm ginger tea and rested in the afternoon.',
            ]);
        }

        // Add today's log (follicular/approaching ovulation)
        CycleLog::create([
            'user_id' => $primaryUser->id,
            'logged_date' => Carbon::now()->toDateString(),
            'flow_intensity' => 'none',
            'symptoms' => ['High energy', 'Clear skin'],
            'moods' => ['Confident', 'Optimistic'],
            'pad_changes_count' => 0,
            'private_notes' => 'Feeling active and energized today.',
        ]);

        // Prediction for upcoming cycle
        $nextPeriodStart = (clone $lastPeriod)->addDays(28);
        $nextPeriodEnd = (clone $nextPeriodStart)->addDays(5);
        $ovulationStart = (clone $lastPeriod)->addDays(13);
        $ovulationEnd = (clone $lastPeriod)->addDays(16);

        CyclePrediction::create([
            'user_id' => $primaryUser->id,
            'predicted_start_date' => $nextPeriodStart->toDateString(),
            'predicted_end_date' => $nextPeriodEnd->toDateString(),
            'ovulation_window' => [
                'start' => $ovulationStart->toDateString(),
                'peak' => (clone $lastPeriod)->addDays(14)->toDateString(),
                'end' => $ovulationEnd->toDateString(),
            ],
            'confidence_score' => 0.92,
        ]);

        // 4. CMS CATEGORIES & ARTICLES (WITH REUSABLE PAD GUIDE)
        $catBiology = EducationalCategory::create([
            'name' => 'Menstrual Biology',
            'slug' => 'menstrual-biology',
            'icon' => 'Sparkles',
            'description' => 'Demystifying your menstrual phases, hormones, and bodily changes.',
            'sort_order' => 1,
        ]);

        $catHygiene = EducationalCategory::create([
            'name' => 'Menstrual Hygiene Guidance',
            'slug' => 'hygiene-guidance',
            'icon' => 'Heart',
            'description' => 'Safe, comfortable, and infection-free menstrual care practices.',
            'sort_order' => 2,
        ]);

        $catReusable = EducationalCategory::create([
            'name' => 'Reusable Pad Care & Washing',
            'slug' => 'reusable-pad-care',
            'icon' => 'Package',
            'description' => 'Complete steps on washing, drying in dignity, and maintaining reusable pads.',
            'sort_order' => 3,
        ]);

        $catMyths = EducationalCategory::create([
            'name' => 'Myths & Facts',
            'slug' => 'myths-and-facts',
            'icon' => 'CheckCircle2',
            'description' => 'Busting traditional taboos and harmful stigma with scientific facts.',
            'sort_order' => 4,
        ]);

        $catFamily = EducationalCategory::create([
            'name' => 'Family & Partner Support',
            'slug' => 'family-partner-support',
            'icon' => 'Users',
            'description' => 'How parents, brothers, and partners can create supportive, stigma-free homes.',
            'sort_order' => 5,
        ]);

        // Articles
        $artBiology = EducationalResource::create([
            'category_id' => $catBiology->id,
            'author_id' => $healthReviewer->id,
            'reviewed_by_health_pro_id' => $healthReviewer->id,
            'review_status' => 'approved',
            'format' => 'article',
            'title' => 'Understanding the 4 Phases of Your Menstrual Cycle',
            'slug' => 'understanding-4-phases-menstrual-cycle',
            'summary' => 'From Menstruation to the Luteal phase: learn what happens inside your body, how hormones fluctuate, and why your energy shifts.',
            'body_content' => "## The Rhythm of Your Body\n\nMenstruation is a healthy, natural vital sign of female reproductive health. Every menstrual cycle is divided into four distinct phases:\n\n### 1. Menstrual Phase (Days 1–5)\nThe cycle begins when the uterus sheds its inner lining (endometrium). Progesterone and estrogen are at baseline levels. Prioritize rest, hydration, and gentle nourishment.\n\n### 2. Follicular Phase (Days 1–13)\nFollicle Stimulating Hormone (FSH) prompts the ovaries to mature eggs. Estrogen begins to climb, boosting natural stamina, optimism, and mental clarity.\n\n### 3. Ovulation Window (Days 14–16)\nA surge in Luteinizing Hormone (LH) triggers the release of an egg. This is your peak energy and fertility window.\n\n### 4. Luteal Phase (Days 15–28)\nThe corpus luteum produces progesterone to prepare the uterus. If pregnancy does not occur, progesterone drops, signaling your body to renew the cycle.\n\n> Remember: No two bodies are identical. Cycles between 21 and 35 days are normal and healthy.",
            'read_time_minutes' => 4,
            'is_featured' => true,
            'offline_cacheable' => true,
        ]);

        $artReusable = EducationalResource::create([
            'category_id' => $catReusable->id,
            'author_id' => $communityPartner->id,
            'reviewed_by_health_pro_id' => $healthReviewer->id,
            'review_status' => 'approved',
            'format' => 'step_by_step_guide',
            'title' => 'Step-by-Step Guide: Washing, Sanitizing & Drying Reusable Pads in Dignity',
            'slug' => 'washing-drying-reusable-pads-in-dignity',
            'summary' => 'Eco-friendly, affordable, and durable: follow these 4 proven steps to wash and dry cloth pads safely without infections.',
            'body_content' => "## The Golden Rules of Reusable Pad Care\n\nReusable sanitary pads provide dependable dignity for 12–24 months when cared for properly.\n\n### Step 1: Pre-Soak in Cold Water (Never Hot)\nAlways soak used pads in **cold or lukewarm water** for 15–30 minutes before washing. Hot water bakes proteins and causes blood stains to set into fabric.\n\n### Step 2: Wash with Gentle Soap\nRub with mild bar soap or laundry detergent. Rub gently between your palms to extract all flow from absorbent core layers. Do not use chlorine bleach, as harsh chemicals degrade cotton fibers and cause skin irritation.\n\n### Step 3: Rinse Until Water Runs Clear\nRinse thoroughly in clean water to eliminate all soap residue. Any leftover soap trapped inside the core can cause vaginal itching or pH imbalances.\n\n### Step 4: Dry in Direct Sunlight with Dignity\n**Direct sunlight is a natural antibacterial sanitizer.** Hang pads openly in sunlight. Do not hide damp pads under beds or damp cupboards where mildew and bacteria multiply.\n\n### Step 5: Store in a Dry, Breathable Cloth Pouch\nOnce 100% bone-dry, fold and store in a clean cotton bag ready for your next cycle.",
            'read_time_minutes' => 5,
            'is_featured' => true,
            'offline_cacheable' => true,
        ]);

        $artHygiene = EducationalResource::create([
            'category_id' => $catHygiene->id,
            'author_id' => $healthReviewer->id,
            'reviewed_by_health_pro_id' => $healthReviewer->id,
            'review_status' => 'approved',
            'format' => 'article',
            'title' => 'Hygiene at School: Managing Your Period with Confidence and Privacy',
            'slug' => 'hygiene-at-school-confidence-privacy',
            'summary' => 'Practical tips for carrying emergency pads, hand hygiene, and talking to your school matron or focal teacher.',
            'body_content' => "## You Belong in School Every Day of the Month\n\nNo girl should miss class because of her period. Here are practical ways to navigate school days:\n\n1. **Prepare an Emergency Dignity Kit:** Keep two clean pads, a small plastic bag for disposal or storing a used reusable pad, and spare undergarments in your schoolbag.\n2. **Change Every 4–6 Hours:** Regular changes prevent leaks, chafing, and bacterial growth.\n3. **Locate Your School Matron / Focal Teacher:** Most partner schools have verified Mwezi emergency stocks.",
            'read_time_minutes' => 3,
            'is_featured' => false,
            'offline_cacheable' => true,
        ]);

        $artPartner = EducationalResource::create([
            'category_id' => $catFamily->id,
            'author_id' => $communityPartner->id,
            'reviewed_by_health_pro_id' => $healthReviewer->id,
            'review_status' => 'approved',
            'format' => 'article',
            'title' => 'A Guide for Fathers, Brothers & Partners: How to Support Women with Dignity',
            'slug' => 'guide-fathers-brothers-partners-period-support',
            'summary' => 'Actionable ways men can normalize menstrual conversations, provide supply kits, and end period stigma at home.',
            'body_content' => "## Periods Are a Sign of Life, Not Shame\n\nMenstrual health is a family and community responsibility. Men and boys play a vital role:\n\n- **Never mock or tease:** Menstrual jokes foster fear and isolation. Speak respectfully about bodily health.\n- **Support monthly supplies:** Prioritize pads and soap alongside household food budgets.\n- **Offer comfort during painful days:** Provide warm water, pain relief, and help with chores.",
            'read_time_minutes' => 3,
            'is_featured' => false,
            'offline_cacheable' => true,
        ]);

        // Translations (Bemba & Nyanja for key articles)
        EducationalResourceTranslation::create([
            'resource_id' => $artReusable->id,
            'locale' => 'bem',
            'translated_title' => 'Ifyakucita pa Kusamba no Kuyanika Amapadi ya Kusambilamo',
            'translated_summary' => 'Inshila sha busaka no mute pa kusamba amapadi ayakubomfya libili libili ukwabula ukonaula umubili.',
            'translated_body' => "Amapadi yabubomfi bwakubwekeshapo yali ayasuma nga nshi ku busaka bwabwanakashi. Bomfyeni amenshi yatalala pakutendeka, sapo yawamisha, elyo yanikeni pamenshi yakabanga kuli akasuba pantu akasuba kalepaya tushishi tonse utubi.",
        ]);

        // 5. MYTHS & FACTS
        $myths = [
            [
                'myth' => 'Girls should not cook or touch food when having their period because food will spoil.',
                'fact' => 'Menstrual blood is clean and natural. Standard hand hygiene before cooking is all that is required. Period flow has zero impact on food preservation.',
            ],
            [
                'myth' => 'Drinking cold water during menstruation stops or clots the flow.',
                'fact' => 'Hydration is crucial. Drinking water—cold or warm—travels to your digestive tract, not your uterus. It helps relieve headaches and bloating.',
            ],
            [
                'myth' => 'Exercising or running during your period damages your reproductive organs.',
                'fact' => 'Physical exercise triggers endorphins which naturally soothe pelvic cramps and elevate your mood. Gentle sports and walking are highly beneficial.',
            ],
            [
                'myth' => 'Reusable cloth pads cause severe infections.',
                'fact' => 'Cloth pads are completely safe and hygienic when washed with soap, rinsed thoroughly, and dried completely in direct sunlight.',
            ],
        ];

        foreach ($myths as $m) {
            MythAndFact::create([
                'category_id' => $catMyths->id,
                'verified_by_id' => $healthReviewer->id,
                'myth_statement' => $m['myth'],
                'fact_explanation' => $m['fact'],
                'locale' => 'en',
            ]);
        }

        // Learning progress
        UserLearningProgress::create([
            'user_id' => $primaryUser->id,
            'resource_id' => $artReusable->id,
            'progress_percent' => 100,
            'quiz_score' => 100,
            'bookmarked' => true,
            'completed_at' => now(),
        ]);

        UserLearningProgress::create([
            'user_id' => $primaryUser->id,
            'resource_id' => $artBiology->id,
            'progress_percent' => 60,
            'quiz_score' => null,
            'bookmarked' => true,
            'completed_at' => null,
        ]);

        // 6. LUNA AI KNOWLEDGE CHUNKS (RAG CITATIONS)
        LunaKnowledgeChunk::create([
            'resource_id' => $artBiology->id,
            'chunk_text' => 'The menstrual cycle consists of 4 phases: Menstrual (days 1-5), Follicular (days 1-13), Ovulatory (days 14-16), and Luteal (days 15-28). Normal cycles range between 21 and 35 days.',
            'topic_tags' => ['cycle_phases', 'biology', 'ovulation', 'menstruation'],
            'approved_for_ai' => true,
        ]);

        LunaKnowledgeChunk::create([
            'resource_id' => $artReusable->id,
            'chunk_text' => 'Reusable pads must be pre-soaked in cold water for 15-30 minutes, washed with mild soap without chlorine bleach, rinsed thoroughly, and dried in direct sunlight which acts as a natural disinfectant.',
            'topic_tags' => ['reusable_pads', 'washing', 'hygiene', 'sunlight_drying'],
            'approved_for_ai' => true,
        ]);

        LunaKnowledgeChunk::create([
            'resource_id' => $artHygiene->id,
            'chunk_text' => 'Severe dysmenorrhea (debilitating menstrual cramps) that prevents daily function, heavy bleeding soaking through more than one pad per hour for consecutive hours, or foul-smelling discharge requires medical clinic consultation.',
            'topic_tags' => ['clinical_escalation', 'severe_pain', 'hemorrhage', 'referral'],
            'approved_for_ai' => true,
        ]);

        // 7. REALISTIC ZAMBIAN COMMUNITY SERVICE HUBS
        $hubs = [
            [
                'name' => 'Play It Forward Community Youth Hub',
                'type' => 'ngo',
                'province' => 'Lusaka',
                'district' => 'Lusaka Central',
                'address' => 'Plot 24, Nationalist Way, near Chilenje Youth Grounds',
                'lat' => -15.438500,
                'lng' => 28.322800,
                'phone' => '+260971100200',
                'hours' => 'Mon-Sat 08:30 - 17:30',
                'free_pads' => true,
                'emergency_kits' => true,
                'reusable_pads' => true,
                'health_referrals' => true,
                'pad_stock' => 'in_stock',
                'kit_stock' => 'in_stock',
                'languages' => ['English', 'Bemba', 'Nyanja'],
                'manager_id' => $communityPartner->id,
            ],
            [
                'name' => 'Matero Community School & Safe Space',
                'type' => 'school',
                'province' => 'Lusaka',
                'district' => 'Matero',
                'address' => 'Commonwealth Avenue, Matero Sub-Center',
                'lat' => -15.385200,
                'lng' => 28.258400,
                'phone' => '+260965334455',
                'hours' => 'Mon-Fri 07:30 - 16:30',
                'free_pads' => true,
                'emergency_kits' => true,
                'reusable_pads' => true,
                'health_referrals' => true,
                'pad_stock' => 'in_stock',
                'kit_stock' => 'in_stock',
                'languages' => ['English', 'Nyanja', 'Bemba'],
                'manager_id' => null,
            ],
            [
                'name' => 'Kanyama Adolescent Friendly Clinic Hub',
                'type' => 'clinic',
                'province' => 'Lusaka',
                'district' => 'Kanyama',
                'address' => 'Los Angeles Road, Kanyama Health Centre',
                'lat' => -15.429000,
                'lng' => 28.241000,
                'phone' => '+260955776611',
                'hours' => '24/7 Adolescent & Reproductive Desk',
                'free_pads' => true,
                'emergency_kits' => true,
                'reusable_pads' => true,
                'health_referrals' => true,
                'pad_stock' => 'in_stock',
                'kit_stock' => 'low_stock',
                'languages' => ['English', 'Nyanja', 'Bemba'],
                'manager_id' => null,
            ],
            [
                'name' => 'Ndola Girls Hope Centre',
                'type' => 'youth_center',
                'province' => 'Copperbelt',
                'district' => 'Ndola',
                'address' => 'President Avenue, Northrise, Ndola',
                'lat' => -12.969800,
                'lng' => 28.643200,
                'phone' => '+260977229988',
                'hours' => 'Mon-Sat 09:00 - 18:00',
                'free_pads' => true,
                'emergency_kits' => true,
                'reusable_pads' => true,
                'health_referrals' => true,
                'pad_stock' => 'in_stock',
                'kit_stock' => 'in_stock',
                'languages' => ['English', 'Bemba'],
                'manager_id' => null,
            ],
            [
                'name' => 'Livingstone Victoria Falls Community Support Point',
                'type' => 'safe_space',
                'province' => 'Southern',
                'district' => 'Livingstone',
                'address' => 'Airport Road, Maramba Community Park',
                'lat' => -17.841900,
                'lng' => 25.854300,
                'phone' => '+260966881122',
                'hours' => 'Mon-Fri 08:00 - 17:00',
                'free_pads' => true,
                'emergency_kits' => true,
                'reusable_pads' => true,
                'health_referrals' => true,
                'pad_stock' => 'in_stock',
                'kit_stock' => 'in_stock',
                'languages' => ['English', 'Tonga', 'Lozi'],
                'manager_id' => null,
            ],
        ];

        $createdHubs = [];
        foreach ($hubs as $h) {
            $createdHubs[] = CommunityServiceHub::create([
                'organization_name' => $h['name'],
                'hub_type' => $h['type'],
                'province' => $h['province'],
                'district' => $h['district'],
                'address' => $h['address'],
                'latitude' => $h['lat'],
                'longitude' => $h['lng'],
                'contact_phone' => $h['phone'],
                'operating_hours' => $h['hours'],
                'offers_free_pads' => $h['free_pads'],
                'offers_emergency_kits' => $h['emergency_kits'],
                'offers_reusable_pads' => $h['reusable_pads'],
                'offers_health_referrals' => $h['health_referrals'],
                'free_pad_stock_level' => $h['pad_stock'],
                'emergency_kit_stock_level' => $h['kit_stock'],
                'languages_spoken' => $h['languages'],
                'verification_status' => 'verified',
                'manager_user_id' => $h['manager_id'],
                'last_inventory_update_at' => now(),
            ]);
        }

        // 8. PRODUCT CATALOG
        $products = [
            [
                'name' => 'Mwezi Emergency Dignity Kit',
                'type' => 'emergency_kit',
                'price' => 0.00,
                'subsidized' => true,
                'desc' => 'Includes 2 quick-absorb pads, 1 pack of wet wipes, 1 discreet pouch, and pain relief support guide.',
                'care' => 'Single emergency usage. Available free at verified hubs.',
                'status' => 'available',
            ],
            [
                'name' => 'Mwezi Reusable Dignity Pad Pack (Set of 4)',
                'type' => 'reusable_pads',
                'price' => 0.00,
                'subsidized' => true,
                'desc' => 'Breathable 4-layer cotton reusable pads with leakproof wings. Lasts up to 2 years with proper sunlight drying.',
                'care' => 'Pre-soak in cold water, wash with bar soap, rinse thoroughly, dry in direct sunlight.',
                'status' => 'available',
            ],
            [
                'name' => 'Monthly Disposable Sanitary Pad Pack (10 count)',
                'type' => 'disposable_pads',
                'price' => 0.00,
                'subsidized' => true,
                'desc' => 'Ultra-thin winged pads with odor neutralizer and comfort top-sheet for heavy school days.',
                'care' => 'Wrap safely in waste paper and place in bin. Do not flush.',
                'status' => 'available',
            ],
        ];

        foreach ($products as $p) {
            MenstrualProductCatalog::create([
                'hub_id' => $createdHubs[0]->id,
                'name' => $p['name'],
                'product_type' => $p['type'],
                'price_zmw' => $p['price'],
                'is_subsidized' => $p['subsidized'],
                'description' => $p['desc'],
                'care_instructions' => $p['care'],
                'availability_status' => $p['status'],
            ]);
        }

        // 9. SUPPLY REQUESTS
        ProductAndEmergencyRequest::create([
            'request_code' => 'MWEZI-REQ-2026-091',
            'user_id' => $primaryUser->id,
            'assigned_hub_id' => $createdHubs[0]->id,
            'request_type' => 'emergency_kit',
            'urgency' => 'immediate_emergency',
            'delivery_method' => 'hub_pickup',
            'discreet_location_notes' => 'Will collect from Sister Mary at front reception before 16:00.',
            'status' => 'ready_for_pickup',
        ]);

        ProductAndEmergencyRequest::create([
            'request_code' => 'MWEZI-REQ-2026-042',
            'user_id' => $primaryUser->id,
            'assigned_hub_id' => $createdHubs[0]->id,
            'request_type' => 'free_monthly_pack',
            'urgency' => 'within_24h',
            'delivery_method' => 'school_focal_point',
            'discreet_location_notes' => 'Deliver to Chilenje Youth sports pavilion.',
            'status' => 'fulfilled',
            'fulfilled_at' => Carbon::now()->subDays(14),
        ]);

        // 10. SPONSORSHIP CAMPAIGNS & DONATIONS
        $campaign = SponsorshipCampaign::create([
            'title' => 'Keep 1,000 Zambian Schoolgirls in Class with Dignity',
            'description' => 'Providing comprehensive dignity packs—each containing 4 durable reusable pads, hygienic bar soap, an educational comic, and cycle guidance—to prevent school absenteeism.',
            'target_amount_zmw' => 150000.00,
            'raised_amount_zmw' => 84500.00,
            'target_girls_count' => 1000,
            'active' => true,
        ]);

        Donation::create([
            'campaign_id' => $campaign->id,
            'donor_user_id' => $donorSponsor->id,
            'donor_name' => 'Sarah Jenkins',
            'donor_email' => 'sarah.jenkins@globalgiving.org',
            'donation_type' => 'sponsor_a_girl_annual',
            'amount_zmw' => 3600.00,
            'girls_supported_count' => 12,
            'target_hub_id' => $createdHubs[0]->id,
            'payment_reference' => 'ZMW-PAY-99210-JENKINS',
            'payment_status' => 'completed',
            'allocated_count' => 12,
        ]);

        Donation::create([
            'campaign_id' => $campaign->id,
            'donor_user_id' => null,
            'donor_name' => 'Friends of Lusaka Youth',
            'donor_email' => 'donor@lusakayouth.org',
            'donation_type' => 'emergency_kit_bundle',
            'amount_zmw' => 1500.00,
            'girls_supported_count' => 10,
            'target_hub_id' => $createdHubs[1]->id,
            'payment_reference' => 'ZMW-PAY-88123-FRIENDS',
            'payment_status' => 'completed',
            'allocated_count' => 10,
        ]);

        // 11. HEALTH REFERRALS
        HealthReferral::create([
            'user_id' => $primaryUser->id,
            'hub_id' => $createdHubs[2]->id,
            'referral_reason_category' => 'severe_pain',
            'notes' => 'User reports recurring sharp lower abdominal cramps during day 1 requiring doctor evaluation.',
            'status' => 'appointment_requested',
            'is_anonymous_voucher' => true,
        ]);

        // 12. COMMUNITY FORUM (TOPICS & POSTS)
        $topicPads = CommunityTopic::create([
            'name' => 'Reusable Pads & Eco Care',
            'slug' => 'reusable-pads-eco-care',
            'description' => 'Experiences, washing tips, and comfort advice for cloth pads.',
            'audience_scope' => 'girls_only',
            'color' => '#EDC8FF',
            'icon' => 'Package',
            'sort_order' => 1,
        ]);

        $topicFirstPeriod = CommunityTopic::create([
            'name' => 'First Period Questions',
            'slug' => 'first-period-questions',
            'description' => 'A gentle, safe space for younger girls starting their menstrual journey.',
            'audience_scope' => 'girls_only',
            'color' => '#B8E3E9',
            'icon' => 'Heart',
            'sort_order' => 2,
        ]);

        $topicAlly = CommunityTopic::create([
            'name' => 'Family & Partner Allyship',
            'slug' => 'family-partner-allyship',
            'description' => 'Breaking taboos together with parents, guardians, and supportive partners.',
            'audience_scope' => 'open_community',
            'color' => '#F98B88',
            'icon' => 'Users',
            'sort_order' => 3,
        ]);

        $post1 = CommunityPost::create([
            'topic_id' => $topicPads->id,
            'user_id' => $primaryUser->id,
            'audience_scope' => 'girls_only',
            'is_anonymous' => true, // Anonymous posting feature demonstrated
            'title' => 'Washing reusable pads in cold water really made a difference!',
            'body' => 'I used to struggle with stains when using warm water. After reading the Mwezi guide on pre-soaking in cold water for 20 minutes with bar soap, the pads wash out completely clean. And drying them in direct sunlight makes them fresh and soft!',
            'moderation_status' => 'approved',
            'likes_count' => 18,
            'comments_count' => 2,
        ]);

        CommunityComment::create([
            'post_id' => $post1->id,
            'user_id' => $communityPartner->id,
            'body' => 'So glad to hear this! Sunlight is indeed nature’s best disinfectant. Keep spreading the word to your friends at school!',
            'is_anonymous' => false,
            'moderation_status' => 'approved',
        ]);

        CommunityComment::create([
            'post_id' => $post1->id,
            'user_id' => $trustedContact->id,
            'body' => 'Thank you for sharing this tip! Cold water really prevents protein coagulation.',
            'is_anonymous' => true,
            'moderation_status' => 'approved',
        ]);

        // 13. FREQUENTLY ASKED QUESTIONS (FAQS)
        $faqs = [
            [
                'q' => 'Is Mwezi tracking private and secure?',
                'a' => 'Yes! All sensitive symptom, flow, and personal notes are protected by field-level encryption. You can also use Discreet Mode to hide your screen immediately with one tap or by pressing Escape.',
                'cat' => 'privacy',
            ],
            [
                'q' => 'How can I get free pads in an emergency?',
                'a' => 'Go to the Support tab, tap "Request Emergency Supplies", and choose your nearest verified school or clinic hub. You will receive a discreet voucher code to collect your supplies with zero hassle.',
                'cat' => 'products',
            ],
            [
                'q' => 'What is the Trusted Circle feature?',
                'a' => 'You can invite a parent, sister, guardian, or partner by generating an invite link. You control exactly what they can see: you can share period arrival dates for support while keeping private notes strictly hidden.',
                'cat' => 'partner',
            ],
            [
                'q' => 'Can Luna AI diagnose medical conditions?',
                'a' => 'No. Luna AI provides verified educational information grounded in Mwezi health articles. If you report severe red flags like extreme pain or heavy bleeding, Luna will immediately connect you with a verified clinic or emergency helpline.',
                'cat' => 'general',
            ],
        ];

        foreach ($faqs as $f) {
            Faq::create([
                'question' => $f['q'],
                'answer' => $f['a'],
                'category' => $f['cat'],
                'locale' => 'en',
            ]);
        }

        // 14. SUPPORT HELPDESK TICKET
        SupportTicket::create([
            'ticket_number' => 'TICK-MWEZI-1044',
            'user_id' => $primaryUser->id,
            'subject' => 'Inquiry on community distribution day at Play It Forward',
            'description' => 'Wanted to confirm if the free reusable pad demonstration is open this Saturday for Grade 10 students.',
            'channel' => 'live_chat',
            'priority' => 'normal',
            'status' => 'resolved',
            'admin_response' => 'Yes Natasha! Saturday sessions run from 09:30 to 11:30 AM at the sports pavilion.',
        ]);

        // 15. M&E TELEMETRY EVENTS
        $eventTypes = [
            'information_found', 
            'emergency_request_fulfilled', 
            'reusable_pad_guide_completed', 
            'luna_safe_navigation', 
            'trusted_partner_onboarded'
        ];

        for ($i = 0; $i < 25; $i++) {
            MeImpactEvent::create([
                'event_type' => $eventTypes[$i % count($eventTypes)],
                'province' => 'Lusaka',
                'district' => 'Lusaka Central',
                'anonymized_cohort' => 'Cohort-2026-Q4',
                'metadata' => ['satisfaction' => 'high', 'turnaround_minutes' => rand(15, 60)],
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
            ]);
        }
    }
}
