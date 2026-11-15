<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('hpcz_verification_status', 30)->default('pending')->after('hpcz_registration_number');
            $table->timestamp('hpcz_verified_at')->nullable()->after('hpcz_verification_status');
            $table->string('hpcz_verification_notes', 255)->nullable()->after('hpcz_verified_at');
        });

        Schema::create('sms_alert_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('recipient_phone', 30);
            $table->string('alert_type', 60); // companion_readiness, supply_pickup, ussd_session
            $table->text('message');
            $table->string('provider', 40)->default('log');
            $table->string('status', 30)->default('sent'); // sent, failed, queued
            $table->string('provider_reference', 100)->nullable();
            $table->timestamps();

            $table->index(['alert_type', 'created_at']);
            $table->index('recipient_phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_alert_logs');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'hpcz_verification_status',
                'hpcz_verified_at',
                'hpcz_verification_notes',
            ]);
        });
    }
};

