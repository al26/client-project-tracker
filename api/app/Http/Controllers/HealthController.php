<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

class HealthController extends Controller
{
    /**
     * Health check endpoint for load balancers and monitoring.
     * Returns JSON for API clients, Blade UI for browsers.
     */
    public function show(): JsonResponse|View
    {
        if (request()->wantsJson()) {
            return response()->json([
                'status' => 'ok',
                'service' => config('app.name'),
                'environment' => config('app.env'),
                'time' => now()->toISOString(),
            ]);
        }

        return view('health');
    }
}
