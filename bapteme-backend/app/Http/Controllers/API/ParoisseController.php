<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Paroisse;
use Illuminate\Http\Request;

class ParoisseController extends Controller
{
    /**
     * Liste des paroisses avec filtres optionnels.
     */
    public function index(Request $request)
    {
        $query = Paroisse::with('diocese');

        // Correction : vérifier que diocese_id est numérique
        if ($request->filled('diocese_id') && is_numeric($request->diocese_id)) {
            $query->where('diocese_id', $request->diocese_id);
        }

        if ($request->filled('search')) {
            $query->where('nom', 'ILIKE', "%{$request->search}%");
        }

        $paroisses = $query->orderBy('nom')->get();

        return response()->json([
            'success' => true,
            'data' => $paroisses
        ]);
    }

    /**
     * Affiche une paroisse spécifique.
     */
    public function show($id)
    {
        // CORRECTION IMPORTANTE : Vérifier que l'ID est valide
        if ($id === 'all' || !is_numeric($id)) {
            return response()->json([
                'success' => false,
                'message' => 'ID de paroisse invalide'
            ], 400);
        }

        $paroisse = Paroisse::with(['diocese', 'baptemes', 'demandes'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $paroisse
        ]);
    }

    /**
     * Création d'une nouvelle paroisse.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'diocese_id' => 'required|exists:dioceses,id',
            'nom' => 'required|string|max:255',
            'mission' => 'nullable|string|max:255',
            'adresse' => 'nullable|string',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email',
            'bp' => 'nullable|string|max:50',
            'logo' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $validated['logo'] = $path;
        }

        $paroisse = Paroisse::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Paroisse créée avec succès',
            'data' => $paroisse->load('diocese')
        ], 201);
    }

    /**
     * Mise à jour d'une paroisse existante.
     */
    public function update(Request $request, $id)
    {
        // CORRECTION : Vérifier que l'ID est valide
        if ($id === 'all' || !is_numeric($id)) {
            return response()->json([
                'success' => false,
                'message' => 'ID de paroisse invalide'
            ], 400);
        }

        $paroisse = Paroisse::findOrFail($id);

        $validated = $request->validate([
            'diocese_id' => 'sometimes|exists:dioceses,id',
            'nom' => 'sometimes|string|max:255',
            'mission' => 'nullable|string|max:255',
            'adresse' => 'nullable|string',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email',
            'bp' => 'nullable|string|max:50',
            'logo' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $validated['logo'] = $path;
        }

        $paroisse->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Paroisse mise à jour',
            'data' => $paroisse->load('diocese')
        ]);
    }

    /**
     * Statistiques d'une paroisse.
     */
    public function statistics($id)
    {
        // CORRECTION : Vérifier que l'ID est valide
        if ($id === 'all' || !is_numeric($id)) {
            return response()->json([
                'success' => false,
                'message' => 'ID de paroisse invalide'
            ], 400);
        }

        $paroisse = Paroisse::findOrFail($id);

        $stats = [
            'total_baptemes' => $paroisse->baptemes()->count(),
            'total_demandes' => $paroisse->demandes()->count(),
            'demandes_en_attente' => $paroisse->demandes()->enAttente()->count(),
            'demandes_traitees' => $paroisse->demandes()->valides()->count(),
            'baptemes_annee_courante' => $paroisse->baptemes()->byYear(date('Y'))->count()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
