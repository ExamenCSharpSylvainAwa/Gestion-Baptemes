<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Settings
    |--------------------------------------------------------------------------
    |
    | Default DomPDF settings
    |
    */
    'show_warnings' => false, // Throw an Exception on warnings from dompdf

    'public_path' => null, // Override the public path if needed

    'convert_entities' => true,

    'options' => [
        /**
         * The location of the DOMPDF font directory
         */
        'font_dir' => storage_path('fonts'),

        /**
         * The location of the DOMPDF font cache directory
         */
        'font_cache' => storage_path('fonts'),

        /**
         * The location of temporary directory
         */
        'temp_dir' => sys_get_temp_dir(),

        /**
         * ✅ IMPORTANT: Désactiver le support de font_subsetting qui utilise Imagick
         */
        'enable_font_subsetting' => false,

        /**
         * The default paper size
         */
        'default_paper_size' => 'a4',

        /**
         * The default font family
         */
        'default_font' => 'serif',

        /**
         * Image DPI setting
         */
        'dpi' => 96,

        /**
         * ✅ Enable inline PHP
         */
        'enable_php' => false,

        /**
         * ✅ Enable inline Javascript
         */
        'enable_javascript' => false,

        /**
         * ✅ Enable remote file access
         */
        'enable_remote' => true,

        /**
         * ✅ Disable Imagick - Force GD
         */
        'enable_html5_parser' => true,

        /**
         * Debug layout
         */
        'debug_layout' => false,

        /**
         * Debug layout blocks
         */
        'debug_layout_blocks' => false,

        /**
         * Debug layout inline
         */
        'debug_layout_inline' => false,

        /**
         * Debug layout padding box
         */
        'debug_layout_padding_box' => false,

        /**
         * ✅ Image backend - Utiliser GD
         * Options: 'gd', 'imagick', 'gmagick'
         */
        'image_dpi' => 96,

        /**
         * ✅ Chroot - Restrict file access
         */
        'chroot' => realpath(base_path()),

        /**
         * ✅ Log output file
         */
        'log_output_file' => storage_path('logs/dompdf.log'),

        /**
         * Allow the <script> tag
         */
        'allow_url_fopen' => false,

        /**
         * ✅ Important: Ne pas utiliser l'auto-détection qui pourrait choisir Imagick
         */
        'is_remote_enabled' => true,
        'is_javascript_enabled' => false,
        'is_php_enabled' => false,
        'is_html5_parser_enabled' => true,
    ],
];
