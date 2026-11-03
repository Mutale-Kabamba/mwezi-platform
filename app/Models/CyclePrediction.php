<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CyclePrediction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'predicted_start_date',
        'predicted_end_date',
        'ovulation_window',
        'confidence_score',
    ];

    protected function casts(): array
    {
        return [
            'predicted_start_date' => 'date',
            'predicted_end_date' => 'date',
            'ovulation_window' => 'array',
            'confidence_score' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

