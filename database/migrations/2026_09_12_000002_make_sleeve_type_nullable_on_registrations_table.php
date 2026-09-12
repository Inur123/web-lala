<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('registrations', 'sleeve_type')) {
            Schema::table('registrations', function (Blueprint $table) {
                $table->string('sleeve_type', 20)->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        // Tetap nullable agar pendaftaran baru tanpa tipe lengan tidak rusak.
    }
};
