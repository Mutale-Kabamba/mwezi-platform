<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPrivacySetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'allow_anonymous_forum_default',
        'share_cycle_with_trusted',
        'share_symptoms_with_trusted',
        'receive_discreet_notifications',
        'data_retention_consent_at',
    ];

    protected function casts(): array
    {
        return [
            'allow_anonymous_forum_default' => 'boolean',
            'share_cycle_with_trusted' => 'boolean',
            'share_symptoms_with_trusted' => 'boolean',
            'receive_discreet_notifications' => 'boolean',
            'data_retention_consent_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

