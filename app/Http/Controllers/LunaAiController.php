<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\LunaConversation;
use App\Models\LunaMessage;
use App\Services\LunaAiService;

class LunaAiController extends Controller
{
    protected LunaAiService $lunaService;

    public function __construct(LunaAiService $lunaService)
    {
        $this->lunaService = $lunaService;
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        $conversation = LunaConversation::firstOrCreate(
            ['user_id' => $user->id, 'title' => 'Health Conversation'],
            ['is_ephemeral' => false]
        );

        $messages = LunaMessage::where('conversation_id', $conversation->id)
            ->oldest()
            ->get();

        // Sample suggested prompt chips
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

    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'is_ephemeral' => 'nullable|boolean',
        ]);

        $user = $request->user();

        $conversation = LunaConversation::firstOrCreate(
            ['user_id' => $user->id],
            ['title' => 'Health Conversation', 'is_ephemeral' => $validated['is_ephemeral'] ?? false]
        );

        // 1. Save user message (field-level encrypted by model cast)
        LunaMessage::create([
            'conversation_id' => $conversation->id,
            'sender' => 'user',
            'message_text' => $validated['message'],
            'safety_flag' => 'none',
        ]);

        // 2. Generate grounded response with LunaAiService
        $aiResult = $this->lunaService->respond($validated['message'], $user->id);

        // 3. Save Luna response (field-level encrypted)
        $lunaMessage = LunaMessage::create([
            'conversation_id' => $conversation->id,
            'sender' => 'luna',
            'message_text' => $aiResult['message'],
            'referenced_resources' => $aiResult['referenced_resources'] ?? [],
            'safety_flag' => $aiResult['safety_flag'] ?? 'none',
        ]);

        return response()->json([
            'success' => true,
            'luna_message' => $lunaMessage,
            'escalation' => $aiResult['escalation'] ?? null,
            'referenced_resources' => $aiResult['referenced_resources'] ?? [],
            'safety_flag' => $aiResult['safety_flag'] ?? 'none',
        ]);
    }

    public function clear(Request $request)
    {
        $user = $request->user();
        $conversation = LunaConversation::where('user_id', $user->id)->first();
        if ($conversation) {
            LunaMessage::where('conversation_id', $conversation->id)->delete();
        }

        return back()->with('success', 'Conversation history cleared for your privacy.');
    }
}

