<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LunaMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender',
        'message_text',
        'referenced_resources',
        'safety_flag',
        'helpful_rating',
    ];

    protected function casts(): array
    {
        return [
            'message_text' => 'encrypted',
            'referenced_resources' => 'array',
            'helpful_rating' => 'boolean',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(LunaConversation::class);
    }
}

