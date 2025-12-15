<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'paroisse_id',
        'active'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'active' => 'boolean'
    ];

    // Relations
    public function paroisse()
    {
        return $this->belongsTo(Paroisse::class);
    }

    public function baptemesCreated()
    {
        return $this->hasMany(Bapteme::class, 'created_by_user_id');
    }

    public function demandes()
    {
        return $this->hasMany(DemandeExtrait::class);
    }

    // Scopes
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    // Helpers
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isDiocese()
    {
        return $this->role === 'diocese';
    }

    public function isResponsableParoisse()
    {
        return $this->role === 'responsable_paroisse';
    }

    public function isAgentParoissial()
    {
        return $this->role === 'agent_paroissial';
    }

    public function isCitoyen()
    {
        return $this->role === 'citoyen';
    }
}
