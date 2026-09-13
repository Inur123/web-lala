<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('registration_id');
            $table->string('field_key', 50);
            $table->string('file_name');
            $table->string('r2_key');
            $table->integer('file_size')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->string('upload_status', 20)->default('pending')->index();
            $table->unsignedSmallInteger('upload_attempts')->default(0);
            $table->text('upload_error')->nullable();
            $table->timestamp('upload_attempted_at')->nullable();
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamps();

            $table->foreign('registration_id')
                ->references('id')
                ->on('registrations')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_files');
    }
};
