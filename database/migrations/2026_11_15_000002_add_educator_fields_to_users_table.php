<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'educator_status')) {
                $table->string('educator_status', 20)->default('none')->after('clinical_specialty');
            }
            if (!Schema::hasColumn('users', 'educator_bio')) {
                $table->text('educator_bio')->nullable()->after('educator_status');
            }
            if (!Schema::hasColumn('users', 'educator_applied_at')) {
                $table->timestamp('educator_applied_at')->nullable()->after('educator_bio');
            }
            if (!Schema::hasColumn('users', 'educator_approved_at')) {
                $table->timestamp('educator_approved_at')->nullable()->after('educator_applied_at');
            }
            if (!Schema::hasColumn('users', 'educator_approved_by')) {
                $table->foreignId('educator_approved_by')->nullable()->after('educator_approved_at')->constrained('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'educator_approved_by')) {
                $table->dropConstrainedForeignId('educator_approved_by');
            }
            foreach (['educator_approved_at', 'educator_applied_at', 'educator_bio', 'educator_status'] as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
