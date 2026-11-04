<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\LunaConversation;
use App\Models\LunaMessage;
use App\Services\LunaAiService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LunaAiController extends Controller
{
    protected LunaAiService $lunaService;

    public function __construct(LunaAiService $lunaService)
    {
        $this->lunaService = $lunaService;
    }

    /**
     * Luna AI Start Page / Chat History Dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $conversations = LunaConversation::where('user_id', $user->id)
            ->with(['latestMessage'])
            ->withCount('messages')
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($conv) {
                return [
                    'id' => $conv->id,
                    'title' => $conv->title ?: 'Health Consultation',
                    'is_ephemeral' => (bool) $conv->is_ephemeral,
                    'messages_count' => $conv->messages_count,
                    'updated_at' => $conv->updated_at->diffForHumans(),
                    'created_at' => $conv->created_at->format('M j, Y'),
                    'last_message' => $conv->latestMessage ? [
                        'sender' => $conv->latestMessage->sender,
                        'text' => Str::limit($conv->latestMessage->message_text, 90),
                        'has_attachments' => !empty($conv->latestMessage->attachments),
                        'has_audio' => !empty($conv->latestMessage->audio_url),
                        'created_at' => $conv->latestMessage->created_at->diffForHumans(),
                    ] : null,
                ];
            });

        $suggestedPrompts = [
            'How do I wash and dry reusable pads safely?',
            'What causes painful period cramps and how to soothe them?',
            'Where can I get free emergency pads in Lusaka?',
            'Does drinking cold water clot menstrual flow?',
            'Explain the 4 phases of my menstrual cycle.',
        ];

        return Inertia::render('Luna/Index', [
            'conversations' => $conversations,
            'suggestedPrompts' => $suggestedPrompts,
        ]);
    }

    /**
     * Start a fresh conversation.
     */
    public function createConversation(Request $request)
    {
        $user = $request->user();

        $conversation = LunaConversation::create([
            'user_id' => $user->id,
            'title' => 'New Health Consultation',
            'is_ephemeral' => false,
        ]);

        return redirect()->route('luna.chat', $conversation->id);
    }

    /**
     * Active Chat Screen for a specific conversation.
     */
    public function chat(Request $request, LunaConversation $conversation): Response
    {
        if ($conversation->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $messages = LunaMessage::where('conversation_id', $conversation->id)
            ->oldest()
            ->get();

        $suggestedPrompts = [
            'How do I wash and dry reusable pads safely?',
            'What causes painful period cramps and how to soothe them?',
            'Where can I get free emergency pads in Lusaka?',
            'Does drinking cold water clot menstrual flow?',
            'Explain the 4 phases of my menstrual cycle.',
        ];

        return Inertia::render('Luna/Chat', [
            'conversation' => $conversation,
            'messages' => $messages,
            'suggestedPrompts' => $suggestedPrompts,
        ]);
    }

    /**
     * Delete an individual conversation thread and its uploaded media.
     */
    public function deleteConversation(Request $request, LunaConversation $conversation)
    {
        if ($conversation->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        // Clean up media assets from disk
        foreach ($conversation->messages as $msg) {
            if ($msg->attachments) {
                foreach ($msg->attachments as $att) {
                    if (!empty($att['path'])) {
                        Storage::disk('public')->delete($att['path']);
                    }
                }
            }
            if ($msg->audio_url) {
                $path = str_replace('/storage/', '', $msg->audio_url);
                Storage::disk('public')->delete($path);
            }
        }

        $conversation->delete();

        return redirect()->route('luna.index')->with('success', 'Conversation deleted.');
    }

    /**
     * Send Message: Supports Text, Up to 5 Files (2MB max each), and Audio Recording.
     */
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'conversation_id' => 'required|exists:luna_conversations,id',
            'message' => 'nullable|string|max:2000',
            'files' => 'nullable|array|max:5',
            'files.*' => 'file|max:2048|mimes:jpg,jpeg,png,webp,gif,pdf,doc,docx,txt',
            'audio' => 'nullable|file|max:2048|mimes:webm,ogg,mp3,wav,m4a,mp4',
            'audio_duration' => 'nullable|integer',
            'is_ephemeral' => 'nullable|boolean',
            'locale' => 'nullable|string|in:en,bem,nya,toi,loz',
        ]);

        $user = $request->user();
        $conversation = LunaConversation::findOrFail($validated['conversation_id']);

        if ($conversation->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        // Require at least text, files, or audio
        $hasText = !empty(trim($validated['message'] ?? ''));
        $hasFiles = $request->hasFile('files');
        $hasAudio = $request->hasFile('audio');

        if (!$hasText && !$hasFiles && !$hasAudio) {
            return response()->json([
                'success' => false, 
                'message' => 'Please enter a message, upload a file, or record a voice note.'
            ], 422);
        }

        $locale = $validated['locale'] ?? ($user->preferred_language ?? 'en');

        // Sync preferred language if provided
        if (!empty($validated['locale']) && $user->preferred_language !== $validated['locale']) {
            $user->preferred_language = $validated['locale'];
            $user->save();
        }

        // 1. Process File Attachments (Max 5, 2MB each)
        $attachments = [];
        $fileNames = [];
        if ($hasFiles) {
            foreach ($request->file('files') as $file) {
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $mimeType = $file->getMimeType();
                $size = $file->getSize();

                $storedPath = $file->store("luna_attachments/{$user->id}", 'public');

                $attachments[] = [
                    'name' => $originalName,
                    'path' => $storedPath,
                    'url' => Storage::url($storedPath),
                    'size' => $size,
                    'type' => $mimeType,
                    'is_image' => str_starts_with($mimeType, 'image/'),
                ];
                $fileNames[] = $originalName;
            }
        }

        // 2. Process Audio Recording Voice Note (Max 2MB)
        $audioUrl = null;
        $audioDuration = null;
        if ($hasAudio) {
            $audioFile = $request->file('audio');
            $storedAudioPath = $audioFile->store("luna_audio/{$user->id}", 'public');
            $audioUrl = Storage::url($storedAudioPath);
            $audioDuration = $request->input('audio_duration', null);
        }

        // Text representation for encrypted storage
        $storedText = $validated['message'] ?? '';
        if (empty($storedText)) {
            if ($hasAudio) {
                $storedText = "Voice message (" . ($audioDuration ? "{$audioDuration}s" : "audio") . ")";
            } elseif ($hasFiles) {
                $storedText = "Shared " . count($attachments) . " file(s): " . implode(', ', $fileNames);
            }
        }

        // Fetch last 6 conversation messages before adding the new message
        $historyMessages = $conversation->messages()
            ->latest()
            ->take(6)
            ->get()
            ->reverse()
            ->values()
            ->map(function ($msg) {
                return [
                    'sender' => $msg->sender,
                    'message_text' => $msg->message_text,
                ];
            })
            ->toArray();

        // 3. Save User Message (Field-level encrypted via model cast)
        $userMessage = LunaMessage::create([
            'conversation_id' => $conversation->id,
            'sender' => 'user',
            'message_text' => $storedText,
            'attachments' => !empty($attachments) ? $attachments : null,
            'audio_url' => $audioUrl,
            'audio_duration' => $audioDuration ? (int) $audioDuration : null,
            'safety_flag' => 'none',
        ]);

        // Dynamically update conversation title if default
        if ($conversation->title === 'New Health Consultation' || $conversation->title === 'Health Conversation') {
            $cleanTitle = Str::limit(trim($validated['message'] ?? ($hasAudio ? 'Voice Consultation' : 'File Analysis')), 42);
            if (!empty($cleanTitle)) {
                $conversation->update(['title' => $cleanTitle]);
            }
        }

        // Touch conversation updated_at
        $conversation->touch();

        // 4. Generate AI Response with LunaAiService
        $mediaContext = [
            'files_count' => count($attachments),
            'file_names' => $fileNames,
            'file_names_str' => implode(' ', $fileNames),
            'has_audio' => $hasAudio,
            'audio_duration' => $audioDuration,
        ];

        $aiPrompt = !empty($validated['message']) ? $validated['message'] : ($hasAudio ? "I sent a voice note." : "I uploaded " . count($attachments) . " file(s).");
        $aiResult = $this->lunaService->respond($aiPrompt, $user->id, $historyMessages, $locale, $mediaContext);

        // 5. Save Luna response (Field-level encrypted)
        $lunaMessage = LunaMessage::create([
            'conversation_id' => $conversation->id,
            'sender' => 'luna',
            'message_text' => $aiResult['message'],
            'referenced_resources' => $aiResult['referenced_resources'] ?? [],
            'safety_flag' => $aiResult['safety_flag'] ?? 'none',
        ]);

        // Record M&E Telemetry for clinical safety escalation
        if (($aiResult['safety_flag'] ?? '') === 'clinical_escalation') {
            \App\Models\MeImpactEvent::create([
                'event_type' => 'clinical_safety_escalation',
                'province' => 'Lusaka',
                'district' => 'Lusaka',
                'anonymized_cohort' => 'Adolescent-Consultation',
                'metadata' => [
                    'safety_flag' => 'clinical_escalation',
                    'voucher_code' => $aiResult['escalation']['voucher_code'] ?? null,
                ],
                'created_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'user_message' => $userMessage,
            'luna_message' => $lunaMessage,
            'conversation_title' => $conversation->title,
            'escalation' => $aiResult['escalation'] ?? null,
            'referenced_resources' => $aiResult['referenced_resources'] ?? [],
            'safety_flag' => $aiResult['safety_flag'] ?? 'none',
        ]);
    }

    /**
     * Clear all conversations for the user.
     */
    public function clear(Request $request)
    {
        $user = $request->user();
        $conversations = LunaConversation::where('user_id', $user->id)->get();

        foreach ($conversations as $conv) {
            foreach ($conv->messages as $msg) {
                if ($msg->attachments) {
                    foreach ($msg->attachments as $att) {
                        if (!empty($att['path'])) {
                            Storage::disk('public')->delete($att['path']);
                        }
                    }
                }
                if ($msg->audio_url) {
                    $path = str_replace('/storage/', '', $msg->audio_url);
                    Storage::disk('public')->delete($path);
                }
            }
            $conv->delete();
        }

        return redirect()->route('luna.index')->with('success', 'All Luna conversations cleared.');
    }

    /**
     * Rate Luna AI message helpfulness (thumbs up / thumbs down).
     */
    public function rateMessage(Request $request, LunaMessage $message)
    {
        if ($message->conversation->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'helpful_rating' => 'required|boolean',
        ]);

        $message->update(['helpful_rating' => $validated['helpful_rating']]);

        return response()->json([
            'success' => true,
            'helpful_rating' => $message->helpful_rating,
        ]);
    }
}
