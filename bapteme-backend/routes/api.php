<?php

use App\Http\Controllers\API\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BaptemeController;
use App\Http\Controllers\API\DemandeController;
use App\Http\Controllers\API\ParoisseController;
use App\Http\Controllers\API\ExtraitController;
use App\Http\Controllers\API\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ========================================
// ROUTES PUBLIQUES
// ========================================

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ✅ CORRECTION : Ajouter le nom 'extrait.verify'
Route::get('/extraits/verify/{numeroUnique}', [ExtraitController::class, 'verifier'])
    ->name('extrait.verify');

Route::get('/paroisses', [ParoisseController::class, 'index']);

// ========================================
// ROUTES PROTÉGÉES (AUTH SANCTUM)
// ========================================

Route::middleware('auth:sanctum')->group(function () {

    // ====================================
    // AUTH & PROFIL
    // ====================================
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);

    // ====================================
    // DASHBOARDS (PAR RÔLE)
    // ====================================

    // Dashboard Citoyen
    Route::get('/dashboard/citoyen', [DashboardController::class, 'citoyen']);

    // Dashboard Paroisse (agents et responsables)
    Route::get('/dashboard/paroisse', [DashboardController::class, 'paroisse']);

    // Dashboard Diocèse (admin et diocèse)
    Route::get('/dashboard/diocese', [DashboardController::class, 'diocese']);

    // ====================================
    // DEMANDES D'EXTRAITS
    // ====================================
    // IMPORTANT : Routes spécifiques AVANT apiResource
    Route::get('/demandes/{id}/telecharger', [DemandeController::class, 'telecharger']);
    Route::post('/demandes/{id}/paiement', [DemandeController::class, 'initierPaiement']);
    Route::post('/demandes/{id}/traiter', [DemandeController::class, 'traiter']);

    // Ensuite apiResource
    Route::apiResource('demandes', DemandeController::class);

    // ====================================
    // BAPTÊMES (Agents et Responsables)
    // ====================================
    // Routes spécifiques AVANT apiResource
    Route::post('/baptemes/search', [BaptemeController::class, 'search']);
    Route::get('/baptemes/statistics', [BaptemeController::class, 'statistics']);



    Route::apiResource('utilisateurs', UserController::class);
    Route::patch('utilisateurs/{id}/toggle-active', [UserController::class, 'toggleActive']);
    Route::get('utilisateurs-statistics', [UserController::class, 'statistics']);

    // Ensuite apiResource
    Route::apiResource('baptemes', BaptemeController::class);

    // ====================================
    // PAROISSES (Admin et Diocèse)
    // ====================================
    Route::post('/paroisses', [ParoisseController::class, 'store']);
    Route::put('/paroisses/{id}', [ParoisseController::class, 'update']);
    Route::delete('/paroisses/{id}', [ParoisseController::class, 'destroy']);
    Route::get('/paroisses/{id}', [ParoisseController::class, 'show']);
    Route::get('/paroisses/{id}/statistics', [ParoisseController::class, 'statistics']);
});
