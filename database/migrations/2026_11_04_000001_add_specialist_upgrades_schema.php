<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Hub Inventory Quantities
        Schema::table('community_service_hubs', function (Blueprint $table) {
            $table->unsignedInteger('free_pads_qty')->default(100)->after('emergency_kit_stock_level');
            $table->unsignedInteger('emergency_kits_qty')->default(50)->after('free_pads_qty');
            $table->unsignedInteger('current_reusable_pads_stock')->default(50)->after('emergency_kits_qty');
        });

        // 2. Young Teen Menarche Calibration
        Schema::table('cycle_profiles', function (Blueprint $table) {
            $table->boolean('is_first_year_menarche')->default(false)->after('average_period_length');
        });

        // 3. Phone-first / Email-optional Users
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
            $table->unique('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['phone']);
            $table->string('email')->nullable(false)->change();
        });

        Schema::table('cycle_profiles', function (Blueprint $table) {
            $table->dropColumn('is_first_year_menarche');
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

