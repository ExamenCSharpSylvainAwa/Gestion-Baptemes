<?php

namespace App\Services;

class SignatureService
{
    private $secretKey;

    public function __construct()
    {
        $this->secretKey = config('app.key'); // OU créer une clé dédiée
    }

    /**
     * Génère une signature HMAC SHA256 à partir des données
     */
    public function generateSignature($data)
    {
        return hash_hmac('sha256', $data, $this->secretKey);
    }

    /**
     * Vérifie si la signature reçue correspond à la signature calculée
     */
    public function verifySignature($data, $signature)
    {
        return hash_equals(
            $this->generateSignature($data),
            $signature
        );
    }

    /**
     * Génère un numéro unique pour les extraits
     * Exemple : EXT-65FCDAB8123A-20250207
     */
    public function generateUniqueNumber()
    {
        return 'EXT-' . strtoupper(uniqid()) . '-' . date('Ymd');
    }
}
