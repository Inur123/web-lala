<?php

namespace Database\Seeders;

use App\Models\Registration;
use App\Services\AttendanceRoster;
use Illuminate\Database\Seeder;

class RegistrationDemoSeeder extends Seeder
{
    public function run(AttendanceRoster $roster): void
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->command->warn('Seeder peserta demo dilewati di luar environment local/testing.');

            return;
        }

        $participants = [
            ['Ahmad Fauzan', 'l', 'PAC IPNU Magetan'],
            ['Siti Nur Aisyah', 'p', 'PAC IPPNU Magetan'],
            ['Muhammad Rizky Ramadhan', 'l', 'PAC IPNU Maospati'],
            ['Nabila Putri Maharani', 'p', 'PAC IPPNU Maospati'],
            ['Fajar Maulana', 'l', 'PAC IPNU Karas'],
            ['Dinda Rahmawati', 'p', 'PAC IPPNU Karas'],
            ['Bagus Prasetyo', 'l', 'PAC IPNU Plaosan'],
            ['Fitri Handayani', 'p', 'PAC IPPNU Plaosan'],
            ['Rizal Akbar', 'l', 'PAC IPNU Panekan'],
            ['Aulia Safitri', 'p', 'PAC IPPNU Panekan'],
            ['Ilham Nur Hakim', 'l', 'PAC IPNU Kawedanan'],
            ['Zahra Amalia', 'p', 'PAC IPPNU Kawedanan'],
            ['Dimas Aditya Pratama', 'l', 'PAC IPNU Parang'],
            ['Rania Khairunnisa', 'p', 'PAC IPPNU Parang'],
            ['Arif Setiawan', 'l', 'PAC IPNU Barat'],
            ['Salma Nur Fadilah', 'p', 'PAC IPPNU Barat'],
            ['Farhan Al Ghifari', 'l', 'PAC IPNU Bendo'],
            ['Nadya Oktaviani', 'p', 'PAC IPPNU Bendo'],
            ['Reza Firmansyah', 'l', 'PAC IPNU Takeran'],
            ['Laila Rahma Azzahra', 'p', 'PAC IPPNU Takeran'],
            ['Yoga Pratama', 'l', 'PAC IPNU Sukomoro'],
            ['Anisa Dwi Lestari', 'p', 'PAC IPPNU Sukomoro'],
            ['Hanif Maulana Akbar', 'l', 'PK IPNU MAN 2 Magetan'],
            ['Aisyah Nurul Hikmah', 'p', 'PK IPPNU MAN 2 Magetan'],
            ['Bintang Saputra Nugraha', 'l', 'PKPT IPNU Universitas Magetan'],
        ];

        foreach ($participants as $index => [$name, $gender, $delegation]) {
            [$adminStatus, $screeningStatus] = $this->statusesFor($index);
            $createdAt = now()->subHours(50 - $index);
            $adminReviewedAt = $adminStatus === 'pending'
                ? null
                : $createdAt->copy()->addHours(2);
            $screeningReviewedAt = $screeningStatus === 'pending'
                ? null
                : $createdAt->copy()->addHours(4);

            $registration = Registration::query()->updateOrCreate(
                ['email' => sprintf('peserta%02d@demo.local', $index + 1)],
                [
                    'name' => $name,
                    'gender' => $gender,
                    'delegation' => $delegation,
                    'reason' => 'Ingin meningkatkan kemampuan kaderisasi, kepemimpinan, dan kontribusi di organisasi.',
                    'whatsapp' => sprintf('08120000%04d', $index + 1),
                    'birth_date' => sprintf('%04d-%02d-%02d', 2000 + ($index % 6), ($index % 12) + 1, ($index % 27) + 1),
                    'admin_status' => $adminStatus,
                    'admin_reviewed_at' => $adminReviewedAt,
                    'screening_status' => $screeningStatus,
                    'screening_reviewed_at' => $screeningReviewedAt,
                ],
            );

            $registration->forceFill([
                'created_at' => $createdAt,
                'updated_at' => $screeningReviewedAt ?? $adminReviewedAt ?? $createdAt,
            ])->saveQuietly();

            if ($registration->screening_status === 'lolos') {
                $roster->syncRegistration($registration);
            }
        }

        $this->command->info('✅ 25 peserta demo siap untuk pengujian tampilan.');
    }

    /**
     * @return array{0: 'pending'|'lolos'|'ditolak', 1: 'pending'|'lolos'|'ditolak'}
     */
    private function statusesFor(int $index): array
    {
        return match (true) {
            $index < 5 => ['pending', 'pending'],
            $index < 12 => ['lolos', 'pending'],
            $index < 20 => ['lolos', 'lolos'],
            $index < 23 => ['lolos', 'ditolak'],
            default => ['ditolak', 'ditolak'],
        };
    }
}
