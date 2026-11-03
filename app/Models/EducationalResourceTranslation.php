<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EducationalResourceTranslation extends Model
{
    use HasFactory;

    protected $fillable = [
        'resource_id',
        'locale',
        'translated_title',
        'translated_summary',
        'translated_body',
        'audio_narration_url',
    ];

    public function resource(): BelongsTo
    {
        return $this->belongsTo(EducationalResource::class);
    }
}

