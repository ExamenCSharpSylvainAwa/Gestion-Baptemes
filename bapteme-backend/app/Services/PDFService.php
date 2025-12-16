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

            // Charger toutes les relations nécessaires en une seule requête
            $bapteme->load([
                'paroisse.diocese',
                'paroisse.responsable',
                'paroisse.users' => function($query) {
                    $query->where('role', 'responsable_paroisse')
                        ->where('active', true);
                }
            ]);

            $paroisse = $bapteme->paroisse;

            // Vérifier que la paroisse existe
            if (!$paroisse) {
                throw new \Exception('Paroisse introuvable pour le baptême #' . $bapteme->id);
            }

            // Récupérer le responsable avec fallback
            $responsable = $paroisse->responsable ?? $paroisse->getResponsableActif();
            $nomResponsable = $responsable ? $responsable->name : 'Le Curé de la Paroisse';

            Log::info('Responsable trouvé', [
                'responsable_id' => $responsable?->id,
                'nom' => $nomResponsable
            ]);

            // Préparer les données pour la vue
            $data = [
                'bapteme' => $bapteme,
                'paroisse' => $paroisse,
                'diocese' => $paroisse->diocese,
                'numero_unique' => $numeroUnique,
                'qr_code' => $qrCodeBase64,
                'url_verification' => route('extrait.verify', ['numeroUnique' => $numeroUnique]),
                'date_delivrance' => now()->format('d/m/Y'),
                'responsable' => $responsable,
                'nom_responsable' => $nomResponsable,
            ];

            Log::info('Données PDF préparées', [
                'paroisse_nom' => $paroisse->nom,
                'diocese_nom' => $paroisse->diocese?->nom,
                'qr_code_length' => strlen($qrCodeBase64)
            ]);

            // Générer le PDF avec options optimisées
            $pdf = Pdf::loadView('pdf.extrait', $data)
                ->setPaper('a4', 'portrait')
                ->setOption('enable_font_subsetting', false)
                ->setOption('isHtml5ParserEnabled', true)
                ->setOption('isRemoteEnabled', true)
                ->setOption('dpi', 150);

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

            Log::info('=== PDF SAUVEGARDÉ AVEC SUCCÈS ===', [
                'filename' => $filename,
                'size' => number_format(strlen($output) / 1024, 2) . ' KB',
                'full_path' => $fullPath
            ]);

            return $filename;

        } catch (\Exception $e) {
            Log::error('=== ERREUR GÉNÉRATION PDF ===', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'bapteme_id' => $bapteme->id ?? null,
                'numero_unique' => $numeroUnique ?? null
            ]);

            throw $e;
        }
    }

    /**
     * Télécharge un PDF existant
     *
     * @param string $pdfPath
     * @param string|null $filename
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     * @throws \Exception
     */
    public function download(string $pdfPath, string $filename = null)
    {
        if (!Storage::exists($pdfPath)) {
            Log::error('Fichier PDF introuvable', ['path' => $pdfPath]);
            throw new \Exception('Fichier PDF introuvable: ' . $pdfPath);
        }

        $filename = $filename ?? basename($pdfPath);

        Log::info('Téléchargement PDF', [
            'path' => $pdfPath,
            'filename' => $filename
        ]);

        return Storage::download($pdfPath, $filename);
    }

    /**
     * Vérifie si un PDF existe
     *
     * @param string $pdfPath
     * @return bool
     */
    public function exists(string $pdfPath): bool
    {
        return Storage::exists($pdfPath);
    }

    /**
     * Supprime un PDF
     *
     * @param string $pdfPath
     * @return bool
     */
    public function delete(string $pdfPath): bool
    {
        if ($this->exists($pdfPath)) {
            return Storage::delete($pdfPath);
        }
        return false;
    }
}
