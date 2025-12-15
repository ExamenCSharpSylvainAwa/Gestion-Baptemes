<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('extraits_generes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained('demandes_extraits')->onDelete('cascade');
            $table->foreignId('bapteme_id')->constrained('baptemes')->onDelete('cascade');
            $table->string('numero_unique')->unique();
            $table->text('qr_code');
            $table->string('pdf_path');
            $table->string('signature_hash');
            $table->timestamp('date_generation');
            $table->boolean('valide')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('extraits_generes');
    }
};
