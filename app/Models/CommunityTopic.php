<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommunityTopic extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'audience_scope',
        'color',
        'icon',
        'sort_order',
    ];

    public function posts(): HasMany
    {
        return $this->hasMany(CommunityPost::class, 'topic_id')->where('moderation_status', 'approved')->latest();
    }
}

