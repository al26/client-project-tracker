<?php

use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.email');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.reset');

// Email verification (public endpoints - user may not be logged in yet)
Route::post('/email/verify', [VerifyEmailController::class, 'verifyOtp'])
    ->middleware(['throttle:10,1'])
    ->name('verification.verify');
Route::post('/email/verify-magic', [VerifyEmailController::class, 'verifyMagicLink'])
    ->middleware(['throttle:20,1'])
    ->name('verification.verify-magic');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return new UserResource($request->user());
    });

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/profile-information', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // Email verification
    Route::post('/email/verification-notification', [VerifyEmailController::class, 'send'])
        ->middleware(['throttle:3,1'])
        ->name('verification.send');
    Route::post('/email/verification-notification/resend', [VerifyEmailController::class, 'resend'])
        ->middleware(['throttle:3,1'])
        ->name('verification.resend');

    Route::apiResource('projects', ProjectController::class);
});
