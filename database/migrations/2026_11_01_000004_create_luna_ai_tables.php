<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('luna_knowledge_chunks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_id')->nullable()->constrained('educational_resources')->nullOnDelete();
            $table->text('chunk_text');
            $table->json('topic_tags')->nullable();
            $table->boolean('approved_for_ai')->default(true);
            $table->timestamps();
        });

        Schema::create('luna_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->default('Health Conversation');
            $table->boolean('is_ephemeral')->default(false);
            $table->timestamps();
        });

        Schema::create('luna_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('luna_conversations')->cascadeOnDelete();
            $table->string('sender', 20); // user, luna
            $table->text('message_text'); // encrypted
            $table->json('referenced_resources')->nullable();
            $table->string('safety_flag', 50)->default('none'); // none, clinical_escalation, emergency_supply_need, safeguarding_alert
            $table->boolean('helpful_rating')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('luna_messages');
        Schema::dropIfExists('luna_conversations');
        Schema::dropIfExists('luna_knowledge_chunks');
    }
};

