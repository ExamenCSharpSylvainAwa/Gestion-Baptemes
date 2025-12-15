<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'wave' => [
        'api_key' => env('WAVE_API_KEY'),
        'api_secret' => env('WAVE_API_SECRET'),
        'merchant_id' => env('WAVE_MERCHANT_ID'),
        'api_url' => 'https://api.wave.com/v1'
    ],

    'orange_money' => [
        'api_key' => env('ORANGE_API_KEY'),
        'api_secret' => env('ORANGE_API_SECRET'),
        'api_url' => 'https://api.orange.com/orange-money-webpay/dev/v1'
    ],

    'free_money' => [
        'api_key' => env('FREE_API_KEY'),
        'api_url' => 'https://api.free.sn/v1'
    ],

];
