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
        'gender',
        'has_personal_cycle',
        'preferred_language',
        'province',
        'district',
        'default_hub_id',
        'clinical_specialty',
        'educator_status',
        'educator_bio',
        'educator_applied_at',
        'educator_approved_at',
        'educator_approved_by',
        'hpcz_registration_number',
        'hpcz_verification_status',
        'hpcz_verified_at',
        'hpcz_verification_notes',
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
            'educator_applied_at' => 'datetime',
            'educator_approved_at' => 'datetime',
            'password' => 'hashed',
            'discreet_mode_enabled' => 'boolean',
        'has_personal_cycle' => 'boolean',
            'review_locales' => 'array',
            'donor_default_anonymous' => 'boolean',
            'onboarding_completed_at' => 'datetime',
            'hpcz_verified_at' => 'datetime',
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

    /**
     * Global vs. Per-Tier Feature Policy based on role, age_band, and parent permissions.
     */
    public function tierPolicy(): array
    {
        $ageBand = $this->cycleProfile?->age_band;
        $hasStartedPeriod = (bool) ($this->cycleProfile?->has_started_period ?? true);
        $isTier1 = $ageBand === '10_13_early_teen';
        $isMinor = in_array($ageBand, ['10_13_early_teen', '14_17_secondary'], true);

        $lunaAiLevel = 'full';
        if ($isTier1) {
            $guardianConn = $this->trustedConnections()
                ->where('status', 'active')
                ->where('relationship', 'guardian')
                ->latest()
                ->first();
            $lunaAiLevel = $guardianConn?->permissions['luna_ai_level'] ?? 'restricted';
        }

        // Personal Cycle Tracker visibility:
        // - Tier 1 (10-13): only if cycles have started
        // - Male users or post-cycle / non-tracking supporters/clinicians: hidden unless female with has_personal_cycle = true
        $canUsePersonalTracker = true;
        if ($this->gender === 'male' || $this->has_personal_cycle === false) {
            $canUsePersonalTracker = false;
        } elseif ($isTier1 && !$hasStartedPeriod) {
            $canUsePersonalTracker = false;
        } elseif (in_array($this->role, ['trusted_contact', 'health_reviewer', 'community_partner', 'donor_sponsor'], true) && $this->has_personal_cycle !== true) {
            $canUsePersonalTracker = false;
        }

        // Shared Child / Partner Tracker (when child or partner explicitly allows cycle_phase access)
        $sharedConn = $this->companionConnections()
            ->where('status', 'active')
            ->get()
            ->first(fn ($c) => (bool) ($c->permissions['cycle_phase'] ?? false));

        $sharedLabel = null;
        if ($sharedConn) {
            $rel = $sharedConn->relationship;
            $sharedLabel = in_array($rel, ['guardian', 'mother', 'father'], true)
                ? "Your Child's Tracker"
                : ($rel === 'partner' ? "Your Partner's Tracker" : 'Shared Tracker');
        }

        return [
            'age_band' => $ageBand,
            'has_started_period' => $hasStartedPeriod,
            'is_tier_1' => $isTier1,
            'is_minor' => $isMinor,
            'can_use_personal_tracker' => $canUsePersonalTracker,
            'can_view_shared_tracker' => !is_null($sharedConn),
            'shared_tracker_label' => $sharedLabel,
            'can_access_community' => !$isTier1,
            'can_post_community' => !$isTier1 && $this->role !== 'community_partner',
            'can_donate' => !$isMinor,
            'can_view_sponsor_portal' => !$isMinor,
            'can_view_srhr' => !$isTier1,
            'can_view_commercial_store' => !$isTier1,
            'can_view_fertility_analytics' => !$isMinor,
            'can_export_cycle_data' => !$isMinor,
            'can_share_externally' => !$isTier1,
            'luna_ai_level' => $lunaAiLevel,
            'anonymous_alias' => 'Learner_' . str_pad((string) $this->id, 2, '0', STR_PAD_LEFT),
            'educator_status' => $this->educator_status ?? 'none',
            'can_create_learning_content' => $this->isApprovedEducator(),
            'can_approve_learning_content' => $this->canApproveLearningContent(),
        ];
    }

    public function isApprovedEducator(): bool
    {
        return $this->educator_status === 'approved' || $this->role === 'admin';
    }

    public function canApproveLearningContent(): bool
    {
        return $this->role === 'admin'
            || ($this->role === 'health_reviewer' && $this->hpcz_verification_status === 'verified');
    }
}
