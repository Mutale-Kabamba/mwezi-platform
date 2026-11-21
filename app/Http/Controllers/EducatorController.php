<?php

namespace App\Http\Controllers;

use App\Models\EducationalCategory;
use App\Models\EducationalResource;
use App\Models\EducationalResourceAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EducatorController extends Controller
{
    public function studio(Request $request): Response
    {
        $user = $request->user();
        $isApproved = $user->isApprovedEducator();

        $resources = $isApproved
            ? EducationalResource::where('author_id', $user->id)
                ->with(['category', 'attachments', 'reviewer:id,name'])
                ->latest()
                ->get()
            : collect();

        return Inertia::render('Educator/Studio', [
            'educatorStatus' => $isApproved ? 'approved' : ($user->educator_status ?? 'none'),
            'educatorBio' => $user->educator_bio,
            'resources' => $resources,
            'categories' => EducationalCategory::orderBy('sort_order')->get(),
        ]);
    }

    public function apply(Request $request)
    {
        $user = $request->user();

        if ($user->isApprovedEducator()) {
            return back()->with('info', 'You already have approved educator access.');
        }

        $validated = $request->validate([
            'educator_bio' => 'required|string|min:15|max:1000',
        ]);

        $user->update([
            'educator_status' => 'pending',
            'educator_bio' => $validated['educator_bio'],
            'educator_applied_at' => now(),
        ]);

        return back()->with('success', 'Educator application submitted! An Admin or verified Clinician will review it shortly.');
    }

    public function storeResource(Request $request)
    {
        $user = $request->user();
        if (!$user->isApprovedEducator()) {
            abort(403, 'Approved educator access is required to create learning materials.');
        }

        $validated = $request->validate([
            'category_id' => 'required|exists:educational_categories,id',
            'title' => 'required|string|max:200',
            'summary' => 'required|string|max:500',
            'body_content' => 'required|string',
            'format' => 'required|in:article,checklist,infographic,audio_guide,video',
            'video_url' => 'required_if:format,video|nullable|url|max:500',
            'thumbnail_url' => 'nullable|url|max:500',
            'read_time_minutes' => 'nullable|integer|min:1|max:180',
            'quiz_questions' => 'nullable|array',
            'quiz_questions.*.question' => 'required|string|max:500',
            'quiz_questions.*.options' => 'required|array|min:2|max:6',
            'quiz_questions.*.options.*' => 'required|string|max:250',
            'quiz_questions.*.correct_index' => 'required|integer|min:0',
            'quiz_questions.*.explanation' => 'nullable|string|max:500',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,csv,txt,odt,ods,odp,png,jpg,jpeg,webp,mp3,wav,m4a|max:20480',
        ]);

        $resource = EducationalResource::create([
            'category_id' => $validated['category_id'],
            'author_id' => $user->id,
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . rand(100, 999),
            'summary' => $validated['summary'],
            'body_content' => $validated['body_content'],
            'format' => $validated['format'],
            'video_url' => $validated['format'] === 'video' ? ($validated['video_url'] ?? null) : null,
            'thumbnail_url' => $validated['thumbnail_url'] ?? null,
            'quiz_questions' => $validated['quiz_questions'] ?? null,
            'read_time_minutes' => $validated['read_time_minutes'] ?? 4,
            'review_status' => 'pending_medical_review',
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('lesson-materials', 'local');
                $resource->attachments()->create([
                    'uploaded_by' => $user->id,
                    'title' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                    'original_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_extension' => strtolower($file->getClientOriginalExtension()),
                    'mime_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        return back()->with('success', 'Learning material created and sent for Admin / Clinician approval before publishing.');
    }

    public function updateResource(Request $request, EducationalResource $resource)
    {
        $user = $request->user();
        if (!$user->isApprovedEducator() || ($resource->author_id !== $user->id && $user->role !== 'admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'category_id' => 'required|exists:educational_categories,id',
            'title' => 'required|string|max:200',
            'summary' => 'required|string|max:500',
            'body_content' => 'required|string',
            'format' => 'required|in:article,checklist,infographic,audio_guide,video',
            'video_url' => 'required_if:format,video|nullable|url|max:500',
            'thumbnail_url' => 'nullable|url|max:500',
            'read_time_minutes' => 'nullable|integer|min:1|max:180',
            'quiz_questions' => 'nullable|array',
            'quiz_questions.*.question' => 'required|string|max:500',
            'quiz_questions.*.options' => 'required|array|min:2|max:6',
            'quiz_questions.*.options.*' => 'required|string|max:250',
            'quiz_questions.*.correct_index' => 'required|integer|min:0',
            'quiz_questions.*.explanation' => 'nullable|string|max:500',
        ]);

        $resource->update([
            ...$validated,
            'video_url' => $validated['format'] === 'video' ? ($validated['video_url'] ?? null) : null,
            'review_status' => $user->role === 'admin' ? $resource->review_status : 'pending_medical_review',
        ]);

        return back()->with('success', 'Learning material updated and queued for approval.');
    }

    public function destroyResource(Request $request, EducationalResource $resource)
    {
        $user = $request->user();
        if (!$user->isApprovedEducator() || ($resource->author_id !== $user->id && $user->role !== 'admin')) {
            abort(403);
        }

        foreach ($resource->attachments as $attachment) {
            Storage::disk('local')->delete($attachment->file_path);
        }
        $resource->delete();

        return back()->with('success', 'Learning material deleted.');
    }

    public function storeAttachment(Request $request, EducationalResource $resource)
    {
        $user = $request->user();
        if (!$user->isApprovedEducator() || ($resource->author_id !== $user->id && $user->role !== 'admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:200',
            'file' => 'required|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,csv,txt,odt,ods,odp,png,jpg,jpeg,webp,mp3,wav,m4a|max:20480',
        ]);

        $file = $request->file('file');
        $path = $file->store('lesson-materials', 'local');

        $resource->attachments()->create([
            'uploaded_by' => $user->id,
            'title' => $validated['title'] ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_extension' => strtolower($file->getClientOriginalExtension()),
            'mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return back()->with('success', 'Document material attached.');
    }

    public function destroyAttachment(Request $request, EducationalResourceAttachment $attachment)
    {
        $user = $request->user();
        $resource = $attachment->resource;
        if (!$user->isApprovedEducator() || !$resource || ($resource->author_id !== $user->id && $user->role !== 'admin')) {
            abort(403);
        }

        Storage::disk('local')->delete($attachment->file_path);
        $attachment->delete();

        return back()->with('success', 'Document material removed.');
    }
}
