<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_service_hubs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manager_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('organization_name');
            $table->string('hub_type'); // school, ngo, clinic, pharmacy, youth_center, safe_space
            $table->string('province'); // Lusaka, Copperbelt, Southern, Eastern, Northern, Luapula, Muchinga, North-Western, Western, Central
            $table->string('district');
            $table->string('address');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('contact_phone');
            $table->string('operating_hours')->default('Mon-Fri 08:00 - 17:00');
            $table->boolean('offers_free_pads')->default(true);
            $table->boolean('offers_emergency_kits')->default(true);
            $table->boolean('offers_reusable_pads')->default(true);
            $table->boolean('offers_health_referrals')->default(true);
            $table->string('free_pad_stock_level')->default('in_stock'); // in_stock, low_stock, out_of_stock
            $table->string('emergency_kit_stock_level')->default('in_stock');
            $table->json('languages_spoken')->nullable(); // ["English", "Bemba", "Nyanja"]
            $table->string('verification_status')->default('verified'); // pending, verified, suspended
            $table->timestamp('last_inventory_update_at')->nullable();
            $table->timestamps();
        });

        Schema::create('menstrual_products_catalog', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hub_id')->nullable()->constrained('community_service_hubs')->nullOnDelete();
            $table->string('name');
            $table->string('product_type'); // disposable_pads, reusable_pads, menstrual_cup, emergency_kit, pain_relief
            $table->decimal('price_zmw', 8, 2)->default(0.00);
            $table->boolean('is_subsidized')->default(true);
            $table->text('description')->nullable();
            $table->text('care_instructions')->nullable();
            $table->string('availability_status')->default('available'); // available, limited, out_of_stock
            $table->timestamps();
        });

        Schema::create('product_and_emergency_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_code', 32)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_hub_id')->nullable()->constrained('community_service_hubs')->nullOnDelete();
            $table->string('request_type'); // emergency_kit, free_monthly_pack, affordable_order
            $table->string('urgency')->default('within_24h'); // immediate_emergency, within_24h, standard
            $table->string('delivery_method')->default('hub_pickup'); // hub_pickup, school_focal_point, discreet_community_drop
            $table->text('discreet_location_notes')->nullable(); // encrypted
            $table->string('status')->default('submitted'); // submitted, acknowledged, ready_for_pickup, dispatched, fulfilled, cancelled
            $table->timestamp('fulfilled_at')->nullable();
            $table->timestamps();
        });

        Schema::create('sponsorship_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->decimal('target_amount_zmw', 12, 2)->default(50000.00);
            $table->decimal('raised_amount_zmw', 12, 2)->default(0.00);
            $table->unsignedInteger('target_girls_count')->default(500);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->nullable()->constrained('sponsorship_campaigns')->nullOnDelete();
            $table->foreignId('donor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('donor_name')->default('Kind Supporter');
            $table->string('donor_email')->nullable();
            $table->string('donation_type'); // sponsor_a_girl_monthly, sponsor_a_girl_annual, emergency_kit_bundle, reusable_pad_pack
            $table->decimal('amount_zmw', 10, 2);
            $table->unsignedInteger('girls_supported_count')->default(1);
            $table->foreignId('target_hub_id')->nullable()->constrained('community_service_hubs')->nullOnDelete();
            $table->string('payment_reference')->unique();
            $table->string('payment_status')->default('completed'); // pending, completed, failed
            $table->unsignedInteger('allocated_count')->default(0);
            $table->timestamps();
        });

        Schema::create('health_referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('hub_id')->constrained('community_service_hubs')->cascadeOnDelete();
            $table->string('referral_reason_category'); // severe_pain, irregular_bleeding, infection_concern, counseling_support
            $table->text('notes')->nullable(); // encrypted
            $table->string('status')->default('generated'); // generated, appointment_requested, completed
            $table->boolean('is_anonymous_voucher')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('health_referrals');
        Schema::dropIfExists('donations');
        Schema::dropIfExists('sponsorship_campaigns');
        Schema::dropIfExists('product_and_emergency_requests');
        Schema::dropIfExists('menstrual_products_catalog');
        Schema::dropIfExists('community_service_hubs');
    }
};

