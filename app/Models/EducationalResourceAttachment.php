<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EducationalResourceAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'resource_id',
        'uploaded_by',
        'title',
        'original_name',
        'file_path',
        'file_extension',
        'mime_type',
        'file_size',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
        ];
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(EducationalResource::class, 'resource_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}

