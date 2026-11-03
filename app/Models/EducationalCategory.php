<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EducationalCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'icon',
        'description',
        'sort_order',
    ];

    public function resources(): HasMany
    {
        return $this->hasMany(EducationalResource::class, 'category_id')->orderBy('is_featured', 'desc');
    }

    public function mythsAndFacts(): HasMany
    {
        return $this->hasMany(MythAndFact::class, 'category_id');
    }
}

