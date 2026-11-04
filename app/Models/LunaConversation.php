<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LunaConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'is_ephemeral',
    ];

    protected function casts(): array
    {
        return [
            'is_ephemeral' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(LunaMessage::class, 'conversation_id')->oldest();
    }

    public function latestMessage()
    {
        return $this->hasOne(LunaMessage::class, 'conversation_id')->latestOfMany();
    }
}

