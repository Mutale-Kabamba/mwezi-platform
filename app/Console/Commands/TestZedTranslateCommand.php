<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ZambianTranslator;

class TestZedTranslateCommand extends Command
{
    protected $signature = 'zed:translate {text? : Text to translate} {--lang=bem} {--source=en}';
    protected $description = 'Test Zambian language translation using ZedTranslate API';

    public function handle(ZambianTranslator $translator): int
    {
        $text = $this->argument('text') ?? "Good morning, how can we help you today?";
        $target = $this->option('lang');
        $source = $this->option('source');

        $this->info("Translating with ZedTranslate API...");
        $this->line("Source [{$source}]: {$text}");
        $this->line("Target: {$target}");

        try {
            $translated = $translator->translate($text, $target, $source);

            if ($translated) {
                $this->newLine();
                $this->info("✓ Translation Result:");
                $this->line("  <fg=cyan>{$translated}</>");
                $this->newLine();
                return 0;
            }

            $this->error("Translation returned null or failed.");
            return 1;
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            return 1;
        }
    }
}
