<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Bapteme;

class BaptemeSeeder extends Seeder
{
    public function run(): void
    {
        // Exemple : créer 10 baptêmes avec factory
        Bapteme::factory(10)->create();
    }
}
