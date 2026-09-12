<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('registrations')
            ->where('admin_status', 'ditolak')
            ->where('screening_status', '!=', 'ditolak')
            ->update([
                'screening_status' => 'ditolak',
                'screening_reviewed_at' => now(),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // Status lama tidak dapat dipulihkan dengan aman setelah disinkronkan.
    }
};
