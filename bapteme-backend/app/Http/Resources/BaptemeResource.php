<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BaptemeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'numero_ordre' => $this->numero_ordre,
            'annee_enregistrement' => $this->annee_enregistrement,
            'nom_complet' => $this->nom_complet,
            'prenoms' => $this->prenoms,
            'nom' => $this->nom,
            'date_naissance' => $this->date_naissance?->format('d/m/Y'),
            'lieu_naissance' => $this->lieu_naissance,
            'sexe' => $this->sexe,
            'nom_pere' => $this->nom_pere,
            'nom_mere' => $this->nom_mere,
            'date_bapteme' => $this->date_bapteme?->format('d/m/Y'),
            'celebrant' => $this->celebrant,
            'nom_parrain' => $this->nom_parrain,
            'nom_marraine' => $this->nom_marraine,
            'paroisse' => new ParoisseResource($this->whenLoaded('paroisse')),
            'created_by' => [
                'id' => $this->createdBy?->id,
                'name' => $this->createdBy?->name
            ],
            'created_at' => $this->created_at?->format('d/m/Y H:i'),
            'updated_at' => $this->updated_at?->format('d/m/Y H:i')
        ];
    }
}
