<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cycle_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('average_cycle_length')->default(28);
            $table->unsignedSmallInteger('average_period_length')->default(5);
            $table->date('last_period_start')->nullable();
            $table->text('contraceptive_or_health_notes')->nullable(); // encrypted
            $table->timestamps();
        });

        Schema::create('cycle_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('logged_date');
            $table->string('flow_intensity')->default('none'); // none, spotting, light, medium, heavy
            $table->text('symptoms')->nullable(); // encrypted json
            $table->text('moods')->nullable(); // encrypted json
            $table->unsignedSmallInteger('pad_changes_count')->default(0);
            $table->text('private_notes')->nullable(); // encrypted
            $table->timestamps();

            $table->unique(['user_id', 'logged_date']);
        });

        Schema::create('cycle_predictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('predicted_start_date');
            $table->date('predicted_end_date');
            $table->json('ovulation_window')->nullable();
            $table->decimal('confidence_score', 3, 2)->default(0.85);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cycle_predictions');
        Schema::dropIfExists('cycle_logs');
        Schema::dropIfExists('cycle_profiles');
    }
};

