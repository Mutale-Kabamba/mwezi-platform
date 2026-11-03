<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'phone',
        'password',
        'role',
        'preferred_language',
        'avatar',
        'bio',
        'discreet_mode_enabled',
        'pin_code_hash',
        'oauth_provider',
        'oauth_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'pin_code_hash',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'discreet_mode_enabled' => 'boolean',
        ];
    }

    public function privacySettings(): HasOne
    {
        return $this->hasOne(UserPrivacySetting::class);
    }

    public function cycleProfile(): HasOne
    {
        return $this->hasOne(CycleProfile::class);
    }

    public function cycleLogs(): HasMany
    {
        return $this->hasMany(CycleLog::class);
    }

    public function cyclePredictions(): HasMany
    {
        return $this->hasMany(CyclePrediction::class);
    }

    public function trustedConnections(): HasMany
    {
        return $this->hasMany(TrustedConnection::class, 'primary_user_id');
    }

    public function companionConnections(): HasMany
    {
        return $this->hasMany(TrustedConnection::class, 'trusted_user_id');
    }

    public function productRequests(): HasMany
    {
        return $this->hasMany(ProductAndEmergencyRequest::class);
    }

    public function healthReferrals(): HasMany
    {
        return $this->hasMany(HealthReferral::class);
    }

    public function learningProgress(): HasMany
    {
        return $this->hasMany(UserLearningProgress::class);
    }

    public function managedHub(): HasOne
    {
        return $this->hasOne(CommunityServiceHub::class, 'manager_user_id');
    }

    public function communityPosts(): HasMany
    {
        return $this->hasMany(CommunityPost::class);
    }

    public function supportTickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class);
    }
}
