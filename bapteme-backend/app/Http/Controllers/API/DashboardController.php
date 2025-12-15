<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bapteme;
use App\Models\DemandeExtrait;
use App\Models\Paroisse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Dashboard Citoyen
     */
    public function citoyen(Request $request)
    {
        $user = $request->user();

        $stats = [
            'total_demandes' => DemandeExtrait::where('user_id', $user->id)->count(),
            'demandes_en_cours' => DemandeExtrait::where('user_id', $user->id)
                ->whereIn('statut', ['en_attente', 'en_cours'])->count(),
            'demandes_pretes' => DemandeExtrait::where('user_id', $user->id)
                ->where('statut', 'pret')->count(),
            'dernieres_demandes' => DemandeExtrait::where('user_id', $user->id)
                ->with(['paroisse', 'paiement'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Dashboard Paroisse - CORRIGÉ avec baptemes_par_mois
     */
    public function paroisse(Request $request)
    {
        $user = $request->user();

        // Vérifier que l'utilisateur a une paroisse associée
        if (!$user->paroisse_id) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune paroisse associée à cet utilisateur'
            ], 403);
        }

        // Année courante
        $currentYear = date('Y');

        // ✅ NOUVEAU: Baptêmes par mois pour l'année en cours
        $baptemesParMois = Bapteme::where('paroisse_id', $user->paroisse_id)
            ->whereYear('date_bapteme', $currentYear)
            ->select(
                DB::raw('EXTRACT(MONTH FROM date_bapteme) as mois'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('mois')
            ->orderBy('mois')
            ->get()
            ->pluck('total', 'mois');

        // Créer un tableau avec tous les mois (1-12) initialisés à 0
        $baptemesParMoisArray = [];
        for ($i = 1; $i <= 12; $i++) {
            $baptemesParMoisArray[$i] = $baptemesParMois->get($i, 0);
        }

        $stats = [
            'total_baptemes' => Bapteme::where('paroisse_id', $user->paroisse_id)->count(),
            'baptemes_mois' => Bapteme::where('paroisse_id', $user->paroisse_id)
                ->whereMonth('date_bapteme', date('m'))
                ->whereYear('date_bapteme', $currentYear)
                ->count(),
            'demandes_en_attente' => DemandeExtrait::where('paroisse_id', $user->paroisse_id)
                ->where('statut', 'en_attente')
                ->count(),
            'demandes_mois' => DemandeExtrait::where('paroisse_id', $user->paroisse_id)
                ->whereMonth('created_at', date('m'))
                ->whereYear('created_at', $currentYear)
                ->count(),
            'dernieres_demandes' => DemandeExtrait::where('paroisse_id', $user->paroisse_id)
                ->with(['user', 'bapteme'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
            // ✅ NOUVEAU: Données pour le graphique
            'baptemes_par_mois' => $baptemesParMoisArray
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Dashboard Diocèse (niveau global)
     */
    public function diocese(Request $request)
    {
        $currentYear = date('Y');

        // ✅ CORRIGÉ: Evolution mensuelle des demandes
        $evolutionMensuelle = DemandeExtrait::whereYear('created_at', $currentYear)
            ->select(
                DB::raw('EXTRACT(MONTH FROM created_at) as mois'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('mois')
            ->orderBy('mois')
            ->get()
            ->pluck('total', 'mois');

        // Créer un tableau avec tous les mois (1-12) initialisés à 0
        $evolutionMensuelleArray = [];
        for ($i = 1; $i <= 12; $i++) {
            $evolutionMensuelleArray[$i] = $evolutionMensuelle->get($i, 0);
        }

        $stats = [
            'total_paroisses' => Paroisse::count(),
            'total_baptemes' => Bapteme::count(),
            'total_demandes' => DemandeExtrait::count(),
            'demandes_en_attente' => DemandeExtrait::where('statut', 'en_attente')->count(),
            'performances_paroisses' => Paroisse::withCount(['demandes', 'baptemes'])
                ->orderBy('demandes_count', 'desc')
                ->limit(10)
                ->get(),
            'evolution_mensuelle' => $evolutionMensuelleArray
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
