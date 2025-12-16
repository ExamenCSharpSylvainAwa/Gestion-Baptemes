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
     * Dashboard Paroisse - CORRIGÉ avec created_at + date_bapteme en fallback
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

        // 🔍 DEBUG: Compter les baptêmes pour vérifier qu'il y en a
        $totalBaptemes = Bapteme::where('paroisse_id', $user->paroisse_id)->count();
        \Log::info("📊 Total baptêmes pour paroisse {$user->paroisse_id}: {$totalBaptemes}");

        // ✅ SOLUTION 1: Essayer d'abord avec created_at (date d'enregistrement)
        $baptemesParMoisCreatedAt = Bapteme::where('paroisse_id', $user->paroisse_id)
            ->whereYear('created_at', $currentYear)
            ->select(
                DB::raw('EXTRACT(MONTH FROM created_at) as mois'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('mois')
            ->orderBy('mois')
            ->get()
            ->pluck('total', 'mois');

        // ✅ SOLUTION 2: Essayer avec date_bapteme
        $baptemesParMoisDateBapteme = Bapteme::where('paroisse_id', $user->paroisse_id)
            ->whereYear('date_bapteme', $currentYear)
            ->select(
                DB::raw('EXTRACT(MONTH FROM date_bapteme) as mois'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('mois')
            ->orderBy('mois')
            ->get()
            ->pluck('total', 'mois');

        // 🎯 Choisir la source avec le plus de données
        $baptemesParMois = $baptemesParMoisCreatedAt->sum() > 0
            ? $baptemesParMoisCreatedAt
            : $baptemesParMoisDateBapteme;

        \Log::info("📈 Baptêmes par mois (created_at): " . json_encode($baptemesParMoisCreatedAt));
        \Log::info("📈 Baptêmes par mois (date_bapteme): " . json_encode($baptemesParMoisDateBapteme));

        // Créer un tableau avec tous les mois (1-12) initialisés à 0
        $baptemesParMoisArray = [];
        for ($i = 1; $i <= 12; $i++) {
            $baptemesParMoisArray[$i] = $baptemesParMois->get($i, 0);
        }

        // 🔍 Si toujours vide, prendre TOUTES les années pour le graphique
        if (array_sum($baptemesParMoisArray) === 0) {
            \Log::warning("⚠️ Aucun baptême trouvé pour {$currentYear}, utilisation de toutes les données");

            $baptemesParMoisAll = Bapteme::where('paroisse_id', $user->paroisse_id)
                ->select(
                    DB::raw('EXTRACT(MONTH FROM created_at) as mois'),
                    DB::raw('COUNT(*) as total')
                )
                ->groupBy('mois')
                ->orderBy('mois')
                ->get()
                ->pluck('total', 'mois');

            for ($i = 1; $i <= 12; $i++) {
                $baptemesParMoisArray[$i] = $baptemesParMoisAll->get($i, 0);
            }
        }

        $stats = [
            'total_baptemes' => Bapteme::where('paroisse_id', $user->paroisse_id)->count(),
            'baptemes_mois' => Bapteme::where('paroisse_id', $user->paroisse_id)
                ->whereMonth('created_at', date('m'))
                ->whereYear('created_at', $currentYear)
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
            // ✅ Données pour le graphique
            'baptemes_par_mois' => $baptemesParMoisArray,
            // 🔍 DEBUG: Informations supplémentaires
            'debug_info' => [
                'current_year' => $currentYear,
                'total_all_time' => $totalBaptemes,
                'has_data_created_at' => $baptemesParMoisCreatedAt->sum() > 0,
                'has_data_date_bapteme' => $baptemesParMoisDateBapteme->sum() > 0,
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Dashboard Diocèse (niveau global) - CORRIGÉ
     */
    public function diocese(Request $request)
    {
        $currentYear = $request->get('year', date('Y'));

        \Log::info("📊 Dashboard Diocèse - Année: {$currentYear}");

        // ✅ CORRIGÉ: Evolution mensuelle des demandes avec created_at
        $evolutionMensuelleCreatedAt = DemandeExtrait::whereYear('created_at', $currentYear)
            ->select(
                DB::raw('EXTRACT(MONTH FROM created_at) as mois'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('mois')
            ->orderBy('mois')
            ->get()
            ->pluck('total', 'mois');

        \Log::info("📈 Evolution mensuelle demandes: " . json_encode($evolutionMensuelleCreatedAt));

        // Créer un tableau avec tous les mois (1-12) initialisés à 0
        $evolutionMensuelleArray = [];
        for ($i = 1; $i <= 12; $i++) {
            $evolutionMensuelleArray[$i] = $evolutionMensuelleCreatedAt->get($i, 0);
        }

        // 🔍 Si aucune donnée pour l'année, prendre toutes les années
        if (array_sum($evolutionMensuelleArray) === 0) {
            \Log::warning("⚠️ Aucune demande pour {$currentYear}, utilisation de toutes les données");

            $evolutionMensuelleAll = DemandeExtrait::select(
                DB::raw('EXTRACT(MONTH FROM created_at) as mois'),
                DB::raw('COUNT(*) as total')
            )
                ->groupBy('mois')
                ->orderBy('mois')
                ->get()
                ->pluck('total', 'mois');

            for ($i = 1; $i <= 12; $i++) {
                $evolutionMensuelleArray[$i] = $evolutionMensuelleAll->get($i, 0);
            }
        }

        $stats = [
            'total_paroisses' => Paroisse::count(),
            'total_baptemes' => Bapteme::count(),
            'total_demandes' => DemandeExtrait::count(),
            'demandes_en_attente' => DemandeExtrait::where('statut', 'en_attente')->count(),
            'performances_paroisses' => Paroisse::withCount(['demandes', 'baptemes'])
                ->orderBy('baptemes_count', 'desc') // Tri par baptêmes au lieu de demandes
                ->limit(10)
                ->get(),
            'evolution_mensuelle' => $evolutionMensuelleArray,
            // 🔍 DEBUG
            'debug_info' => [
                'current_year' => $currentYear,
                'total_demandes_all_time' => DemandeExtrait::count(),
                'has_data_this_year' => $evolutionMensuelleCreatedAt->sum() > 0,
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
