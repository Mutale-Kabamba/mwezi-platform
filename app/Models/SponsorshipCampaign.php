<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SponsorshipCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'target_amount_zmw',
        'raised_amount_zmw',
        'target_girls_count',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'target_amount_zmw' => 'decimal:2',
            'raised_amount_zmw' => 'decimal:2',
            'target_girls_count' => 'integer',
            'active' => 'boolean',
        ];
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class, 'campaign_id');
    }
}

