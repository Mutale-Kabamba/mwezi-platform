<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();

            if (!Schema::hasColumn('users', 'province')) {
                $table->string('province')->nullable()->after('preferred_language');
            }
            if (!Schema::hasColumn('users', 'district')) {
                $table->string('district')->nullable()->after('province');
            }
            if (!Schema::hasColumn('users', 'default_hub_id')) {
                $table->foreignId('default_hub_id')->nullable()->after('district')->constrained('community_service_hubs')->nullOnDelete();
            }
            if (!Schema::hasColumn('users', 'clinical_specialty')) {
                $table->string('clinical_specialty')->nullable()->after('default_hub_id');
            }
            if (!Schema::hasColumn('users', 'hpcz_registration_number')) {
                $table->string('hpcz_registration_number')->nullable()->after('clinical_specialty');
            }
            if (!Schema::hasColumn('users', 'review_locales')) {
                $table->json('review_locales')->nullable()->after('hpcz_registration_number');
            }
            if (!Schema::hasColumn('users', 'donor_default_anonymous')) {
                $table->boolean('donor_default_anonymous')->default(false)->after('review_locales');
            }
            if (!Schema::hasColumn('users', 'admin_scope')) {
                $table->string('admin_scope')->nullable()->after('donor_default_anonymous');
            }
            if (!Schema::hasColumn('users', 'onboarding_completed_at')) {
                $table->timestamp('onboarding_completed_at')->nullable()->after('admin_scope');
            }
        });

        Schema::table('cycle_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('cycle_profiles', 'age_band')) {
                $table->string('age_band')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('cycle_profiles', 'is_first_year_menarche')) {
                $table->boolean('is_first_year_menarche')->default(false)->after('age_band');
            }
            if (!Schema::hasColumn('cycle_profiles', 'preferred_product_type')) {
                $table->string('preferred_product_type')->default('both')->after('is_first_year_menarche');
            }
        });

        Schema::table('community_service_hubs', function (Blueprint $table) {
            if (!Schema::hasColumn('community_service_hubs', 'free_pads_qty')) {
                $table->unsignedInteger('free_pads_qty')->default(100)->after('verification_status');
            }
            if (!Schema::hasColumn('community_service_hubs', 'emergency_kits_qty')) {
                $table->unsignedInteger('emergency_kits_qty')->default(50)->after('free_pads_qty');
            }
            if (!Schema::hasColumn('community_service_hubs', 'current_reusable_pads_stock')) {
                $table->unsignedInteger('current_reusable_pads_stock')->default(50)->after('emergency_kits_qty');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['default_hub_id']);
            $table->dropColumn([
                'province',
                'district',
                'default_hub_id',
                'clinical_specialty',
                'hpcz_registration_number',
                'review_locales',
                'donor_default_anonymous',
                'admin_scope',
                'onboarding_completed_at',
            ]);
        });

        Schema::table('cycle_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'age_band',
                'preferred_product_type',
            ]);
        });

        Schema::table('community_service_hubs', function (Blueprint $table) {
            $table->dropColumn([
                'free_pads_qty',
                'emergency_kits_qty',
                'current_reusable_pads_stock',
            ]);
        });
    }
};

