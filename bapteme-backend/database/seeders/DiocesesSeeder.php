<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Diocese;

class DiocesesSeeder extends Seeder
{
    public function run()
    {
        Diocese::create([
            'nom' => 'Dakar',
            'adresse' => 'Rue de la République, Dakar',
            'telephone' => '+221 33 821 00 00',
            'email' => 'archidiocese@dakar.sn'
        ]);

        Diocese::create([
            'nom' => 'Thiès',
            'adresse' => 'Avenue Léopold Sédar Senghor, Thiès',
            'telephone' => '+221 33 951 10 00',
            'email' => 'diocese@thies.sn'
        ]);
    }
}
