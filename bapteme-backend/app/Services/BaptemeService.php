<?php

namespace App\Services;

use App\Models\Bapteme;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;

class BaptemeService
{
    /**
     * Création d’un baptême + audit log
     */
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {

            // Génération automatique du numéro d'ordre
            if (!isset($data['numero_ordre'])) {
                $data['numero_ordre'] = $this->generateNumeroOrdre(
                    $data['paroisse_id'],
                    $data['annee_enregistrement']
                );
            }

            $bapteme = Bapteme::create($data);

            AuditLog::logAction(
                'create',
                'baptemes',
                $bapteme->id,
                null,
                $bapteme->toArray()
            );

            return $bapteme;
        });
    }

    /**
     * Mise à jour d’un baptême + audit log
     */
    public function update(Bapteme $bapteme, array $data)
    {
        return DB::transaction(function () use ($bapteme, $data) {

            $oldValues = $bapteme->toArray();

            $bapteme->update($data);

            AuditLog::logAction(
                'update',
                'baptemes',
                $bapteme->id,
                $oldValues,
                $bapteme->fresh()->toArray()
            );

            return $bapteme;
        });
    }

    /**
     * Recherche intelligente d’un baptême
     */
    public function search($prenoms, $nom, $dateNaissance = null, $paroisseId = null)
    {
        $query = Bapteme::query();

        if ($paroisseId) {
            $query->byParoisse($paroisseId);
        }

        return $query
            ->search($prenoms, $nom, $dateNaissance)
            ->get();
    }

    /**
     * Statistiques des baptêmes
     */
    public function getStatistics($paroisseId = null, $year = null)
    {
        $query = Bapteme::query();

        if ($paroisseId) {
            $query->byParoisse($paroisseId);
        }

        if ($year) {
            $query->byYear($year);
        }

        return [
            'total' => $query->count(),

            'par_sexe' => $query->clone()
                ->groupBy('sexe')
                ->selectRaw('sexe, COUNT(*) AS total')
                ->pluck('total', 'sexe'),

            'par_mois' => $query->clone()
                ->selectRaw('EXTRACT(MONTH FROM date_bapteme) as mois, COUNT(*) as total')
                ->groupBy('mois')
                ->pluck('total', 'mois'),
        ];
    }

    /**
     * Import Excel — à implémenter selon le format.
     */
    public function importFromExcel($file, $paroisseId)
    {
        // Exemple :
        // return Excel::import(new BaptemesImport($paroisseId), $file);
    }

    /**
     * Génère automatiquement le numéro d’ordre
     */
    private function generateNumeroOrdre($paroisseId, $year)
    {
        $last = Bapteme::where('paroisse_id', $paroisseId)
            ->where('annee_enregistrement', $year)
            ->max('numero_ordre');

        return $last ? $last + 1 : 1;
    }
}
