<?php

namespace App\Mail;

use App\Models\Registration;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Symfony\Component\Mime\Email;

class RegistrationConfirmation extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Registration $registration,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Konfirmasi Pendaftaran LATIN & LATPEL 2026 — '.$this->registration->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.registration-confirmation',
            with: [
                'registration' => $this->registration,
                'whatsappGroupLink' => 'https://chat.whatsapp.com/GGZzpmmhzpRIAqBx0l4qES?mode=gi_t',
            ],
        );
    }

    /**
     * Embed logo sebagai inline attachment agar tampil di semua email client.
     */
    public function build(): self
    {
        return $this->withSymfonyMessage(function (Email $message) {
            $logoPath = public_path('images/logo-lala.png');
            if (file_exists($logoPath)) {
                $message->embed(
                    fopen($logoPath, 'r'),
                    'logo-lala.png',
                    'image/png',
                );
            }
        });
    }
}
