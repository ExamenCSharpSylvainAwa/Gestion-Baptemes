<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBaptemeRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'numero_ordre' => 'required|integer',
            'annee_enregistrement' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'prenoms' => 'required|string|max:255',
            'nom' => 'required|string|max:255',
            'date_naissance' => 'required|date|before:today',
            'lieu_naissance' => 'required|string|max:255',
            'sexe' => 'required|in:M,F',
            'nom_pere' => 'required|string|max:255',
            'nom_mere' => 'required|string|max:255',
            'date_bapteme' => 'required|date|after_or_equal:date_naissance',
            'celebrant' => 'required|string|max:255',
            'nom_parrain' => 'nullable|string|max:255',
            'representant_parrain' => 'nullable|string|max:255',
            'nom_marraine' => 'nullable|string|max:255',
            'representante_marraine' => 'nullable|string|max:255',
            'date_confirmation' => 'nullable|date|after_or_equal:date_bapteme',
            'lieu_confirmation' => 'nullable|string|max:255',
            'date_mariage' => 'nullable|date|after_or_equal:date_bapteme',
            'conjoint' => 'nullable|string|max:255',
            'paroisse_id' => 'required|exists:paroisses,id'
        ];
    }

    public function messages()
    {
        return [
            'prenoms.required' => 'Le(s) prénom(s) sont obligatoires',
            'nom.required' => 'Le nom est obligatoire',
            'date_naissance.required' => 'La date de naissance est obligatoire',
            'date_naissance.before' => 'La date de naissance doit être antérieure à aujourd\'hui',
            'date_bapteme.after_or_equal' => 'La date de baptême doit être postérieure à la date de naissance',
            'sexe.in' => 'Le sexe doit être M ou F',
            'paroisse_id.exists' => 'Cette paroisse n\'existe pas'
        ];
    }
}
