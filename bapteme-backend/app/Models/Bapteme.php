<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bapteme extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'numero_ordre',
        'annee_enregistrement',
        'prenoms',
        'nom',
        'date_naissance',
        'lieu_naissance',
        'sexe',
        'nom_pere',
        'nom_mere',
        'date_bapteme',
        'celebrant',
        'nom_parrain',
        'representant_parrain',
        'nom_marraine',
        'representante_marraine',
        'date_confirmation',
        'lieu_confirmation',
        'date_mariage',
        'conjoint',
        'paroisse_id',
        'created_by_user_id'
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'date_bapteme' => 'date',
        'date_confirmation' => 'date',
        'date_mariage' => 'date',
        'annee_enregistrement' => 'integer'
    ];

    // Relations
    public function paroisse()
    {
        return $this->belongsTo(Paroisse::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function demandes()
    {
        return $this->hasMany(DemandeExtrait::class);
    }

    public function extraits()
    {
        return $this->hasMany(ExtraitGenere::class);
    }

    // Scopes
    public function scopeSearch($query, $prenoms, $nom, $dateNaissance = null)
    {
        $query->where('prenoms', 'ILIKE', "%{$prenoms}%")
            ->where('nom', 'ILIKE', "%{$nom}%");

        if ($dateNaissance) {
            $query->whereDate('date_naissance', $dateNaissance);
        }

        return $query;
    }

    public function scopeByParoisse($query, $paroisseId)
    {
        return $query->where('paroisse_id', $paroisseId);
    }

    public function scopeByYear($query, $year)
    {
        return $query->where('annee_enregistrement', $year);
    }

    // Accessors
    public function getNomCompletAttribute()
    {
        return "{$this->prenoms} {$this->nom}";
    }

    public function getAgeAttribute()
    {
        return $this->date_naissance->age;
    }
}
