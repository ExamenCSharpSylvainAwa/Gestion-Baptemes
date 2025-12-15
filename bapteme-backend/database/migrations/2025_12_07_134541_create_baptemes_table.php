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
        Schema::create('baptemes', function (Blueprint $table) {
            $table->id();
            $table->integer('numero_ordre');
            $table->year('annee_enregistrement');

            // Informations du baptisé
            $table->string('prenoms');
            $table->string('nom');
            $table->date('date_naissance');
            $table->string('lieu_naissance');
            $table->enum('sexe', ['M', 'F']);

            // Parents
            $table->string('nom_pere');
            $table->string('nom_mere');

            // Baptême
            $table->date('date_bapteme');
            $table->string('celebrant');

            // Parrains/Marraines
            $table->string('nom_parrain')->nullable();
            $table->string('representant_parrain')->nullable();
            $table->string('nom_marraine')->nullable();
            $table->string('representante_marraine')->nullable();

            // Sacrements ultérieurs
            $table->date('date_confirmation')->nullable();
            $table->string('lieu_confirmation')->nullable();
            $table->date('date_mariage')->nullable();
            $table->string('conjoint')->nullable();

            // Relations
            $table->foreignId('paroisse_id')->constrained('paroisses')->onDelete('cascade');
            $table->foreignId('created_by_user_id')->constrained('users')->onDelete('restrict');

            $table->timestamps();
            $table->softDeletes();

            // Index
            $table->index(['nom', 'prenoms']);
            $table->index('date_naissance');
            $table->index(['paroisse_id', 'annee_enregistrement', 'numero_ordre']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('baptemes');
    }
};
