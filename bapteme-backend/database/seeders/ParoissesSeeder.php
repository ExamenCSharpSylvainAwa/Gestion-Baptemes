<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Paroisse;

class ParoissesSeeder extends Seeder
{
    public function run()
    {
        $paroisses = [
            [
                'diocese_id' => 1,
                'nom' => 'Cathédrale du Souvenir Africain',
                'mission' => 'Mission Catholique de Dakar',
                'adresse' => 'Place de l\'Indépendance, Dakar',
                'telephone' => '+221 33 821 24 70',
                'email' => 'cathedrale@dakar.sn',
                'bp' => '100 Dakar'
            ],
            [
                'diocese_id' => 1,
                'nom' => 'Paroisse Sacré-Cœur',
                'mission' => 'Mission Catholique de Dakar',
                'adresse' => 'Plateau, Dakar',
                'telephone' => '+221 33 821 35 44',
                'email' => 'sacrecoeur@dakar.sn',
                'bp' => '101 Dakar'
            ],
            [
                'diocese_id' => 1,
                'nom' => 'Paroisse Saint-Charles Lwanga',
                'mission' => 'Mission Catholique de Dakar',
                'adresse' => 'Ouakam, Dakar',
                'telephone' => '+221 33 820 05 11',
                'email' => 'stcharles@dakar.sn',
                'bp' => '102 Dakar'
            ],
        ];

        foreach ($paroisses as $paroisse) {
            Paroisse::create($paroisse);
        }
    }
}
