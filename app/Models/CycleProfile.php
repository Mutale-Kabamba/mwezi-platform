<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CycleProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'age_band',
        'is_first_year_menarche',
        'preferred_product_type',
        'average_cycle_length',
        'average_period_length',
        'last_period_start',
        'contraceptive_or_health_notes',
    ];

    protected function casts(): array
    {
        return [
            'average_cycle_length' => 'integer',
            'average_period_length' => 'integer',
            'is_first_year_menarche' => 'boolean',
            'last_period_start' => 'date',
            'contraceptive_or_health_notes' => 'encrypted',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

