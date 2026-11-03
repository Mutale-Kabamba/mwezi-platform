<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductAndEmergencyRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_code',
        'user_id',
        'assigned_hub_id',
        'request_type',
        'urgency',
        'delivery_method',
        'discreet_location_notes',
        'status',
        'fulfilled_at',
    ];

    protected function casts(): array
    {
        return [
            'discreet_location_notes' => 'encrypted',
            'fulfilled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hub(): BelongsTo
    {
        return $this->belongsTo(CommunityServiceHub::class, 'assigned_hub_id');
    }
}

