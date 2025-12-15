<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\ExtraitService;
use Illuminate\Http\Request;

class ExtraitController extends Controller
{
    protected $extraitService;

    public function __construct(ExtraitService $extraitService)
    {
        $this->extraitService = $extraitService;
    }

    /**
     * Vérifie la validité d'un extrait à partir de son numéro unique.
     */
    public function verifier($numeroUnique)
    {
        $result = $this->extraitService->verifier($numeroUnique);

        return response()->json($result);
    }
}
