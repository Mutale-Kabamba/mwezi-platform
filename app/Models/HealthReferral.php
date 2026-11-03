<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HealthReferral extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'hub_id',
        'referral_reason_category',
        'notes',
        'status',
        'is_anonymous_voucher',
    ];

    protected function casts(): array
    {
        return [
            'notes' => 'encrypted',
            'is_anonymous_voucher' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hub(): BelongsTo
    {
        return $this->belongsTo(CommunityServiceHub::class, 'hub_id');
    }
}

