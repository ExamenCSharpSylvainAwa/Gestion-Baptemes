<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paroisse extends Model
{
    use HasFactory;

    protected $fillable = [
        'diocese_id',
        'nom',
        'mission',
        'adresse',
        'telephone',
        'email',
        'bp',
        'logo',
        'responsable_id'
    ];

    // ==================== RELATIONS ====================

    /**
     * Diocèse de la paroisse
     */
    public function diocese()
    {
        return $this->belongsTo(Diocese::class);
    }

    /**
     * Baptêmes enregistrés dans cette paroisse
     */
    public function baptemes()
    {
        return $this->hasMany(Bapteme::class);
    }

    /**
     * Tous les utilisateurs de la paroisse
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Demandes d'extraits pour cette paroisse
     */
    public function demandes()
    {
        return $this->hasMany(DemandeExtrait::class);
    }

    /**
     * Responsable actuel de la paroisse (relation belongsTo)
     * Basé sur le champ responsable_id
     */
    public function responsable()
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }

    // ==================== MÉTHODES UTILITAIRES ====================

    /**
     * Récupère le responsable actif de la paroisse
     * Si responsable_id est défini, retourne ce user
     * Sinon, cherche un user avec role 'responsable_paroisse' actif
     */
    public function getResponsableActif()
    {
        // Si un responsable est défini via responsable_id
        if ($this->responsable_id && $this->responsable) {
            return $this->responsable;
        }

        // Sinon, chercher un responsable actif
        return $this->users()
            ->where('role', 'responsable_paroisse')
            ->where('active', true)
            ->first();
    }

    /**
     * Récupère le nom du responsable (avec fallback)
     */
    public function getNomResponsable()
    {
        $responsable = $this->getResponsableActif();
        return $responsable ? $responsable->name : 'Le Curé de la Paroisse';
    }

    /**
     * Accesseur pour l'URL du logo
     */
    public function getLogoUrlAttribute()
    {
        if ($this->logo) {
            return asset('storage/' . $this->logo);
        }
        return null;
    }
}
