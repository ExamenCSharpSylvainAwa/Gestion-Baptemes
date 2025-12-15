<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeExtrait extends Model
{
    use HasFactory;

    protected $table = 'demandes_extraits';

    protected $fillable = [
        'user_id',
        'bapteme_id',
        'paroisse_id',
        'prenoms_recherche',
        'nom_recherche',
        'date_naissance_recherche',
        'nom_pere_recherche',
        'nom_mere_recherche',
        'statut',
        'montant',
        'paiement_id',
        'motif_rejet',
        'commentaire'
    ];

    protected $casts = [
        'date_naissance_recherche' => 'date',
        'montant' => 'decimal:2'
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bapteme()
    {
        return $this->belongsTo(Bapteme::class);
    }

    public function paroisse()
    {
        return $this->belongsTo(Paroisse::class);
    }

    public function paiement()
    {
        return $this->belongsTo(Paiement::class);
    }

    public function extrait()
    {
        // CORRECTION : Spécification explicite de la clé étrangère 'demande_id'
        // pour indiquer à Laravel où trouver la liaison dans la table extraits_generes.
        return $this->hasOne(ExtraitGenere::class, 'demande_id');
    }

    // Scopes
    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    public function scopeEnCours($query)
    {
        return $query->where('statut', 'en_cours');
    }

    public function scopeValides($query)
    {
        return $query->whereIn('statut', ['valide', 'pret']);
    }

    public function scopeByParoisse($query, $paroisseId)
    {
        return $query->where('paroisse_id', $paroisseId);
    }

    // Helpers
    public function canBeProcessed()
    {
        return $this->statut === 'en_attente' && $this->paiement && $this->paiement->statut === 'succes';
    }
}
