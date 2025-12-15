<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ExtraitGenere extends Model
{
    use HasFactory;

    protected $table = 'extraits_generes';

    protected $fillable = [
        'demande_id',
        'bapteme_id',
        'numero_unique',
        'qr_code',
        'pdf_path',
        'signature_hash',
        'date_generation',
        'valide'
    ];

    protected $casts = [
        'date_generation' => 'datetime',
        'valide' => 'boolean'
    ];

    // Relations
    public function demande()
    {
        return $this->belongsTo(DemandeExtrait::class, 'demande_id');
    }

    public function bapteme()
    {
        return $this->belongsTo(Bapteme::class);
    }

    // ✅ CORRECTION : Méthode pour obtenir l'URL publique
    public function getPublicUrl()
    {
        // Si le fichier existe dans storage
        if (Storage::exists($this->pdf_path)) {
            // Retourner l'URL du storage avec lien symbolique
            return Storage::url($this->pdf_path);
        }

        return null;
    }

    // ✅ NOUVEAU : Vérifier si le fichier existe
    public function fileExists()
    {
        return Storage::exists($this->pdf_path);
    }
}
