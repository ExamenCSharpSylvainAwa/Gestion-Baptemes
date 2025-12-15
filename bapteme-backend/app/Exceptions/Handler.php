<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    // ✅ AJOUT : Gérer l'authentification pour les API
    protected function unauthenticated($request, AuthenticationException|\Illuminate\Auth\AuthenticationException $exception)
    {
        // Si c'est une requête API, retourner JSON au lieu de rediriger
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié. Veuillez vous connecter.'
            ], 401);
        }

        // Sinon, comportement par défaut (redirection vers login)
        return redirect()->guest(route('login'));
    }
}
