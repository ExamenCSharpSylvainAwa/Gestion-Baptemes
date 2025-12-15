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
        Schema::create('demandes_extraits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('bapteme_id')->nullable()->constrained('baptemes')->onDelete('set null');
            $table->foreignId('paroisse_id')->constrained('paroisses')->onDelete('cascade');

            // Informations de recherche
            $table->string('prenoms_recherche');
            $table->string('nom_recherche');
            $table->date('date_naissance_recherche')->nullable();
            $table->string('nom_pere_recherche')->nullable();
            $table->string('nom_mere_recherche')->nullable();

            $table->enum('statut', ['en_attente', 'en_cours', 'valide', 'pret', 'rejete'])->default('en_attente');
            $table->decimal('montant', 10, 2)->default(0);
            $table->unsignedBigInteger('paiement_id')->nullable();
            $table->text('motif_rejet')->nullable();
            $table->text('commentaire')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demandes_extraits');
    }
};
