<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('paroisses', function (Blueprint $table) {
            $table->foreignId('responsable_id')
                ->nullable()
                ->after('logo')
                ->constrained('users')
                ->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('paroisses', function (Blueprint $table) {
            $table->dropForeign(['responsable_id']);
            $table->dropColumn('responsable_id');
        });
    }
};
