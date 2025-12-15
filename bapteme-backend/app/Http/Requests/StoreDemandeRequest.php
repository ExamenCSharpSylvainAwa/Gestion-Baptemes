<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDemandeRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'paroisse_id' => 'required|exists:paroisses,id',
            'prenoms_recherche' => 'required|string|max:255',
            'nom_recherche' => 'required|string|max:255',
            'date_naissance_recherche' => 'nullable|date',
            'nom_pere_recherche' => 'nullable|string|max:255',
            'nom_mere_recherche' => 'nullable|string|max:255'
        ];
    }

    public function messages()
    {
        return [
            'paroisse_id.required' => 'Veuillez sélectionner une paroisse',
            'paroisse_id.exists' => 'Cette paroisse n\'existe pas',
            'prenoms_recherche.required' => 'Le(s) prénom(s) sont obligatoires',
            'nom_recherche.required' => 'Le nom est obligatoire'
        ];
    }
}
