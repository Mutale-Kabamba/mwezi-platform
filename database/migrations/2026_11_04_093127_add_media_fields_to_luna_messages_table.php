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
        Schema::table('luna_messages', function (Blueprint $table) {
            $table->text('message_text')->nullable()->change();
            $table->json('attachments')->nullable()->after('message_text');
            $table->string('audio_url', 255)->nullable()->after('attachments');
            $table->unsignedSmallInteger('audio_duration')->nullable()->after('audio_url'); // Duration in seconds
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('luna_messages', function (Blueprint $table) {
            $table->dropColumn(['attachments', 'audio_url', 'audio_duration']);
        });
    }
};
