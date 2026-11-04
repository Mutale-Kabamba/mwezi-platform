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
        'province',
        'district',
        'default_hub_id',
        'clinical_specialty',
        'hpcz_registration_number',
        'review_locales',
        'donor_default_anonymous',
        'admin_scope',
        'onboarding_completed_at',
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

    protected $appends = [
        'has_pin',
    ];

    public function getHasPinAttribute(): bool
    {
        return !is_null($this->pin_code_hash);
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'discreet_mode_enabled' => 'boolean',
            'review_locales' => 'array',
            'donor_default_anonymous' => 'boolean',
            'onboarding_completed_at' => 'datetime',
            'default_hub_id' => 'integer',
        ];
    }

    public function defaultHub(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CommunityServiceHub::class, 'default_hub_id');
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
