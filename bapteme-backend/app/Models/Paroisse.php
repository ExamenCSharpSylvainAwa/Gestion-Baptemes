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
        'logo'
    ];

    // Relations
    public function diocese()
    {
        return $this->belongsTo(Diocese::class);
    }

    public function baptemes()
    {
        return $this->hasMany(Bapteme::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function demandes()
    {
        return $this->hasMany(DemandeExtrait::class);
    }
}
