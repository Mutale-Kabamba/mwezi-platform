<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LunaKnowledgeChunk extends Model
{
    use HasFactory;

    protected $fillable = [
        'resource_id',
        'chunk_text',
        'topic_tags',
        'approved_for_ai',
    ];

    protected function casts(): array
    {
        return [
            'topic_tags' => 'array',
            'approved_for_ai' => 'boolean',
        ];
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(EducationalResource::class);
    }
}

