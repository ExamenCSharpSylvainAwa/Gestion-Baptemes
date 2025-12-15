<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run()
    {
        // Admin
        User::create([
            'name' => 'Admin Système',
            'email' => 'admin@bapteme.sn',
            'phone' => '+221 77 123 45 67',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'active' => true
        ]);

        // Responsable Paroisse
        User::create([
            'name' => 'Abbé Jean NDIAYE',
            'email' => 'cure.cathedrale@dakar.sn',
            'phone' => '+221 77 234 56 78',
            'password' => Hash::make('password'),
            'role' => 'responsable_paroisse',
            'paroisse_id' => 1,
            'active' => true
        ]);

        // Agent Paroissial
        User::create([
            'name' => 'Marie SARR',
            'email' => 'agent.cathedrale@dakar.sn',
            'phone' => '+221 77 345 67 89',
            'password' => Hash::make('password'),
            'role' => 'agent_paroissial',
            'paroisse_id' => 1,
            'active' => true
        ]);

        // Citoyen
        User::create([
            'name' => 'Amadou DIOP',
            'email' => 'amadou.diop@email.com',
            'phone' => '+221 77 456 78 90',
            'password' => Hash::make('password'),
            'role' => 'citoyen',
            'active' => true
        ]);
    }
}
