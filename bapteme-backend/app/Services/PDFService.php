<?php

namespace App\Services;

use App\Models\Bapteme;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PDFService
{
    /**
     * Génère un extrait de baptême en PDF
     *
     * @param Bapteme $bapteme
     * @param string $numeroUnique
     * @param string $qrCodeBase64 (format: data:image/svg+xml;base64,...)
     * @return string Le chemin du fichier PDF généré
     */
    public function generateExtrait(Bapteme $bapteme, string $numeroUnique, string $qrCodeBase64)
    {
        try {
            Log::info('=== GÉNÉRATION PDF - DÉBUT ===', [
                'bapteme_id' => $bapteme->id,
                'numero_unique' => $numeroUnique
            ]);

            // Charger les relations nécessaires
            $bapteme->load(['paroisse', 'paroisse.diocese']);

            // Préparer les données pour la vue
            $data = [
                'bapteme' => $bapteme,
                'paroisse' => $bapteme->paroisse,
                'diocese' => $bapteme->paroisse->diocese,
                'numero_unique' => $numeroUnique,
                'qr_code' => $qrCodeBase64, // Déjà au format data:image/svg+xml;base64,...
                'url_verification' => route('extrait.verify', ['numeroUnique' => $numeroUnique]),
                'date_delivrance' => now()->format('d/m/Y')
            ];

            Log::info('Données PDF préparées', [
                'qr_code_length' => strlen($qrCodeBase64),
                'qr_code_format' => substr($qrCodeBase64, 0, 30) . '...'
            ]);

            // Générer le PDF
            $pdf = Pdf::loadView('pdf.extrait', $data)
                ->setPaper('a4', 'portrait')
                ->setOption('enable_font_subsetting', false) // ✅ Désactiver font subsetting
                ->setOption('isHtml5ParserEnabled', true)
                ->setOption('isRemoteEnabled', true);

            Log::info('PDF généré avec succès');

            // Définir le chemin de sauvegarde
            $filename = 'extraits/' . $numeroUnique . '.pdf';
            $fullPath = storage_path('app/' . $filename);

            // Créer le dossier si nécessaire
            $directory = dirname($fullPath);
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
                Log::info('Dossier créé', ['directory' => $directory]);
            }

            // Sauvegarder le PDF
            $output = $pdf->output();
            Storage::put($filename, $output);

            Log::info('PDF sauvegardé', [
                'filename' => $filename,
                'size' => strlen($output) . ' bytes'
            ]);

            return $filename;

        } catch (\Exception $e) {
            Log::error('Erreur lors de la génération du PDF', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'bapteme_id' => $bapteme->id ?? null,
                'numero_unique' => $numeroUnique ?? null
            ]);

            throw $e;
        }
    }

    /**
     * Télécharge un PDF existant
     */
    public function download(string $pdfPath, string $filename = null)
    {
        if (!Storage::exists($pdfPath)) {
            throw new \Exception('Fichier PDF introuvable: ' . $pdfPath);
        }

        $filename = $filename ?? basename($pdfPath);

        return Storage::download($pdfPath, $filename);
    }
}
