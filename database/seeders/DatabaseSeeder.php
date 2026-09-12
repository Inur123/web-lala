<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Buat default admin user
        User::updateOrCreate(
            ['email' => 'superadmin@pelajarnumagetan.or.id'],
            [
                'name' => 'Super Admin Magetan',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // Buat default system setting: pendaftaran dibuka
        SystemSetting::updateOrCreate(
            ['key' => 'registration_open'],
            ['value' => 'true']
        );

        $this->command->info('✅ Admin user: superadmin@pelajarnumagetan.or.id / password123');
        $this->command->info('✅ Registration status: OPEN');
    }
}
