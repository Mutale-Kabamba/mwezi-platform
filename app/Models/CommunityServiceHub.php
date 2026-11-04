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
        'free_pads_qty',
        'emergency_kits_qty',
        'current_reusable_pads_stock',
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
            'free_pads_qty' => 'integer',
            'emergency_kits_qty' => 'integer',
            'current_reusable_pads_stock' => 'integer',
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

    /**
     * Recalculate stock level enums based on current quantities
     */
    public function recalculateStockLevels(): void
    {
        $this->free_pad_stock_level = match (true) {
            $this->free_pads_qty > 20 => 'in_stock',
            $this->free_pads_qty >= 1 => 'low_stock',
            default => 'out_of_stock',
        };

        $this->emergency_kit_stock_level = match (true) {
            $this->emergency_kits_qty > 20 => 'in_stock',
            $this->emergency_kits_qty >= 1 => 'low_stock',
            default => 'out_of_stock',
        };

        $this->last_inventory_update_at = now();
    }
}

