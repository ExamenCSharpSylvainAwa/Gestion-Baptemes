<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Models\Bapteme;
use App\Models\DemandeExtrait;
use App\Models\Paroisse;

class GenerateStatistics extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:statistics {--period= : Période pour les statistiques (ex: daily, monthly, yearly)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Génère les statistiques globales de la plateforme Baptême';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $period = $this->option('period');

        $this->info('Génération des statistiques...');

        $stats = [
            'total_baptemes' => Bapteme::count(),
            'total_demandes' => DemandeExtrait::count(),
            'total_paroisses' => Paroisse::count(),
            'demandes_en_attente' => DemandeExtrait::enAttente()->count(),
            'baptemes_mois' => Bapteme::whereMonth('date_bapteme', date('m'))->count(),
        ];

        $this->table(
            ['Métrique', 'Valeur'],
            collect($stats)->map(fn($value, $key) => [$key, $value])->toArray()
        );

        Log::channel('audit')->info('Statistiques générées', $stats);

        $this->info('Statistiques générées avec succès !');
    }
}
