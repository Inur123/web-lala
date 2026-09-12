<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('registrations', 'shirt_size')) {
            Schema::table('registrations', function (Blueprint $table) {
                $table->string('shirt_size', 10)->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        // Kolom tetap nullable agar data pendaftaran baru tanpa ukuran kaos
        // tidak rusak jika migration di-rollback sebagian.
    }
};
