<?php

namespace App\Services;

use App\Models\Bapteme;
use App\Models\DemandeExtrait;
use App\Models\ExtraitGenere;
use Illuminate\Support\Facades\DB;

class ExtraitService
{
    protected $pdfService;
    protected $qrCodeService;
    protected $signatureService;

    public function __construct(
        PDFService $pdfService,
        QRCodeService $qrCodeService,
        SignatureService $signatureService
    ) {
        $this->pdfService = $pdfService;
        $this->qrCodeService = $qrCodeService;
        $this->signatureService = $signatureService;
    }

    /**
     * Génération complète d’un extrait : numéro, QR code, signature, PDF
     */
    public function generer(DemandeExtrait $demande, Bapteme $bapteme)
    {
        return DB::transaction(function () use ($demande, $bapteme) {

            // 1️⃣ Générer numéro unique
            $numeroUnique = $this->signatureService->generateUniqueNumber();

            // 2️⃣ Générer QR Code encodé en base64
            $qrCodeData = $this->qrCodeService->generateBase64(
                route('extrait.verify', $numeroUnique)
            );

            // 3️⃣ Générer signature numérique
            $signatureHash = $this->signatureService->generateSignature(json_encode([
                'bapteme_id'     => $bapteme->id,
                'numero_unique'  => $numeroUnique,
                'date'           => now()->toDateString()
            ]));

            // 4️⃣ Générer le PDF final
            $pdfPath = $this->pdfService->generateExtrait(
                $bapteme,
                $numeroUnique,
                $qrCodeData
            );

            // 5️⃣ Stocker l’extrait généré
            $extrait = ExtraitGenere::create([
                'demande_id'       => $demande->id,
                'bapteme_id'       => $bapteme->id,
                'numero_unique'    => $numeroUnique,
                'qr_code'          => $qrCodeData,
                'pdf_path'         => $pdfPath,
                'signature_hash'   => $signatureHash,
                'date_generation'  => now(),
                'valide'           => true,
            ]);

            // 6️⃣ Mettre la demande à l’état "prêt"
            $demande->update(['statut' => 'pret']);

            return $extrait;
        });
    }

    /**
     * Vérification d’un extrait via numéro unique
     */
    public function verifier($numeroUnique)
    {
        $extrait = ExtraitGenere::where('numero_unique', $numeroUnique)
            ->where('valide', true)
            ->with(['bapteme', 'bapteme.paroisse'])
            ->first();

        if (!$extrait) {
            return [
                'valide' => false,
                'message' => 'Extrait non trouvé ou invalide'
            ];
        }

        return [
            'valide' => true,
            'extrait' => $extrait,
            'bapteme' => $extrait->bapteme,
            'paroisse' => $extrait->bapteme->paroisse,
            'date_generation' => $extrait->date_generation->format('d/m/Y H:i')
        ];
    }
}
