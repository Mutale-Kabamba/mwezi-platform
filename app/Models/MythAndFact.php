<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MythAndFact extends Model
{
    use HasFactory;

    protected $table = 'myths_and_facts';

    protected $fillable = [
        'myth_statement',
        'fact_explanation',
        'category_id',
        'verified_by_id',
        'locale',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(EducationalCategory::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by_id');
    }
}
