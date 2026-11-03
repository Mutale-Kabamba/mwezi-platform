<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'donor_user_id',
        'donor_name',
        'donor_email',
        'donor_phone',
        'donation_type',
        'amount_zmw',
        'girls_supported_count',
        'target_hub_id',
        'payment_reference',
        'payment_method',
        'payment_status',
        'gateway_transaction_id',
        'allocated_count',
    ];

    protected function casts(): array
    {
        return [
            'amount_zmw' => 'decimal:2',
            'girls_supported_count' => 'integer',
            'allocated_count' => 'integer',
        ];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(SponsorshipCampaign::class, 'campaign_id');
    }

    public function donor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'donor_user_id');
    }

    public function targetHub(): BelongsTo
    {
        return $this->belongsTo(CommunityServiceHub::class, 'target_hub_id');
    }
}
