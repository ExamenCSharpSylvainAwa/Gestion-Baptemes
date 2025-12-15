<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DemandeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'reference' => 'DEM-' . str_pad($this->id, 6, '0', STR_PAD_LEFT),
            'statut' => $this->statut,
            'statut_label' => $this->getStatutLabel(),
            'montant' => $this->montant,
            'montant_formatte' => number_format($this->montant, 0, ',', ' ') . ' FCFA',
            'user' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->email,
                'phone' => $this->user?->phone
            ],
            'paroisse' => new ParoisseResource($this->whenLoaded('paroisse')),
            'bapteme' => new BaptemeResource($this->whenLoaded('bapteme')),
            'paiement' => [
                'statut' => $this->paiement?->statut,
                'methode' => $this->paiement?->methode,
                'reference' => $this->paiement?->reference_transaction
            ],
            'extrait' => $this->extrait ? [
                'numero_unique' => $this->extrait->numero_unique,
                'pdf_url' => $this->extrait->getPublicUrl(),
                'date_generation' => $this->extrait->date_generation->format('d/m/Y H:i')
            ] : null,
            'motif_rejet' => $this->motif_rejet,
            'commentaire' => $this->commentaire,
            'created_at' => $this->created_at?->format('d/m/Y H:i'),
            'updated_at' => $this->updated_at?->format('d/m/Y H:i')
        ];
    }

    private function getStatutLabel()
    {
        $labels = [
            'en_attente' => 'En attente de traitement',
            'en_cours' => 'En cours de vérification',
            'valide' => 'Validée',
            'pret' => 'Prêt à télécharger',
            'rejete' => 'Rejetée'
        ];

        return $labels[$this->statut] ?? $this->statut;
    }
}
