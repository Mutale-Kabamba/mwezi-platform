<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('educational_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('educational_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('educational_categories')->cascadeOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by_health_pro_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('review_status')->default('draft'); // draft, pending_medical_review, approved, archived
            $table->string('format')->default('article'); // article, step_by_step_guide, video, infographic, quiz
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();
            $table->longText('body_content');
            $table->string('video_url')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->unsignedSmallInteger('read_time_minutes')->default(3);
            $table->boolean('is_featured')->default(false);
            $table->boolean('offline_cacheable')->default(true);
            $table->timestamps();
        });

        Schema::create('educational_resource_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->constrained('educational_resources')->cascadeOnDelete();
            $table->string('locale', 10); // en, bem, nya, toi, loz
            $table->string('translated_title');
            $table->text('translated_summary')->nullable();
            $table->longText('translated_body');
            $table->string('audio_narration_url')->nullable();
            $table->timestamps();

            $table->unique(['resource_id', 'locale']);
        });

        Schema::create('myths_and_facts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('educational_categories')->nullOnDelete();
            $table->foreignId('verified_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('myth_statement');
            $table->text('fact_explanation');
            $table->string('locale', 10)->default('en');
            $table->timestamps();
        });

        Schema::create('user_learning_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('resource_id')->constrained('educational_resources')->cascadeOnDelete();
            $table->unsignedSmallInteger('progress_percent')->default(0);
            $table->unsignedSmallInteger('quiz_score')->nullable();
            $table->boolean('bookmarked')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'resource_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_learning_progress');
        Schema::dropIfExists('myths_and_facts');
        Schema::dropIfExists('educational_resource_translations');
        Schema::dropIfExists('educational_resources');
        Schema::dropIfExists('educational_categories');
    }
};

