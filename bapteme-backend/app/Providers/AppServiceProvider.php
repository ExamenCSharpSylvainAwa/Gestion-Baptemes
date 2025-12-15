<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\BaptemeService;
use App\Services\PDFService;
use App\Services\QRCodeService;
use App\Services\SignatureService;
use App\Services\PaiementService;
use App\Services\ExtraitService;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        // Enregistrer les services
        $this->app->singleton(BaptemeService::class, function ($app) {
            return new BaptemeService();
        });

        $this->app->singleton(PDFService::class, function ($app) {
            return new PDFService();
        });

        $this->app->singleton(QRCodeService::class, function ($app) {
            return new QRCodeService();
        });

        $this->app->singleton(SignatureService::class, function ($app) {
            return new SignatureService();
        });

        $this->app->singleton(PaiementService::class, function ($app) {
            return new PaiementService();
        });

        $this->app->singleton(ExtraitService::class, function ($app) {
            return new ExtraitService(
                $app->make(PDFService::class),
                $app->make(QRCodeService::class),
                $app->make(SignatureService::class)
            );
        });
    }

    public function boot()
    {
        //
    }
}
