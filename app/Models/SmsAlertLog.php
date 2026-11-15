<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SmsAlertLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'recipient_phone',
        'alert_type',
        'message',
        'provider',
        'status',
        'provider_reference',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

