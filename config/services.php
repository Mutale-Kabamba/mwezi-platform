<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'broadpay' => [
        'base_url' => env('BROADPAY_BASE_URL', env('LENCO_BASE_URL', 'https://api.lenco.co/access/v2')),
        'merchant_id' => env('BROADPAY_MERCHANT_ID', ''),
        'api_key' => env('BROADPAY_API_KEY', env('LENCO_SECRET_KEY', '')),
        'api_secret' => env('BROADPAY_API_SECRET', env('LENCO_SECRET_KEY', '')),
        'webhook_secret' => env('BROADPAY_WEBHOOK_SECRET', ''),
    ],

    'lenco' => [
        'base_url' => env('LENCO_BASE_URL', 'https://api.lenco.co/access/v2'),
        'api_name' => env('LENCO_API_NAME', 'MUX'),
        'secret_key' => env('LENCO_SECRET_KEY', ''),
        'public_key' => env('LENCO_PUBLIC_KEY', ''),
        'currency' => env('LENCO_CURRENCY', 'ZMW'),
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-3.5-flash-lite'),
        'timeout' => env('GEMINI_TIMEOUT', 30),
    ],

];
