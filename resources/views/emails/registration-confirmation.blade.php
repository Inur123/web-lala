<!DOCTYPE html>
<html lang="id" dir="ltr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <title>Konfirmasi Pendaftaran LATIN & LATPEL 2026</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset */
        body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }

        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .content-padding { padding: 24px 20px !important; }
            .data-label { display: block !important; padding-bottom: 4px !important; }
            .data-value { display: block !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

    <!-- Wrapper -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f0;">
        <tr>
            <td align="center" style="padding: 40px 16px;">

                <!-- Container -->
                <table role="presentation" class="container" width="580" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 100%); padding: 32px 40px; text-align: center;">
                            <img src="cid:logo-lala.png" alt="Logo LATIN LATPEL" width="64" height="64" style="display: inline-block; margin-bottom: 16px;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.3;">
                                Pendaftaran Berhasil
                            </h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px; line-height: 1.5;">
                                LATIN & LATPEL PC IPNU IPPNU Kabupaten Magetan 2026
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td class="content-padding" style="padding: 32px 40px;">

                            <!-- Greeting -->
                            <p style="margin: 0 0 20px; color: #1a1a1a; font-size: 15px; line-height: 1.6;">
                                Assalamu'alaikum Wr. Wb.
                            </p>
                            <p style="margin: 0 0 24px; color: #374151; font-size: 14px; line-height: 1.7;">
                                Terima kasih, <strong style="color: #1a4d2e;">{{ $registration->name }}</strong>. Pendaftaran Anda telah kami terima dan sedang dalam proses verifikasi oleh panitia. Berikut adalah data yang telah Anda kirimkan:
                            </p>

                            <!-- Data Table -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                                <tr style="background-color: #f8faf8;">
                                    <td colspan="2" style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                                        <strong style="color: #1a4d2e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Data Pendaftaran</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="data-label" width="160" style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; vertical-align: top;">Nama Lengkap</td>
                                    <td class="data-value" style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; color: #1a1a1a; font-size: 14px; font-weight: 600;">{{ $registration->name }}</td>
                                </tr>
                                <tr>
                                    <td class="data-label" width="160" style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; vertical-align: top;">Jenis Kelamin</td>
                                    <td class="data-value" style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; color: #1a1a1a; font-size: 14px;">{{ $registration->gender }}</td>
                                </tr>
                                <tr>
                                    <td class="data-label" width="160" style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; vertical-align: top;">Tanggal Lahir</td>
                                    <td class="data-value" style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; color: #1a1a1a; font-size: 14px;">{{ \Carbon\Carbon::parse($registration->birth_date)->translatedFormat('d F Y') }}</td>
                                </tr>
                                <tr>
                                    <td class="data-label" width="160" style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; vertical-align: top;">Delegasi / Utusan</td>
                                    <td class="data-value" style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; color: #1a1a1a; font-size: 14px;">{{ $registration->delegation }}</td>
                                </tr>
                                <tr>
                                    <td class="data-label" width="160" style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; vertical-align: top;">No. WhatsApp</td>
                                    <td class="data-value" style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; color: #1a1a1a; font-size: 14px;">{{ $registration->whatsapp }}</td>
                                </tr>
                                <tr>
                                    <td class="data-label" width="160" style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 13px; vertical-align: top;">Email</td>
                                    <td class="data-value" style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; color: #1a1a1a; font-size: 14px;">{{ $registration->email }}</td>
                                </tr>
                                <tr>
                                    <td class="data-label" width="160" style="padding: 10px 16px; color: #6b7280; font-size: 13px; vertical-align: top;">Alasan Pendaftaran</td>
                                    <td class="data-value" style="padding: 10px 16px; color: #1a1a1a; font-size: 14px; line-height: 1.6;">{{ $registration->reason }}</td>
                                </tr>
                            </table>

                            <!-- WhatsApp Group CTA -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 20px 24px;">
                                        <p style="margin: 0 0 4px; color: #166534; font-size: 14px; font-weight: 700;">
                                            Bergabung ke Grup WhatsApp
                                        </p>
                                        <p style="margin: 0 0 16px; color: #15803d; font-size: 13px; line-height: 1.5;">
                                            Silakan bergabung ke grup WhatsApp peserta untuk mendapatkan informasi terbaru seputar kegiatan.
                                        </p>
                                        <table role="presentation" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="border-radius: 8px; background-color: #25D366;">
                                                    <a href="{{ $whatsappGroupLink }}" target="_blank" style="display: inline-block; padding: 12px 28px; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; letter-spacing: 0.01em;">
                                                        Gabung Grup WhatsApp &rarr;
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Info -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #fefce8; border: 1px solid #fde68a; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                                            <strong>Catatan:</strong> Hasil seleksi akan diumumkan melalui grup WhatsApp dan dapat dipantau di halaman <a href="{{ config('app.url') }}/pendaftar" style="color: #92400e; text-decoration: underline;">Data Pendaftar</a>.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.7;">
                                Wassalamu'alaikum Wr. Wb.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; border-top: 1px solid #e5e7eb; text-align: center; background-color: #fafafa;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                                &copy; {{ date('Y') }} LATIN & LATPEL PC IPNU IPPNU Kabupaten Magetan
                            </p>
                            <p style="margin: 4px 0 0; color: #9ca3af; font-size: 11px;">
                                Email ini dikirim secara otomatis. Harap tidak membalas email ini.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
