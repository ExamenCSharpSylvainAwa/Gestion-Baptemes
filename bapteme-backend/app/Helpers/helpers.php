
<?php

if (!function_exists('formatTelephone')) {
    function formatTelephone($phone)
    {
        // Formater le numéro de téléphone sénégalais
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (strlen($phone) == 9) {
            return '+221' . $phone;
        }

        return $phone;
    }
}

if (!function_exists('generateNumeroExtrait')) {
    function generateNumeroExtrait()
    {
        return 'EXT-' . strtoupper(uniqid()) . '-' . date('Ymd');
    }
}

if (!function_exists('montantEnLettres')) {
    function montantEnLettres($montant)
    {
        // Convertir le montant en lettres (FCFA)
        $unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
        $dizaines = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

        // Implémentation simplifiée
        return number_format($montant, 0, ',', ' ') . ' FCFA';
    }
}
