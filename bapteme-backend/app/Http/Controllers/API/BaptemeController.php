<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bapteme;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use App\Services\BaptemeService;

class BaptemeController extends Controller
{
    protected $baptemeService;

    public function __construct(BaptemeService $baptemeService)
    {
        $this->baptemeService = $baptemeService;
    }

    public function index(Request $request)
    {
        $query = Bapteme::with(['paroisse', 'createdBy']);

        if ($request->paroisse_id) {
            $query->byParoisse($request->paroisse_id);
        }

        if ($request->annee) {
            $query->byYear($request->annee);
        }

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('prenoms', 'ILIKE', "%{$request->search}%")
                    ->orWhere('nom', 'ILIKE', "%{$request->search}%");
            });
        }

        $baptemes = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $baptemes
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero_ordre' => 'required|integer',
            'annee_enregistrement' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'prenoms' => 'required|string|max:255',
            'nom' => 'required|string|max:255',
            'date_naissance' => 'required|date',
            'lieu_naissance' => 'required|string|max:255',
            'sexe' => 'required|in:M,F',
            'nom_pere' => 'required|string|max:255',
            'nom_mere' => 'required|string|max:255',
            'date_bapteme' => 'required|date',
            'celebrant' => 'required|string|max:255',
            'nom_parrain' => 'nullable|string|max:255',
            'representant_parrain' => 'nullable|string|max:255',
            'nom_marraine' => 'nullable|string|max:255',
            'representante_marraine' => 'nullable|string|max:255',
            'date_confirmation' => 'nullable|date',
            'lieu_confirmation' => 'nullable|string|max:255',
            'date_mariage' => 'nullable|date',
            'conjoint' => 'nullable|string|max:255',
            'paroisse_id' => 'required|exists:paroisses,id'
        ]);

        // 🎯 CORRECTION: Ajout de l'ID de l'utilisateur connecté
        $validated['created_by_user_id'] = auth()->id();

        // Vérification de l'existence de l'utilisateur (sécurité)
        if (! $validated['created_by_user_id']) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié.',
            ], 401);
        }

        $bapteme = $this->baptemeService->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Baptême enregistré avec succès',
            'data' => $bapteme->load(['paroisse', 'createdBy'])
        ], 201);
    }


    public function show($id)
    {
        $bapteme = Bapteme::with(['paroisse', 'createdBy', 'demandes'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $bapteme
        ]);
    }

    public function update(Request $request, $id)
    {
        $bapteme = Bapteme::findOrFail($id);

        $validated = $request->validate([
            'numero_ordre' => 'sometimes|integer',
            'annee_enregistrement' => 'sometimes|integer',
            'prenoms' => 'sometimes|string|max:255',
            'nom' => 'sometimes|string|max:255',
            'date_naissance' => 'sometimes|date',
            'lieu_naissance' => 'sometimes|string|max:255',
            'sexe' => 'sometimes|in:M,F',
            'nom_pere' => 'sometimes|string|max:255',
            'nom_mere' => 'sometimes|string|max:255',
            'date_bapteme' => 'sometimes|date',
            'celebrant' => 'sometimes|string|max:255'
        ]);

        $updated = $this->baptemeService->update($bapteme, $validated);

        return response()->json([
            'success' => true,
            'message' => 'Baptême mis à jour avec succès',
            'data' => $updated->load(['paroisse', 'createdBy'])
        ]);
    }

    public function destroy($id)
    {
        $bapteme = Bapteme::findOrFail($id);

        $bapteme->delete();

        AuditLog::logAction('delete', 'baptemes', $bapteme->id, $bapteme->toArray(), null);

        return response()->json([
            'success' => true,
            'message' => 'Baptême supprimé avec succès'
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'prenoms' => 'required|string',
            'nom' => 'required|string',
            'date_naissance' => 'nullable|date',
            'paroisse_id' => 'nullable|exists:paroisses,id'
        ]);

        $results = $this->baptemeService->search(
            $request->prenoms,
            $request->nom,
            $request->date_naissance,
            $request->paroisse_id
        );

        return response()->json([
            'success' => true,
            'data' => $results,
            'count' => $results->count()
        ]);
    }

    public function statistics(Request $request)
    {
        $stats = $this->baptemeService->getStatistics(
            $request->paroisse_id,
            $request->year
        );

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
