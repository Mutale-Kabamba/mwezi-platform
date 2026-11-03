<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenstrualProductCatalog extends Model
{
    use HasFactory;

    protected $table = 'menstrual_products_catalog';

    protected $fillable = [
        'hub_id',
        'name',
        'product_type',
        'price_zmw',
        'is_subsidized',
        'description',
        'care_instructions',
        'availability_status',
    ];

    protected function casts(): array
    {
        return [
            'price_zmw' => 'decimal:2',
            'is_subsidized' => 'boolean',
        ];
    }

    public function hub(): BelongsTo
    {
        return $this->belongsTo(CommunityServiceHub::class, 'hub_id');
    }
}

