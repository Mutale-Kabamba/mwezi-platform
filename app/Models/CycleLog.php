<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CycleLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'logged_date',
        'flow_intensity',
        'symptoms',
        'moods',
        'pad_changes_count',
        'private_notes',
    ];

    protected function casts(): array
    {
        return [
            'logged_date' => 'date',
            'pad_changes_count' => 'integer',
            'symptoms' => 'encrypted:array',
            'moods' => 'encrypted:array',
            'private_notes' => 'encrypted',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

