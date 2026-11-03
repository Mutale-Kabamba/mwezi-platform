<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('name');
            $table->string('phone')->nullable()->after('email');
            $table->string('role')->default('primary_user')->after('password'); // primary_user, trusted_contact, community_partner, health_reviewer, donor_sponsor, admin
            $table->string('preferred_language', 10)->default('en')->after('role'); // en, bem, nya, toi, loz
            $table->string('avatar')->nullable()->after('preferred_language');
            $table->text('bio')->nullable()->after('avatar');
            $table->boolean('discreet_mode_enabled')->default(false)->after('bio');
            $table->string('pin_code_hash')->nullable()->after('discreet_mode_enabled');
            $table->string('oauth_provider')->nullable()->after('pin_code_hash');
            $table->string('oauth_id')->nullable()->after('oauth_provider');
        });

        Schema::create('user_privacy_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('allow_anonymous_forum_default')->default(true);
            $table->boolean('share_cycle_with_trusted')->default(false);
            $table->boolean('share_symptoms_with_trusted')->default(false);
            $table->boolean('receive_discreet_notifications')->default(true);
            $table->timestamp('data_retention_consent_at')->nullable();
            $table->timestamps();
        });

        Schema::create('trusted_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('primary_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('trusted_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('invite_code', 32)->unique();
            $table->string('contact_name');
            $table->string('contact_channel'); // email or phone
            $table->string('relationship'); // mother, father, guardian, partner, sibling, mentor
            $table->json('permissions')->nullable(); // exact items shared e.g. ["cycle_phase", "tips", "care_reminders"]
            $table->string('status')->default('invited'); // invited, active, revoked
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trusted_connections');
        Schema::dropIfExists('user_privacy_settings');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'phone',
                'role',
                'preferred_language',
                'avatar',
                'bio',
                'discreet_mode_enabled',
                'pin_code_hash',
                'oauth_provider',
                'oauth_id'
            ]);
        });
    }
};

