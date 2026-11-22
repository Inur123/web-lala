<?php

namespace App\Mail;

use App\Models\Registration;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

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
        $appUrl = rtrim((string) config('app.url', 'http://localhost:8000'), '/');

        return new Content(
            view: 'emails.registration-confirmation',
            with: [
                'registration' => $this->registration,
                'whatsappGroupLink' => 'https://chat.whatsapp.com/IMTjiBcdKkRH3NiFVSADBj?s=cl&p=i&iam=2',
                'logoUrl' => $appUrl.'/images/logo-putih.png',
            ],
        );
    }
}
