<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('educational_resources', function (Blueprint $table) {
            if (!Schema::hasColumn('educational_resources', 'quiz_questions')) {
                $table->json('quiz_questions')->nullable()->after('video_url');
            }
        });

        if (!Schema::hasTable('educational_resource_attachments')) {
            Schema::create('educational_resource_attachments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('resource_id')->constrained('educational_resources')->cascadeOnDelete();
                $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
                $table->string('title');
                $table->string('original_name');
                $table->string('file_path');
                $table->string('file_extension', 20)->nullable();
                $table->string('mime_type', 150)->nullable();
                $table->unsignedBigInteger('file_size')->default(0);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('educational_resource_attachments');

        Schema::table('educational_resources', function (Blueprint $table) {
            if (Schema::hasColumn('educational_resources', 'quiz_questions')) {
                $table->dropColumn('quiz_questions');
            }
        });
    }
};

