<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    use HasFactory;

    protected $fillable = [
        'demande_id',
        'montant',
        'methode',
        'reference_transaction',
        'statut',
        'metadata'
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'metadata' => 'array'
    ];

    // Relations
    public function demande()
    {
        return $this->belongsTo(DemandeExtrait::class);
    }

    // Scopes
    public function scopeSucces($query)
    {
        return $query->where('statut', 'succes');
    }

    public function scopeByMethode($query, $methode)
    {
        return $query->where('methode', $methode);
    }
}
