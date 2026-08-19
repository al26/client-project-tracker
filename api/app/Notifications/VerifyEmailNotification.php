<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerifyEmailNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        protected string $otp,
        protected string $magicLink,
    ) {
        $this->afterCommit();
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(mixed $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Verify your email address')
            ->line('Please verify your email address by entering the code below or clicking the link:')
            ->line('**OTP Code:** '.$this->otp)
            ->line('**Magic Link:** '.$this->magicLink)
            ->action('Verify Email Now', $this->magicLink)
            ->line('This code will expire in 10 minutes.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable): array
    {
        return [
            'otp' => $this->otp,
            'magic_link' => $this->magicLink,
        ];
    }
}
