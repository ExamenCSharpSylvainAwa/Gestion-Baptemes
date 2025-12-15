<?php

namespace App\Services;

use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Log;

class QRCodeService
{
    /**
     * Génère un QR Code en SVG (ne nécessite ni GD ni Imagick)
     * ✅ Solution la plus simple et portable
     */
    public function generate($data)
    {
        try {
            $renderer = new ImageRenderer(
                new RendererStyle(200),
                new SvgImageBackEnd()
            );

            $writer = new Writer($renderer);
            return $writer->writeString($data);
        } catch (\Exception $e) {
            Log::error('Erreur génération QR Code SVG', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Génère le QR Code du lien de vérification
     */
    public function generateVerificationUrl($numeroUnique)
    {
        $url = route('extrait.verify', ['numeroUnique' => $numeroUnique]);

        Log::info('Génération QR Code pour vérification', [
            'numero_unique' => $numeroUnique,
            'url' => $url
        ]);

        return $this->generate($url);
    }

    /**
     * Retourne un QR Code encodé en Base64 (SVG)
     * ✅ Compatible avec <img src="data:image/svg+xml;base64,...">
     */
    public function generateBase64($data)
    {
        try {
            $svg = $this->generate($data);
            $base64 = 'data:image/svg+xml;base64,' . base64_encode($svg);

            Log::info('QR Code Base64 (SVG) généré avec succès', [
                'data_length' => strlen($base64)
            ]);

            return $base64;
        } catch (\Exception $e) {
            Log::error('Erreur génération QR Code Base64', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Génère un QR Code PNG avec GD (si GD est disponible)
     * Sinon, utilise SVG
     */
    public function generatePngOrSvg($data)
    {
        // Vérifier si GD est disponible
        if (extension_loaded('gd') && function_exists('imagecreatetruecolor')) {
            return $this->generatePng($data);
        }

        // Sinon, utiliser SVG
        Log::warning('GD non disponible, utilisation de SVG');
        return $this->generate($data);
    }

    /**
     * Génère un QR Code PNG avec GD
     */
    private function generatePng($data)
    {
        try {
            $renderer = new ImageRenderer(
                new RendererStyle(200),
                new \BaconQrCode\Renderer\Image\ImagickImageBackEnd()
            );

            $writer = new Writer($renderer);
            return $writer->writeString($data);
        } catch (\Exception $e) {
            Log::warning('Échec génération PNG, fallback vers SVG', [
                'error' => $e->getMessage()
            ]);

            // Fallback vers SVG si échec
            return $this->generate($data);
        }
    }
}
