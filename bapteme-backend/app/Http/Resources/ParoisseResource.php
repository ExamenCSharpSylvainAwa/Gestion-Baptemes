<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ParoisseResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'mission' => $this->mission,
            'adresse' => $this->adresse,
            'telephone' => $this->telephone,
            'email' => $this->email,
            'bp' => $this->bp,
            'logo_url' => $this->logo ? url('storage/' . $this->logo) : null,
            'diocese' => [
                'id' => $this->diocese?->id,
                'nom' => $this->diocese?->nom
            ],
            'created_at' => $this->created_at?->format('d/m/Y H:i')
        ];
    }
}
