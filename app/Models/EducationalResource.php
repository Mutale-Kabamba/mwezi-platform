<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EducationalResource extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'author_id',
        'reviewed_by_health_pro_id',
        'review_status',
        'format',
        'title',
        'slug',
        'summary',
        'body_content',
        'video_url',
        'thumbnail_url',
        'read_time_minutes',
        'is_featured',
        'offline_cacheable',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'offline_cacheable' => 'boolean',
            'read_time_minutes' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EducationalCategory::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_health_pro_id');
    }

    public function translations(): HasMany
    {
        return $this->hasMany(EducationalResourceTranslation::class, 'resource_id');
    }

    public function learningProgress(): HasMany
    {
        return $this->hasMany(UserLearningProgress::class, 'resource_id');
    }

    public function knowledgeChunks(): HasMany
    {
        return $this->hasMany(LunaKnowledgeChunk::class, 'resource_id');
    }
}

