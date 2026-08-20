<?php

use App\Models\EmailVerificationToken;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

test('authenticated user can request email verification', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/email/verification-notification');

    $response->assertStatus(200)
        ->assertJsonPath('message', 'Verification email sent.');

    Notification::assertSentTo($user, VerifyEmailNotification::class);

    $this->assertDatabaseHas('email_verification_tokens', [
        'user_id' => $user->id,
    ]);
});

test('unauthenticated user cannot request email verification', function () {
    $response = $this->postJson('/api/email/verification-notification');
    $response->assertStatus(401);
});

test('can verify email with valid OTP', function () {
    $user = User::factory()->unverified()->create();
    $token = EmailVerificationToken::create([
        'user_id' => $user->id,
        'token' => 'ABC123',
        'encrypted_token' => 'enc-token-123',
        'expires_at' => now()->addMinutes(10),
    ]);

    $response = $this->postJson('/api/email/verify', [
        'token' => 'ABC123',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('message', 'Email verified successfully.');

    $user->refresh();
    $this->assertNotNull($user->email_verified_at);
    $this->assertDatabaseMissing('email_verification_tokens', ['id' => $token->id]);
});

test('cannot verify email with expired OTP', function () {
    $user = User::factory()->unverified()->create();
    EmailVerificationToken::create([
        'user_id' => $user->id,
        'token' => 'ABC123',
        'encrypted_token' => 'enc-token-123',
        'expires_at' => now()->subMinutes(1),
    ]);

    $response = $this->postJson('/api/email/verify', [
        'token' => 'ABC123',
    ]);

    $response->assertStatus(422);
});

test('cannot verify email with invalid OTP', function () {
    $response = $this->postJson('/api/email/verify', [
        'token' => 'WRONG1',
    ]);

    $response->assertStatus(422);
});

test('can verify email with valid magic link token', function () {
    $user = User::factory()->unverified()->create();
    $token = EmailVerificationToken::create([
        'user_id' => $user->id,
        'token' => 'ABC123',
        'encrypted_token' => 'valid-magic-token',
        'expires_at' => now()->addMinutes(10),
    ]);

    $response = $this->postJson('/api/email/verify-magic', [
        'token' => 'valid-magic-token',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('message', 'Email verified successfully via magic link.');

    $user->refresh();
    $this->assertNotNull($user->email_verified_at);
    $this->assertDatabaseMissing('email_verification_tokens', ['id' => $token->id]);
});

test('magic link verification is a no-op if authenticated user is already verified', function () {
    $user = User::factory()->create(); // verified

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/email/verify-magic', [
            'token' => 'already-consumed-token',
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('message', 'Email already verified.');
});

test('cannot verify magic link with invalid token for unverified user', function () {
    $response = $this->postJson('/api/email/verify-magic', [
        'token' => 'non-existent-token',
    ]);

    $response->assertStatus(422);
});

test('authenticated user can resend verification OTP', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();
    EmailVerificationToken::create([
        'user_id' => $user->id,
        'token' => 'OLD123',
        'encrypted_token' => 'old-enc-token',
        'expires_at' => now()->addMinutes(5),
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/email/verification-notification/resend', [
            'email' => $user->email,
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('message', 'Verification OTP resent.');

    Notification::assertSentTo($user, VerifyEmailNotification::class);
});
