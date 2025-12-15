<?php

namespace App\Services;

use App\Models\Paiement;
use App\Models\DemandeExtrait;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class PaiementService
{
    /**
     * Lancer un paiement selon la méthode choisie
     */
    public function initierPaiement(DemandeExtrait $demande, $telephone, $methode)
    {
        $reference = $this->generateReference();

        $paiement = Paiement::create([
            'demande_id' => $demande->id,
            'montant' => $demande->montant,
            'methode' => $methode,
            'reference_transaction' => $reference,
            'statut' => 'en_attente'
        ]);

        switch ($methode) {
            case 'wave':
                return $this->processWavePayment($paiement, $telephone);
            case 'orange_money':
                return $this->processOrangeMoneyPayment($paiement, $telephone);
            case 'free_money':
                return $this->processFreeMoneyPayment($paiement, $telephone);
            default:
                throw new \Exception('Méthode de paiement non supportée');
        }
    }

    /**
     * Wave API – Processus de paiement
     */
    protected function processWavePayment(Paiement $paiement, $telephone)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.wave.api_key'),
                'Content-Type' => 'application/json'
            ])->post(config('services.wave.api_url') . '/checkout/sessions', [
                'amount' => $paiement->montant,
                'currency' => 'XOF',
                'client_reference' => $paiement->reference_transaction,
                'customer_phone_number' => $telephone,
                'success_url' => route('paiement.success'),
                'error_url' => route('paiement.error')
            ]);

            if ($response->successful()) {
                $paiement->update([
                    'metadata' => $response->json()
                ]);

                return [
                    'success' => true,
                    'checkout_url' => $response->json('wave_launch_url'),
                    'reference' => $paiement->reference_transaction
                ];
            }

            throw new \Exception('Erreur Wave: ' . $response->body());
        } catch (\Exception $e) {
            $paiement->update(['statut' => 'echec']);
            throw $e;
        }
    }

    /**
     * Orange Money
     */
    protected function processOrangeMoneyPayment(Paiement $paiement, $telephone)
    {
        return [
            'success' => true,
            'message' => 'Paiement Orange Money initié'
        ];
    }

    /**
     * Free Money
     */
    protected function processFreeMoneyPayment(Paiement $paiement, $telephone)
    {
        return [
            'success' => true,
            'message' => 'Paiement Free Money initié'
        ];
    }

    /**
     * Vérification d’un paiement
     */
    public function verifierPaiement($reference)
    {
        $paiement = Paiement::where('reference_transaction', $reference)->firstOrFail();

        switch ($paiement->methode) {
            case 'wave':
                return $this->verifyWavePayment($paiement);
            default:
                return false;
        }
    }

    /**
     * Vérification Wave
     */
    protected function verifyWavePayment(Paiement $paiement)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.wave.api_key')
        ])->get(config('services.wave.api_url') . '/checkout/sessions/' . $paiement->metadata['id']);

        if ($response->successful() && $response->json('payment_status') === 'successful') {
            $paiement->update(['statut' => 'succes']);
            return true;
        }

        return false;
    }

    /**
     * Génère une référence unique
     * Exemple : PAY-AZERTY1234-1702059935
     */
    protected function generateReference()
    {
        return 'PAY-' . strtoupper(Str::random(10)) . '-' . time();
    }
}
