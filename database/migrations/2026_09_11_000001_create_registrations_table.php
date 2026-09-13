<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->string('gender', 20);
            $table->string('delegation', 100);
            $table->text('reason');
            $table->string('shirt_size', 10)->nullable();
            $table->string('sleeve_type', 20)->nullable();
            $table->string('whatsapp', 30)->nullable();
            $table->string('birth_date', 20)->nullable();
            $table->string('email', 150)->unique();
            // Tahap 1: Seleksi Administrasi
            $table->enum('admin_status', ['pending', 'lolos', 'ditolak'])->default('pending');
            $table->text('admin_note')->nullable();
            $table->timestamp('admin_reviewed_at')->nullable();
            // Tahap 2: Seleksi Screening
            $table->enum('screening_status', ['pending', 'lolos', 'ditolak'])->default('pending');
            $table->text('screening_note')->nullable();
            $table->timestamp('screening_reviewed_at')->nullable();
            $table->timestamps();

            $table->index('created_at');
            $table->index(['admin_status', 'screening_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
