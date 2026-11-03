<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommunityServiceHub extends Model
{
    use HasFactory;

    protected $fillable = [
        'manager_user_id',
        'organization_name',
        'hub_type',
        'province',
        'district',
        'address',
        'latitude',
        'longitude',
        'contact_phone',
        'operating_hours',
        'offers_free_pads',
        'offers_emergency_kits',
        'offers_reusable_pads',
        'offers_health_referrals',
        'free_pad_stock_level',
        'emergency_kit_stock_level',
        'languages_spoken',
        'verification_status',
        'last_inventory_update_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'offers_free_pads' => 'boolean',
            'offers_emergency_kits' => 'boolean',
            'offers_reusable_pads' => 'boolean',
            'offers_health_referrals' => 'boolean',
            'languages_spoken' => 'array',
            'last_inventory_update_at' => 'datetime',
        ];
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_user_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(MenstrualProductCatalog::class, 'hub_id');
    }

    public function requests(): HasMany
    {
        return $this->hasMany(ProductAndEmergencyRequest::class, 'assigned_hub_id');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(HealthReferral::class, 'hub_id');
    }
}

