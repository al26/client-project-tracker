<?php

namespace App\Http\Controllers\Auth;

use App\Models\EmailVerificationToken;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class VerifyEmailController extends Controller
{
    /**
     * Send email verification with OTP and magic link.
     */
    public function send(Request $request): array
    {
        /** @var User $user */
        $user = $request->user();

        // Generate 6-character alphanumeric OTP (uppercase to match client input)
        $otp = strtoupper(Str::random(6));

        // Delete any existing tokens for this user (one active token at a time)
        EmailVerificationToken::where('user_id', $user->id)->delete();

        // Create new token
        $token = new EmailVerificationToken([
            'user_id' => $user->id,
            'token' => $otp,
            'expires_at' => now()->addMinutes(10),
        ]);
        $token->encrypted_token = hash('sha256', $otp.$user->email.now()->timestamp);
        $token->save();

        // Magic link points at the FRONTEND, which calls the API to verify
        $magicLink = config('app.frontend_url').'/verify-email?token='.$token->encrypted_token;
        $user->notify(new VerifyEmailNotification($otp, $magicLink));

        return ['message' => 'Verification email sent.'];
    }

    /**
     * Verify email using OTP (manual entry).
     */
    public function verifyOtp(Request $request): array
    {
        $validated = $request->validate([
            'token' => 'required|string|max:6',
        ]);

        // Compare case-insensitively (client normalises input to uppercase)
        $token = strtoupper($validated['token']);
        $verificationToken = EmailVerificationToken::whereRaw('UPPER(token) = ?', [$token])
            ->where('expires_at', '>', now())
            ->first();

        if (! $verificationToken) {
            throw ValidationException::withMessages([
                'token' => 'Invalid or expired verification token.',
            ]);
        }

        $user = $verificationToken->user;
        $user->forceFill(['email_verified_at' => now()])->save();
        $verificationToken->delete();

        return [
            'message' => 'Email verified successfully.',
            'user' => $user,
        ];
    }

    /**
     * Verify email via magic link token. Called by the frontend as an AJAX request.
     * If the token is gone (used/expired) but the current user is already verified,
     * it is treated as a no-op success.
     */
    public function verifyMagicLink(Request $request): array
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $verificationToken = EmailVerificationToken::where('encrypted_token', $validated['token'])
            ->where('expires_at', '>', now())
            ->first();

        if ($verificationToken) {
            $user = $verificationToken->user;
            $user->forceFill(['email_verified_at' => now()])->save();
            $verificationToken->delete();

            return [
                'message' => 'Email verified successfully via magic link.',
                'user' => $user,
            ];
        }

        // Token not found (already used or expired). If the authenticated user is
        // already verified, the magic link is a harmless no-op -> return success.
        /** @var User|null $user */
        $user = $request->user();
        if ($user && $user->email_verified_at) {
            return [
                'message' => 'Email already verified.',
                'user' => $user,
            ];
        }

        throw ValidationException::withMessages([
            'token' => 'Invalid or expired verification token.',
        ]);
    }

    /**
     * Resend verification OTP.
     */
    public function resend(Request $request): array
    {
        /** @var User $user */
        $user = $request->user();

        // Check if existing token is still valid
        $existingToken = EmailVerificationToken::where('user_id', $user->id)
            ->where('expires_at', '>', now())
            ->first();

        if ($existingToken) {
            // Resend same OTP
            $magicLink = config('app.frontend_url').'/verify-email?token='.$existingToken->encrypted_token;
            $user->notify(new VerifyEmailNotification($existingToken->token, $magicLink));

            return ['message' => 'Verification OTP resent.'];
        }

        // Generate new token since old one expired
        $this->send($request);

        return ['message' => 'New verification OTP sent.'];
    }
}
