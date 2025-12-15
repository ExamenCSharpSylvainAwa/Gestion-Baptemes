<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Liste tous les utilisateurs avec filtres
     */
    public function index(Request $request)
    {
        $query = User::query()->with(['paroisse', 'paroisse.diocese']);

        // Filtre par paroisse - CORRECTION ICI
        if ($request->filled('paroisse_id') && $request->paroisse_id !== 'all' && is_numeric($request->paroisse_id)) {
            $query->where('paroisse_id', $request->paroisse_id);
        }

        // Filtre par rôle
        if ($request->filled('role') && $request->role !== 'tous') {
            $query->where('role', $request->role);
        }

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('email', 'ILIKE', "%{$search}%")
                    ->orWhere('phone', 'ILIKE', "%{$search}%");
            });
        }

        // Pagination
        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Afficher un utilisateur spécifique
     */
    public function show($id)
    {
        $user = User::with(['paroisse', 'paroisse.diocese', 'baptemesCreated', 'demandes'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Créer un nouvel utilisateur
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', Rule::in(['admin', 'diocese', 'responsable_paroisse', 'agent_paroissial', 'citoyen'])],
            'paroisse_id' => 'nullable|exists:paroisses,id',
            'active' => 'sometimes|boolean'
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur créé avec succès',
            'data' => $user->load(['paroisse'])
        ], 201);
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['sometimes', 'string', 'max:20', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:8|confirmed',
            'role' => ['sometimes', Rule::in(['admin', 'diocese', 'responsable_paroisse', 'agent_paroissial', 'citoyen'])],
            'paroisse_id' => 'nullable|exists:paroisses,id',
            'active' => 'sometimes|boolean'
        ]);

        // Hasher le mot de passe si fourni
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur mis à jour avec succès',
            'data' => $user->load(['paroisse'])
        ]);
    }

    /**
     * Supprimer un utilisateur
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Empêcher la suppression de son propre compte
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez pas supprimer votre propre compte'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }

    /**
     * Activer/Désactiver un utilisateur
     */
    public function toggleActive($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez pas modifier votre propre statut'
            ], 403);
        }

        $user->active = !$user->active;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => $user->active ? 'Utilisateur activé' : 'Utilisateur désactivé',
            'data' => $user
        ]);
    }

    /**
     * Statistiques des utilisateurs
     */
    public function statistics()
    {
        $stats = [
            'total' => User::count(),
            'actifs' => User::where('active', true)->count(),
            'inactifs' => User::where('active', false)->count(),
            'par_role' => User::selectRaw('role, count(*) as total')
                ->groupBy('role')
                ->pluck('total', 'role'),
            'nouveaux_mois' => User::whereMonth('created_at', date('m'))
                ->whereYear('created_at', date('Y'))
                ->count()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
