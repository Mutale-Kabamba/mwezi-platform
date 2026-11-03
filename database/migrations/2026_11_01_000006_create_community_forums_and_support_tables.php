<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_topics', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('audience_scope')->default('open_community'); // girls_only, trusted_support_circle, open_community, ask_an_expert
            $table->string('color')->default('#B8E3E9');
            $table->string('icon')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('community_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('topic_id')->constrained('community_topics')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('audience_scope')->default('open_community');
            $table->boolean('is_anonymous')->default(false);
            $table->string('title');
            $table->text('body');
            $table->string('moderation_status')->default('approved'); // approved, flagged, removed
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->timestamps();
        });

        Schema::create('community_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('community_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_comment_id')->nullable()->constrained('community_comments')->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_anonymous')->default(false);
            $table->string('moderation_status')->default('approved');
            $table->timestamps();
        });

        Schema::create('community_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->nullable()->constrained('community_posts')->cascadeOnDelete();
            $table->foreignId('comment_id')->nullable()->constrained('community_comments')->cascadeOnDelete();
            $table->string('reaction_type')->default('heart'); // heart, support, applause, insightful
            $table->timestamps();

            $table->unique(['user_id', 'post_id', 'reaction_type']);
        });

        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->text('answer');
            $table->string('category')->default('general'); // cycle, products, privacy, emergency, partner
            $table->string('locale', 10)->default('en');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number', 32)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('subject');
            $table->text('description');
            $table->string('channel')->default('live_chat'); // live_chat, email_support, helpline_callback
            $table->string('priority')->default('normal'); // emergency, urgent, normal
            $table->string('status')->default('open'); // open, in_progress, resolved
            $table->text('admin_response')->nullable();
            $table->timestamps();
        });

        Schema::create('me_impact_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_type'); // information_found, emergency_request_fulfilled, reusable_pad_guide_completed, luna_safe_navigation, trusted_partner_onboarded
            $table->string('province')->nullable();
            $table->string('district')->nullable();
            $table->string('anonymized_cohort')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('me_impact_events');
        Schema::dropIfExists('support_tickets');
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('community_reactions');
        Schema::dropIfExists('community_comments');
        Schema::dropIfExists('community_posts');
        Schema::dropIfExists('community_topics');
    }
};

