<?php

use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Health check (outside /api prefix for load balancers)
Route::get('/health', [HealthController::class, 'show'])->name('health');
