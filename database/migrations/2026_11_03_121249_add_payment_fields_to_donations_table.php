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
        Schema::table('donations', function (Blueprint $table) {
            $table->string('donor_phone')->nullable()->after('donor_email');
            $table->string('payment_method')->default('broadpay_momo')->after('payment_reference'); // broadpay_momo, broadpay_card
            $table->string('gateway_transaction_id')->nullable()->after('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn(['donor_phone', 'payment_method', 'gateway_transaction_id']);
        });
    }
};
