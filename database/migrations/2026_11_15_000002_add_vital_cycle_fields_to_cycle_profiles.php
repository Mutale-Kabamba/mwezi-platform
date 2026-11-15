<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cycle_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('cycle_profiles', 'has_started_period')) {
                $table->boolean('has_started_period')->default(true)->after('age_band');
            }
            if (!Schema::hasColumn('cycle_profiles', 'cycle_regularity')) {
                $table->string('cycle_regularity', 30)->nullable()->after('average_period_length');
            }
            if (!Schema::hasColumn('cycle_profiles', 'typical_symptoms')) {
                $table->json('typical_symptoms')->nullable()->after('cycle_regularity');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cycle_profiles', function (Blueprint $table) {
            $table->dropColumn(['has_started_period', 'cycle_regularity', 'typical_symptoms']);
        });
    }
};

