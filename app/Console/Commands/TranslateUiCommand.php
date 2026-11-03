<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\File;

class TranslateUiCommand extends Command
{
    protected $signature = 'mwezi:translate-ui';
    protected $description = 'Generate full-app translations into Bemba, Nyanja, Tonga, and Lozi using Gemini AI';

    protected array $languages = [
        'bem' => [
            'name' => 'Bemba',
            'local' => 'Icibemba',
            'instruction' => 'Translate authentically into Icibemba (Bemba as spoken in Zambia). Use culturally respectful and natural adolescent healthcare terminology.'
        ],
        'nya' => [
            'name' => 'Nyanja',
            'local' => 'Chinyanja',
            'instruction' => 'Translate authentically into Chinyanja / Chewa (as spoken across Lusaka and Eastern Zambia). Use compassionate, clear reproductive health phrasing.'
        ],
        'toi' => [
            'name' => 'Tonga',
            'local' => 'Chitonga',
            'instruction' => 'Translate authentically into Chitonga (Plateau/Valley Tonga as spoken in Southern and Western Zambia). Ensure respectful phrasing.'
        ],
        'loz' => [
            'name' => 'Lozi',
            'local' => 'Silozi',
            'instruction' => 'Translate authentically into Silozi (as spoken in Western Province Zambia). Maintain dignity and clarity.'
        ],
    ];

    public function handle(): int
    {
        $this->info("Starting Gemini AI full UI translation for Mwezi...");

        $apiKey = config('services.gemini.api_key') ?? env('GEMINI_API_KEY');
        $model = config('services.gemini.model') ?? env('GEMINI_MODEL', 'gemini-3.5-flash-lite');

        if (empty($apiKey)) {
            $this->error("GEMINI_API_KEY is missing in .env");
            return 1;
        }

        // Master English Strings
        $enStrings = $this->getMasterEnglishStrings();
        $this->info("Total master UI keys to translate: " . count($enStrings));

        $allTranslations = [
            'en' => $enStrings,
        ];

        // Break into manageable chunks of 40 keys for high translation fidelity and API limits
        $chunks = array_chunk($enStrings, 35, true);

        foreach ($this->languages as $langCode => $langMeta) {
            $this->info("\nTranslating {$langMeta['name']} ({$langMeta['local']} - {$langCode})...");
            $translatedLang = [];

            foreach ($chunks as $idx => $chunk) {
                $this->line("  Processing chunk " . ($idx + 1) . " of " . count($chunks) . " (" . count($chunk) . " keys)...");
                $translatedChunk = $this->translateChunkWithGemini($chunk, $langCode, $langMeta, $apiKey, $model);
                $translatedLang = array_merge($translatedLang, $translatedChunk);
            }

            // Fallback check: fill any missing keys with English
            foreach ($enStrings as $k => $v) {
                if (!isset($translatedLang[$k]) || empty($translatedLang[$k])) {
                    $translatedLang[$k] = $v;
                }
            }

            $allTranslations[$langCode] = $translatedLang;
            $this->info("✓ Completed {$langMeta['name']} translation (" . count($translatedLang) . " keys)");
        }

        // Export to resources/js/i18n/translations.js
        $this->info("\nWriting output to resources/js/i18n/translations.js...");
        $this->writeTranslationsFile($allTranslations);

        $this->info("SUCCESS: Full application translation generated successfully!");
        return 0;
    }

    protected function translateChunkWithGemini(array $chunk, string $langCode, array $langMeta, string $apiKey, string $model): array
    {
        $prompt = <<<EOT
You are an expert Zambian linguist and adolescent healthcare translation specialist.
{$langMeta['instruction']}

Translate the following JSON key-value dictionary of UI strings for the "Mwezi" menstrual dignity mobile app into {$langMeta['name']} ({$langMeta['local']}).

CRITICAL TRANSLATION RULES:
1. Maintain the exact same JSON keys.
2. Translate only the values.
3. Keep brand names "Mwezi" and "Luna AI" unchanged.
4. Keep emergency phone numbers "116", "992", and ECZ terms unchanged.
5. Tone: Compassionate, dignified, de-stigmatizing, clear for Zambian adolescent girls and mentors.
6. Return ONLY a valid JSON object mapping each key to its translated string. No markdown formatting, no code blocks, no commentary.

English JSON to translate:
EOT;
        $prompt .= "\n" . json_encode($chunk, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        try {
            $response = Http::withoutVerifying()
                ->withHeaders(['Content-Type' => 'application/json'])
                ->timeout(60)
                ->post($url, [
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [['text' => $prompt]]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.2,
                        'maxOutputTokens' => 4000,
                        'responseMimeType' => 'application/json'
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $content = $data['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
                
                // Clean potential backticks
                $content = trim($content);
                if (str_starts_with($content, '```json')) {
                    $content = substr($content, 7);
                }
                if (str_starts_with($content, '```')) {
                    $content = substr($content, 3);
                }
                if (str_ends_with($content, '```')) {
                    $content = substr($content, 0, -3);
                }
                $content = trim($content);

                $decoded = json_decode($content, true);
                if (is_array($decoded)) {
                    return $decoded;
                }
            } else {
                $this->warn("    API call warning: " . $response->body());
            }
        } catch (\Throwable $e) {
            $this->warn("    API error: " . $e->getMessage());
        }

        // Return chunk as fallback
        return $chunk;
    }

    protected function writeTranslationsFile(array $allTranslations): void
    {
        $filePath = resource_path('js/i18n/translations.js');

        $js = "// Full App Localization Dictionary for Mwezi Platform\n";
        $js .= "// Languages: English (en), Bemba (bem), Nyanja (nya), Tonga (toi), Lozi (loz)\n\n";
        $js .= "export const languages = [\n";
        $js .= "    { code: 'en', name: 'English', localName: 'English', flag: '🇿🇲' },\n";
        $js .= "    { code: 'bem', name: 'Bemba', localName: 'Icibemba', flag: '🇿🇲' },\n";
        $js .= "    { code: 'nya', name: 'Nyanja', localName: 'Chinyanja', flag: '🇿🇲' },\n";
        $js .= "    { code: 'toi', name: 'Tonga', localName: 'Chitonga', flag: '🇿🇲' },\n";
        $js .= "    { code: 'loz', name: 'Lozi', localName: 'Silozi', flag: '🇿🇲' },\n";
        $js .= "];\n\n";
        $js .= "export const translations = {\n";

        foreach ($allTranslations as $locale => $strings) {
            $js .= "    {$locale}: " . json_encode($strings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ",\n\n";
        }

        $js .= "};\n";

        File::put($filePath, $js);
    }

    protected function getMasterEnglishStrings(): array
    {
        return [
            // App Shell & Navigation
            'app_title' => 'Mwezi',
            'app_subtitle' => 'Menstrual Health & Dignity',
            'nav_home' => 'Home',
            'nav_track' => 'Track',
            'nav_learn' => 'Learn',
            'nav_luna' => 'Luna AI',
            'nav_support' => 'Support',
            'quick_exit' => 'Quick Exit',
            'quick_exit_tooltip' => 'Discreet Mode / Quick Disguise (ESC)',
            'open_menu' => 'Open App Menu',
            'language_label' => 'App Language',
            'select_language' => 'Select Language',

            // Onboarding & Landing
            'onboarding_zambia' => 'Zambia • 24/7',
            'onboarding_signin_pill' => 'Sign In',
            'onboarding_get_started' => 'Get Started Free',
            'onboarding_prev' => 'Prev',
            'onboarding_next' => 'Next',
            'onboarding_sponsor_pack' => 'Sponsor a Girl’s Dignity Pack',
            'onboarding_have_account' => 'Already have an account?',
            'onboarding_sign_in' => 'Sign In',
            'slide0_tag' => 'Dignity',
            'slide0_title' => 'Dignity in Every Cycle',
            'slide0_desc' => 'Your confidential companion for every Zambian girl and young woman to track, learn, and access menstrual dignity without stigma.',
            'slide0_benefit1' => 'Encrypted Cycle & Flow Tracking',
            'slide0_benefit2' => 'Private & Stigma-Free Experience',
            'slide0_preview' => 'Care & Dignity',
            'slide1_tag' => 'Encrypted',
            'slide1_title' => 'Private Cycle Tracking',
            'slide1_desc' => 'Predict your rhythm safely with discreet PIN protection. Log daily symptoms, flow, and moods with field-level encryption.',
            'slide1_benefit1' => 'Personal Cycle Calendar & Predictions',
            'slide1_benefit2' => 'Discreet PIN Protection & Encrypted Logs',
            'slide1_preview' => 'Day 14 • Flow',
            'slide2_tag' => 'Education',
            'slide2_title' => 'Learn & Bust Taboos',
            'slide2_desc' => 'Access clinically reviewed articles, reusable pad hygiene guides, and interactive myth-busting tools in local Zambian languages.',
            'slide2_benefit1' => 'Medical Guides in 5 Zambian Languages',
            'slide2_benefit2' => 'Reusable Pad Washing & Sun-Drying Guides',
            'slide2_preview' => 'Safe Pad Hygiene',
            'slide3_tag' => 'Luna AI',
            'slide3_title' => 'Ask Luna AI Companion',
            'slide3_desc' => 'Get instant, certified adolescent health guidance, reusable pad care instructions, and 24/7 confidential advice in your preferred language.',
            'slide3_benefit1' => '24/7 Judgement-Free Advice',
            'slide3_benefit2' => 'Offline & Discreet Study Disguise',
            'slide3_preview' => 'Luna AI Assistant',
            'slide4_tag' => 'Community',
            'slide4_title' => 'Free Pads & Safe Circles',
            'slide4_desc' => 'Request emergency sanitary products, locate free community distribution hubs, or invite a trusted sister, mother, or school mentor.',
            'slide4_benefit1' => 'Emergency Dignity Kits Request',
            'slide4_benefit2' => 'Trusted Family & Mentor Circle',
            'slide4_preview' => 'Emergency Hubs',

            // Drawer Menu
            'drawer_title' => 'Mwezi Member',
            'drawer_navigation' => 'App Navigation',
            'drawer_home' => 'Home Dashboard',
            'drawer_cycle' => 'Cycle Tracker & Logs',
            'drawer_learn' => 'Learn Hub & Guides',
            'drawer_myths' => 'Busting Myths vs Facts',
            'drawer_luna' => 'Ask Luna AI Assistant',
            'drawer_community' => 'Community Discussions',
            'drawer_emergency' => 'Emergency Supplies',
            'drawer_map' => 'Find Pad Hubs & Clinics',
            'drawer_sponsor' => 'Sponsor a Girl',
            'drawer_circle' => 'Trusted Family Circle',
            'drawer_profile' => 'Profile & Privacy Settings',
            'drawer_portals' => 'Operational Portals',
            'drawer_settings' => 'Settings & Offline Data',
            'drawer_sign_out' => 'Sign Out',
            'drawer_crisis_btn' => '24/7 Crisis Helplines (Zambia)',

            // Discreet Study Mode
            'discreet_title' => 'ECZ Revision Hub',
            'discreet_subtitle' => 'Grade 11 Biology • Unit 4',
            'discreet_exit' => 'Exit Notes',
            'discreet_topic_badge' => 'Syllabus Topic 4.2',
            'discreet_topic' => 'Plant Respiration & Photosynthesis',
            'discreet_topic_sub' => 'Term 2 Exam Preparation • Ministry of General Education Zambia',
            'discreet_key_concepts' => 'Key Examination Concepts',
            'discreet_saved' => 'Class notes saved locally • Offline ready • Press ESC to return',

            // Dashboard
            'dash_welcome' => 'Welcome back,',
            'dash_daily_affirmation' => 'Daily Affirmation',
            'dash_self_care' => 'Self-Care',
            'dash_daily_tip' => 'Your cycle is your body’s natural power and wisdom. Treat yourself with gentleness today.',
            'dash_prediction' => 'Next Period Prediction',
            'dash_days_left' => 'days until next period',
            'dash_day_left' => 'day until next period',
            'dash_rhythm_confidence' => 'Rhythm prediction: High confidence',
            'dash_log_today' => 'Log Today’s Symptoms',
            'dash_update_today' => 'Update Today’s Symptoms',
            'dash_period_active' => 'Period is active',
            'dash_cycle_day' => 'Cycle Day',
            'dash_upcoming' => 'Upcoming',
            'dash_support_tools' => 'Support & Tools',
            'dash_quick_access' => 'Quick Access',
            'dash_request_supplies' => 'Request Supplies',
            'dash_request_desc' => 'Free pads & emergency kits',
            'dash_find_hubs' => 'Pad Hubs & Clinics',
            'dash_find_hubs_desc' => 'Distribution centers near you',
            'dash_ask_luna' => 'Ask Luna AI',
            'dash_ask_luna_desc' => 'Private cycle guidance 24/7',
            'dash_trusted_circle' => 'Trusted Circle',
            'dash_trusted_circle_desc' => 'Share with sister or mentor',
            'dash_featured_guide' => 'Featured Health Guide',
            'dash_sponsor_card_title' => 'Empower a Schoolgirl Today',
            'dash_sponsor_card_desc' => 'Provide 1 year of reusable pads & dignity packs',
            'dash_sponsor_btn' => 'Sponsor for K150',

            // Cycle Tracker
            'cycle_title' => 'Cycle Tracker',
            'cycle_subtitle' => 'Private • Encrypted • Natural',
            'cycle_log_symptoms' => 'Log Symptoms & Flow',
            'cycle_flow_intensity' => 'Flow Intensity',
            'cycle_flow_none' => 'None',
            'cycle_flow_spotting' => 'Spotting',
            'cycle_flow_light' => 'Light',
            'cycle_flow_medium' => 'Medium',
            'cycle_flow_heavy' => 'Heavy',
            'cycle_pads_changed' => 'Pads or Liners Changed',
            'cycle_pads_count' => 'pads',
            'cycle_symptoms_felt' => 'Symptoms Felt',
            'cycle_mood_energy' => 'Mood & Energy',
            'cycle_private_notes' => 'Private Notes',
            'cycle_notes_placeholder' => 'Feeling active and energized today.',
            'cycle_save_record' => 'Save Record',
            'cycle_recent_days' => 'Recent Recorded Days',
            'cycle_update_record' => 'Update Record for',
            'cycle_log_for' => 'Log Symptoms for',
            'cycle_legend_logged' => 'Logged Flow',
            'cycle_legend_predicted' => 'Predicted',
            'cycle_legend_ovulation' => 'Ovulation',
            'cycle_summary_btn' => 'Healthcare Summary',
            'cycle_export_title' => 'Healthcare Summary',
            'cycle_export_desc' => 'Confidential medical summary to present to your clinic or school nurse:',
            'cycle_export_rhythm' => 'Cycle Rhythm:',
            'cycle_export_duration' => 'Period Duration:',
            'cycle_export_last' => 'Last Recorded:',
            'cycle_export_pads' => 'Pad Changes:',
            'cycle_export_symptoms' => 'Recorded Symptoms:',
            'cycle_export_print' => 'Print / PDF',

            // Symptoms
            'symptom_cramps' => 'Cramps',
            'symptom_headache' => 'Headache',
            'symptom_backache' => 'Backache',
            'symptom_tender_breasts' => 'Tender Breasts',
            'symptom_acne_breakouts' => 'Acne / Breakouts',
            'symptom_bloating' => 'Bloating',
            'symptom_fatigue' => 'Fatigue',
            'symptom_high_energy' => 'High Energy',
            'symptom_food_cravings' => 'Food Cravings',
            'symptom_nausea' => 'Nausea',

            // Moods
            'mood_happy' => 'Happy',
            'mood_calm' => 'Calm',
            'mood_sensitive' => 'Sensitive',
            'mood_irritable' => 'Irritable',
            'mood_anxious' => 'Anxious',
            'mood_confident' => 'Confident',
            'mood_tired' => 'Tired',
            'mood_energetic' => 'Energetic',

            // Phases
            'phase_menstrual' => 'Menstrual Phase',
            'phase_follicular' => 'Follicular Phase',
            'phase_ovulation' => 'Ovulation Phase',
            'phase_luteal' => 'Luteal Phase',

            // Learn Hub
            'learn_title' => 'Learn & Dignity',
            'learn_subtitle' => 'Verified Health Education',
            'learn_search_placeholder' => 'Search guides, pad care, cramps...',
            'learn_all_topics' => 'All Topics',
            'learn_read_time' => 'min read',
            'learn_medically_verified' => 'Reviewed by Verified Healthcare Partner',
            'learn_all_guides' => 'All Guides',
            'learn_listen' => 'Listen',
            'learn_stop_audio' => 'Stop',
            'learn_share' => 'Share',
            'learn_finished_reading' => 'Finished Reading?',
            'learn_mark_completed' => 'Mark Completed',
            'learn_completed' => 'Completed',
            'learn_more_in_category' => 'More in this Category',
            'learn_pad_care_title' => 'Interactive Pad Washing Checklist',
            'learn_step1_rinse' => 'Rinse in cold water until water runs clear',
            'learn_step2_wash' => 'Wash thoroughly with mild soap',
            'learn_step3_sun' => 'Dry in direct sunlight (natural UV disinfectant)',
            'learn_step4_store' => 'Store in a clean, dry, breathable pouch',

            // Myths vs Facts
            'myths_title' => 'Myths vs. Facts',
            'myths_subtitle' => 'Ending Menstrual Taboos',
            'myths_banner_title' => 'Break the Silence, Bust the Myth',
            'myths_banner_desc' => 'Harmful myths make girls feel ashamed or miss school. Tap any card below to uncover the scientific medical fact verified by healthcare professionals.',
            'myths_common_taboo' => 'Common Myth / Taboo',
            'myths_scientific_fact' => 'Verified Scientific Fact',
            'myths_tap_reveal' => 'Tap to reveal scientific fact',
            'myths_tap_myth' => 'Tap to see myth',
            'myths_truth_heading' => 'The Scientific Truth:',
            'myths_busted_counter' => 'Myths Busted',

            // Luna AI
            'luna_title' => 'Luna AI Assistant',
            'luna_subtitle' => 'Confidential • Safe • Verified 24/7',
            'luna_disclaimer' => 'Certified health guidance • Not medical diagnosis',
            'luna_encrypted' => 'Private & Encrypted',
            'luna_input_placeholder' => 'Ask Luna about cramps, flow, or pads...',
            'luna_thinking' => 'Luna is thinking safely...',
            'luna_welcome_title' => "Hello, I'm Luna!",
            'luna_welcome_desc' => "I'm your private, judgment-free companion. You can ask me anything about period pain, cycle irregularities, washing and sun-drying reusable pads, or finding free pads in Zambia. What's on your mind today?",
            'luna_prompt_1' => 'How do I wash and dry reusable pads safely?',
            'luna_prompt_2' => 'What causes painful period cramps and how to soothe them?',
            'luna_prompt_3' => 'Where can I get free emergency pads in Lusaka?',
            'luna_prompt_4' => 'Does drinking cold water clot menstrual flow?',
            'luna_prompt_5' => 'Explain the 4 phases of my menstrual cycle.',
            'luna_clear_chat' => 'Clear Chat History',
            'luna_clear_confirm' => 'Clear all conversation messages for privacy?',
            'luna_safeguarding_title' => 'Immediate Confidential Safeguarding Support',
            'luna_call_116' => 'Call Toll-Free 116 Now',
            'luna_call_992' => 'Call Toll-Free 992',

            // Support & Supplies
            'support_title' => 'Support & Hubs',
            'support_subtitle' => 'Emergency Supplies & Care',
            'support_helplines_title' => 'Zambian Emergency Helplines (Free & 24/7)',
            'support_helplines_desc' => 'If you are experiencing severe pain, crisis distress, or safeguarding concerns, call immediately free of charge:',
            'support_childline_title' => 'Childline / Lifeline Zambia',
            'support_childline_desc' => '24/7 reproductive & psychosocial support for girls and adolescents.',
            'support_gbv_title' => 'National Gender-Based Violence Hotline',
            'support_gbv_desc' => 'Crisis intervention, protection, and legal assistance.',
            'support_request_btn' => 'Request Emergency Supplies',
            'support_request_card_desc' => 'Discreet pickup at schools or local partner clinics.',
            'support_map_btn' => 'Find Free Pad Hubs & Clinics',
            'support_map_card_desc' => 'Locate verified distribution points in Lusaka, Copperbelt, and rural centers.',
            'support_sponsor_btn' => 'Sponsor a Girl in School',
            'support_sponsor_card_desc' => 'Fund reusable dignity kits for students in need.',
            'support_faq_title' => 'Frequently Asked Questions',
            'support_contact_team' => 'Contact Healthcare Team',

            // Request Supplies Flow
            'request_supplies_title' => 'Request Supplies',
            'request_supplies_subtitle' => 'Discreet • Free • Safe',
            'request_package_step' => 'Select Supply Package',
            'request_package_emergency' => 'Emergency Dignity Kit',
            'request_package_monthly' => 'Monthly Disposable Pad Pack (10 count)',
            'request_package_reusable' => 'Mwezi Reusable Pad Pack (Set of 4)',
            'request_hub_selection' => 'Select Nearest Distribution Hub',
            'request_delivery_method' => 'Delivery / Pickup Method',
            'request_pickup_option' => 'Pick up at Distribution Hub',
            'request_discreet_option' => 'Discreet School Delivery',
            'request_submit_btn' => 'Submit Confidential Request',

            // Trusted Circle
            'trusted_title' => 'Trusted Family Circle',
            'trusted_subtitle' => 'Connect with a Trusted Sister or Mentor',
            'trusted_invite_btn' => 'Invite Guardian / Mentor',
            'trusted_share_cycle' => 'Share Cycle Status',
            'trusted_share_symptoms' => 'Share Logged Symptoms',
            'trusted_safety_notice' => 'Your trusted contacts can only view what you explicitly share.',

            // Profile & Settings
            'profile_title' => 'Profile & Privacy',
            'profile_subtitle' => 'Manage Identity & Security',
            'profile_details' => 'Personal Details',
            'profile_name_label' => 'Full Name',
            'profile_username_label' => 'Anonymous Username',
            'profile_phone_label' => 'Phone Number',
            'profile_save' => 'Save Profile Changes',
            'profile_pin_title' => 'Quick PIN Security Lock',
            'profile_pin_desc' => 'Set a 4-digit PIN to lock cycle records from curious eyes.',
            'profile_set_pin' => 'Set 4-Digit PIN',
            'profile_privacy_heading' => 'Privacy & Discretion',
            'profile_anonymous_forum' => 'Post anonymously in community forum',
            'profile_discreet_notifications' => 'Use discreet notifications (disguised reminders)',
            'profile_delete_account' => 'Delete My Account',

            // Auth
            'auth_login_title' => 'Sign in to Mwezi',
            'auth_login_desc' => 'Enter your credentials to access your private cycle dashboard.',
            'auth_register_title' => 'Create Free Account',
            'auth_register_desc' => 'Join Mwezi for stigma-free menstrual dignity.',
            'auth_email' => 'Email Address',
            'auth_password' => 'Password',
            'auth_password_confirm' => 'Confirm Password',
            'auth_name' => 'Your Name',
            'auth_remember_me' => 'Remember Me',
            'auth_sign_in_btn' => 'Sign In',
            'auth_register_btn' => 'Register Free',
            'auth_forgot_password' => 'Forgot your password?',
            'auth_dont_have_account' => 'Don’t have an account? Sign up',
            'auth_already_registered' => 'Already registered? Sign in',

            // Common
            'save' => 'Save',
            'cancel' => 'Cancel',
            'close' => 'Close',
            'back' => 'Back',
            'loading' => 'Loading...',
            'success' => 'Success',
            'error' => 'Error',
        ];
    }
}
