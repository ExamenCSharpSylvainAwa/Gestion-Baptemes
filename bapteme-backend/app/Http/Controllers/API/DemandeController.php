<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DemandeExtrait;
use App\Models\Bapteme;
use Illuminate\Http\Request;
use App\Services\ExtraitService;
use App\Services\PaiementService;
use App\Notifications\DemandeCreatedNotification;
use App\Notifications\ExtraitPretNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DemandeController extends Controller
{
    protected $extraitService;
    protected $paiementService;

    public function __construct(ExtraitService $extraitService, PaiementService $paiementService)
    {
        $this->extraitService = $extraitService;
        $this->paiementService = $paiementService;
    }

    public function index(Request $request)
    {
        Log::info('=== INDEX DEMANDES ===', [
            'user_id' => $request->user()->id,
            'user_role' => $request->user()->role ?? 'N/A',
            'statut_filter' => $request->statut,
            'paroisse_filter' => $request->paroisse_id
        ]);

        $query = DemandeExtrait::with(['user', 'paroisse', 'bapteme', 'paiement']);

        if ($request->user()->isCitoyen()) {
            $query->where('user_id', $request->user()->id);
            Log::info('Filtre citoyen appliqué', ['user_id' => $request->user()->id]);
        }

        if ($request->user()->isAgentParoissial() || $request->user()->isResponsableParoisse()) {
            $query->where('paroisse_id', $request->user()->paroisse_id);
            Log::info('Filtre paroisse appliqué', ['paroisse_id' => $request->user()->paroisse_id]);
        }

        if ($request->statut) {
            $query->where('statut', $request->statut);
        }

        if ($request->paroisse_id) {
            $query->where('paroisse_id', $request->paroisse_id);
        }

        $demandes = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        Log::info('Demandes récupérées', ['count' => $demandes->total()]);

        return response()->json([
            'success' => true,
            'data' => $demandes
        ]);
    }

    public function store(Request $request)
    {
        Log::info('=== STORE DEMANDE ===', [
            'user_id' => $request->user()->id,
            'data' => $request->all()
        ]);

        $validated = $request->validate([
            'paroisse_id' => 'required|exists:paroisses,id',
            'prenoms_recherche' => 'required|string|max:255',
            'nom_recherche' => 'required|string|max:255',
            'date_naissance_recherche' => 'nullable|date',
            'nom_pere_recherche' => 'nullable|string|max:255',
            'nom_mere_recherche' => 'nullable|string|max:255'
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['statut'] = 'en_attente';
        $validated['montant'] = 5000;

        $demande = DemandeExtrait::create($validated);

        Log::info('Demande créée', ['demande_id' => $demande->id]);

        // Notification à l'utilisateur que la demande a été créée
        $request->user()->notify(new DemandeCreatedNotification($demande));

        return response()->json([
            'success' => true,
            'message' => 'Demande créée avec succès',
            'data' => $demande->load(['paroisse'])
        ], 201);
    }

    public function show($id)
    {
        Log::info('=== SHOW DEMANDE - DEBUT ===', [
            'demande_id' => $id,
            'url' => request()->fullUrl(),
            'method' => request()->method()
        ]);

        // Vérifier l'authentification
        if (!auth()->check()) {
            Log::error('Utilisateur non authentifié');
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié'
            ], 401);
        }

        $user = auth()->user();
        Log::info('Utilisateur authentifié', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'user_role' => $user->role ?? 'N/A',
            'user_paroisse_id' => $user->paroisse_id ?? null
        ]);

        // Récupérer la demande
        try {
            $demande = DemandeExtrait::with(['user', 'paroisse', 'bapteme', 'paiement', 'extrait'])
                ->findOrFail($id);

            Log::info('Demande trouvée', [
                'demande_id' => $demande->id,
                'demande_user_id' => $demande->user_id,
                'demande_paroisse_id' => $demande->paroisse_id,
                'demande_statut' => $demande->statut
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Demande non trouvée', ['demande_id' => $id]);
            return response()->json([
                'success' => false,
                'message' => 'Demande non trouvée'
            ], 404);
        }

        // ✅ CORRECTION : Vérifications d'autorisation élargies
        $isOwner = $demande->user_id === $user->id;
        $isAdmin = method_exists($user, 'isAdmin') && $user->isAdmin();
        $isParoisseStaff = (
                (method_exists($user, 'isResponsableParoisse') && $user->isResponsableParoisse()) ||
                (method_exists($user, 'isAgentParoissial') && $user->isAgentParoissial())
            ) && $demande->paroisse_id === $user->paroisse_id;

        Log::info('Vérification autorisation', [
            'demande_user_id' => $demande->user_id,
            'current_user_id' => $user->id,
            'is_owner' => $isOwner,
            'is_admin' => $isAdmin,
            'is_paroisse_staff' => $isParoisseStaff,
            'demande_paroisse_id' => $demande->paroisse_id,
            'user_paroisse_id' => $user->paroisse_id
        ]);

        // Autoriser : propriétaire OU admin OU personnel de la paroisse concernée
        if (!$isOwner && !$isAdmin && !$isParoisseStaff) {
            Log::warning('Accès refusé à la demande', [
                'demande_id' => $id,
                'demande_user_id' => $demande->user_id,
                'current_user_id' => $user->id,
                'reason' => 'Not owner, not admin, and not paroisse staff'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Non autorisé - Vous ne pouvez voir que les demandes de votre paroisse'
            ], 403);
        }

        Log::info('Accès autorisé', [
            'access_type' => $isOwner ? 'owner' : ($isAdmin ? 'admin' : 'paroisse_staff')
        ]);

        return response()->json([
            'success' => true,
            'data' => $demande
        ]);
    }

    public function initierPaiement(Request $request, $id)
    {
        Log::info('=== INITIER PAIEMENT ===', [
            'demande_id' => $id,
            'user_id' => $request->user()->id,
            'data' => $request->all()
        ]);

        $demande = DemandeExtrait::findOrFail($id);

        if ($demande->user_id !== $request->user()->id) {
            Log::warning('Tentative paiement non autorisée', [
                'demande_user_id' => $demande->user_id,
                'current_user_id' => $request->user()->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $validated = $request->validate([
            'methode' => 'required|in:wave,orange_money,free_money,carte',
            'telephone' => 'required|string'
        ]);

        try {
            $result = $this->paiementService->initierPaiement(
                $demande,
                $validated['methode'],
                $validated['telephone']
            );

            Log::info('Paiement initié avec succès', ['result' => $result]);

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'initiation du paiement', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function traiter(Request $request, $id)
    {
        Log::info('=== TRAITER DEMANDE ===', [
            'demande_id' => $id,
            'user_id' => $request->user()->id,
            'action' => $request->action
        ]);

        $demande = DemandeExtrait::findOrFail($id);

        // ✅ CORRECTION : Autoriser aussi les agents paroissiaux
        $user = $request->user();
        $isParoisseStaff = (
            ($user->isResponsableParoisse() || $user->isAgentParoissial())
            && $demande->paroisse_id === $user->paroisse_id
        );

        if (!$isParoisseStaff) {
            Log::warning('Tentative traitement non autorisée', [
                'user_id' => $user->id,
                'user_role' => $user->role ?? 'N/A',
                'user_paroisse_id' => $user->paroisse_id,
                'demande_paroisse_id' => $demande->paroisse_id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Non autorisé - Seul le personnel de cette paroisse peut traiter cette demande'
            ], 403);
        }

        $request->validate([
            'action' => 'required|in:valider,rejeter',
            'bapteme_id' => 'required_if:action,valider|exists:baptemes,id',
            'motif_rejet' => 'required_if:action,rejeter|string'
        ]);

        if ($request->action === 'valider') {
            $bapteme = Bapteme::findOrFail($request->bapteme_id);

            $demande->update([
                'bapteme_id' => $bapteme->id,
                'statut' => 'valide'
            ]);

            $extrait = $this->extraitService->generer($demande, $bapteme);

            // Notification à l'utilisateur que l'extrait est prêt
            $demande->user->notify(new ExtraitPretNotification($demande));

            Log::info('Demande validée et extrait généré', [
                'demande_id' => $demande->id,
                'bapteme_id' => $bapteme->id,
                'traite_par' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Demande validée et extrait généré',
                'data' => $demande->load(['extrait'])
            ]);
        } else {
            $demande->update([
                'statut' => 'rejete',
                'motif_rejet' => $request->motif_rejet
            ]);

            Log::info('Demande rejetée', [
                'demande_id' => $demande->id,
                'motif' => $request->motif_rejet,
                'traite_par' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Demande rejetée'
            ]);
        }
    }

    public function telecharger($id)
    {
        try {
            Log::info('=== TELECHARGER EXTRAIT - DEBUT ===', [
                'demande_id' => $id,
                'user_id' => auth()->id(),
                'user_role' => auth()->user()->role ?? 'N/A'
            ]);

            // Récupérer la demande avec l'extrait
            $demande = DemandeExtrait::with(['extrait', 'user'])->findOrFail($id);

            // Vérifier les autorisations
            $user = auth()->user();
            $isOwner = $demande->user_id === $user->id;
            $isAdmin = method_exists($user, 'isAdmin') && $user->isAdmin();
            $isParoisseStaff = (
                    (method_exists($user, 'isResponsableParoisse') && $user->isResponsableParoisse()) ||
                    (method_exists($user, 'isAgentParoissial') && $user->isAgentParoissial())
                ) && $demande->paroisse_id === $user->paroisse_id;

            if (!$isOwner && !$isAdmin && !$isParoisseStaff) {
                Log::warning('Tentative téléchargement non autorisée', [
                    'demande_id' => $id,
                    'user_id' => $user->id,
                    'demande_user_id' => $demande->user_id
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Non autorisé'
                ], 403);
            }

            // Vérifier que l'extrait existe
            if (!$demande->extrait) {
                Log::error('Extrait non trouvé', [
                    'demande_id' => $id,
                    'demande_statut' => $demande->statut
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Aucun extrait disponible pour cette demande'
                ], 404);
            }

            // Vérifier que le fichier PDF existe
            if (!$demande->extrait->pdf_path) {
                Log::error('Chemin PDF vide', [
                    'extrait_id' => $demande->extrait->id,
                    'demande_id' => $id
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Le chemin du fichier PDF est invalide'
                ], 404);
            }

            // Vérifier l'existence physique du fichier
            if (!Storage::exists($demande->extrait->pdf_path)) {
                Log::error('Fichier PDF introuvable sur le disque', [
                    'pdf_path' => $demande->extrait->pdf_path,
                    'full_path' => storage_path('app/' . $demande->extrait->pdf_path),
                    'storage_disk' => config('filesystems.default')
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Le fichier PDF est introuvable'
                ], 404);
            }

            Log::info('Téléchargement autorisé', [
                'pdf_path' => $demande->extrait->pdf_path,
                'file_size' => Storage::size($demande->extrait->pdf_path),
                'numero_unique' => $demande->extrait->numero_unique
            ]);

            // Définir le nom du fichier à télécharger
            $filename = 'extrait_bapteme_' . $demande->extrait->numero_unique . '.pdf';

            // ✅ TÉLÉCHARGEMENT DIRECT DU FICHIER
            return Storage::download(
                $demande->extrait->pdf_path,
                $filename,
                [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                ]
            );

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Demande non trouvée', [
                'demande_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Demande non trouvée'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Erreur lors du téléchargement', [
                'demande_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement : ' . $e->getMessage()
            ], 500);
        }
    }
}
