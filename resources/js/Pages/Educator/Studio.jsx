import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import {
    BookOpen,
    Clock,
    CheckCircle2,
    Plus,
    Trash2,
    Edit3,
    Video,
    HelpCircle,
    Paperclip,
    Download,
    Sparkles,
    X,
    FileText,
    ListChecks,
    Image as ImageIcon,
    Volume2,
} from 'lucide-react';

const FORMAT_OPTIONS = [
    {
        id: 'article',
        label: 'Article',
        icon: FileText,
        hint: 'Structured written guide with optional downloadable handouts & quiz.',
        durationLabel: 'Min Read',
        summaryLabel: 'Short Summary',
        summaryPlaceholder: 'Brief overview shown on the Learn feed...',
        bodyLabel: 'Full Article Content (Markdown)',
        bodyPlaceholder: 'Write clear sections, headings, and key health guidance...',
        attachLabel: 'Attach Handouts (PDF, DOC, PPTX, XLSX, CSV)',
        attachAccept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.odt,.ods,.odp',
        showQuiz: true,
    },
    {
        id: 'video',
        label: 'Video',
        icon: Video,
        hint: 'Embed a YouTube, Vimeo, or MP4 lesson with notes, slides & comprehension quiz.',
        durationLabel: 'Video Min',
        summaryLabel: 'Video Overview',
        summaryPlaceholder: 'What will learners watch and take away from this video?',
        bodyLabel: 'Key Takeaways & Timestamps',
        bodyPlaceholder: 'e.g., 0:00 Intro\n1:30 How to track cycle days\n3:45 When to visit a clinic',
        attachLabel: 'Attach Companion Slides / Worksheet (PPTX, PDF, DOCX)',
        attachAccept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt',
        showQuiz: true,
    },
    {
        id: 'checklist',
        label: 'Checklist',
        icon: ListChecks,
        hint: 'Step-by-step actionable routine learners can follow and tick off.',
        durationLabel: 'Est. Min',
        summaryLabel: 'Checklist Purpose',
        summaryPlaceholder: 'e.g., Step-by-step hygiene routine for washing & drying reusable pads.',
        attachLabel: 'Attach Printable Checklist (PDF, DOCX)',
        attachAccept: '.pdf,.doc,.docx,.txt',
        showQuiz: false,
    },
    {
        id: 'infographic',
        label: 'Infographic',
        icon: ImageIcon,
        hint: 'Visual poster or diagram with accessible bullet highlights & downloadable file.',
        summaryLabel: 'Visual Summary',
        summaryPlaceholder: 'Briefly describe what this chart or poster illustrates...',
        bodyLabel: 'Accessible Description & Key Visual Points',
        bodyPlaceholder: 'List the key facts shown in the graphic so screen-readers & low-data users can read them...',
        attachLabel: 'Attach High-Res Poster / Visual (PNG, JPG, PDF, PPTX)',
        attachAccept: '.png,.jpg,.jpeg,.webp,.pdf,.ppt,.pptx',
        showQuiz: false,
    },
    {
        id: 'audio_guide',
        label: 'Audio',
        icon: Volume2,
        hint: 'Voice-friendly script automatically narrated in Mwezi, plus optional MP3 upload.',
        durationLabel: 'Audio Min',
        summaryLabel: 'Audio Guide Summary',
        summaryPlaceholder: 'What will learners hear in this audio session?',
        bodyLabel: 'Narration Script / Transcript (Auto-Narrated)',
        bodyPlaceholder: 'Write in warm, conversational sentences for clear audio narration...',
        attachLabel: 'Attach Audio Track or Transcript (MP3, WAV, M4A, PDF)',
        attachAccept: '.mp3,.wav,.m4a,.pdf,.doc,.docx,.txt',
        showQuiz: true,
    },
];

const parseChecklistSteps = (markdown) => {
    if (!markdown) return ['', '', ''];
    const lines = markdown
        .split('\n')
        .map((line) => line.replace(/^\s*(?:[-*]|\d+\.)\s*(?:\[[ xX]\]\s*)?/, '').trim())
        .filter(Boolean);
    return lines.length >= 1 ? lines : ['', '', ''];
};

export default function EducatorStudio({
    educatorStatus = 'none',
    educatorBio = '',
    resources = [],
    categories = [],
}) {
    const { errors = {}, flash = {} } = usePage().props;
    const errorMessages = Object.values(errors).flat().filter(Boolean);
    const [bioInput, setBioInput] = useState(educatorBio || '');
    const [applying, setApplying] = useState(false);

    // CRUD Engine State
    const [showEditor, setShowEditor] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingForId, setUploadingForId] = useState(null);

    const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [bodyContent, setBodyContent] = useState('');
    const [checklistSteps, setChecklistSteps] = useState(['', '', '']);
    const [format, setFormat] = useState('article');
    const [videoUrl, setVideoUrl] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [readTime, setReadTime] = useState(5);
    const [attachments, setAttachments] = useState([]);
    const [quizQuestions, setQuizQuestions] = useState([]);

    const activeFormat = FORMAT_OPTIONS.find((f) => f.id === format) || FORMAT_OPTIONS[0];

    const resetEditor = () => {
        setEditingId(null);
        setCategoryId(categories[0]?.id || '');
        setTitle('');
        setSummary('');
        setBodyContent('');
        setChecklistSteps(['', '', '']);
        setFormat('article');
        setVideoUrl('');
        setThumbnailUrl('');
        setReadTime(5);
        setAttachments([]);
        setQuizQuestions([]);
        setShowEditor(false);
    };

    const startEdit = (res) => {
        setEditingId(res.id);
        setCategoryId(res.category_id || categories[0]?.id || '');
        setTitle(res.title || '');
        setSummary(res.summary || '');
        setFormat(res.format || 'article');
        setBodyContent(res.body_content || '');
        if (res.format === 'checklist') {
            setChecklistSteps(parseChecklistSteps(res.body_content));
        } else {
            setChecklistSteps(['', '', '']);
        }
        setVideoUrl(res.video_url || '');
        setThumbnailUrl(res.thumbnail_url || '');
        setReadTime(res.read_time_minutes || 5);
        setAttachments([]);
        setQuizQuestions(
            Array.isArray(res.quiz_questions)
                ? res.quiz_questions.map((q) => ({
                    question: q.question || '',
                    options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['', '', ''],
                    correct_index: Number(q.correct_index) || 0,
                    explanation: q.explanation || '',
                }))
                : []
        );
        setShowEditor(true);
    };

    const handleFormatChange = (nextFormat) => {
        if (nextFormat === 'checklist' && format !== 'checklist') {
            setChecklistSteps(bodyContent.trim() ? parseChecklistSteps(bodyContent) : ['', '', '']);
        } else if (format === 'checklist' && nextFormat !== 'checklist') {
            const compiled = checklistSteps.map((s) => s.trim()).filter(Boolean).map((s) => `- ${s}`).join('\n');
            if (compiled && !bodyContent.trim()) {
                setBodyContent(compiled);
            }
        }
        setFormat(nextFormat);
    };

    const handleApply = (e) => {
        e.preventDefault();
        setApplying(true);
        router.post(
            route('educator.apply'),
            { educator_bio: bioInput },
            {
                preserveScroll: true,
                onFinish: () => setApplying(false),
            }
        );
    };

    const addChecklistStep = () => setChecklistSteps((prev) => [...prev, '']);
    const updateChecklistStep = (idx, value) =>
        setChecklistSteps((prev) => prev.map((step, i) => (i === idx ? value : step)));
    const removeChecklistStep = (idx) =>
        setChecklistSteps((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

    const addQuizQuestion = () => {
        setQuizQuestions((prev) => [
            ...prev,
            { question: '', options: ['', '', ''], correct_index: 0, explanation: '' },
        ]);
    };

    const updateQuizQuestion = (idx, field, value) => {
        setQuizQuestions((prev) =>
            prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
        );
    };

    const updateQuizOption = (qIdx, oIdx, value) => {
        setQuizQuestions((prev) =>
            prev.map((q, i) =>
                i === qIdx
                    ? { ...q, options: q.options.map((opt, j) => (j === oIdx ? value : opt)) }
                    : q
            )
        );
    };

    const removeQuizQuestion = (idx) => {
        setQuizQuestions((prev) => prev.filter((_, i) => i !== idx));
    };

    const normalizeUrl = (value) => {
        const trimmed = (value || '').trim();
        if (!trimmed) return '';
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    };

    const handleSaveResource = (e) => {
        e.preventDefault();
        setSubmitting(true);

        const finalBodyContent =
            format === 'checklist'
                ? checklistSteps
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((s, idx) => `${idx + 1}. [ ] ${s}`)
                    .join('\n')
                : bodyContent;

        const cleanedQuiz = activeFormat.showQuiz
            ? quizQuestions
                .filter((q) => q.question.trim() && q.options.filter((o) => o.trim()).length >= 2)
                .map((q) => ({
                    question: q.question.trim(),
                    options: q.options.map((o) => o.trim()).filter(Boolean),
                    correct_index: Number(q.correct_index) || 0,
                    explanation: q.explanation?.trim() || '',
                }))
            : [];

        const normalizedVideoUrl = format === 'video' ? normalizeUrl(videoUrl) : '';
        const normalizedThumbnailUrl = format === 'infographic' ? normalizeUrl(thumbnailUrl) : '';

        const payload = {
            category_id: categoryId || categories[0]?.id,
            title: title.trim(),
            summary: summary.trim(),
            body_content: (finalBodyContent || summary).trim(),
            format,
            read_time_minutes: format === 'infographic' ? 2 : Number(readTime) || 4,
        };

        if (normalizedVideoUrl) {
            payload.video_url = normalizedVideoUrl;
        }
        if (normalizedThumbnailUrl) {
            payload.thumbnail_url = normalizedThumbnailUrl;
        }
        if (cleanedQuiz.length > 0) {
            payload.quiz_questions = cleanedQuiz;
        }

        if (editingId) {
            router.patch(route('educator.resources.update', editingId), payload, {
                preserveScroll: true,
                onSuccess: () => resetEditor(),
                onFinish: () => setSubmitting(false),
            });
        } else {
            const hasFiles = attachments.length > 0;
            const createPayload = hasFiles ? { ...payload, attachments } : payload;
            router.post(
                route('educator.resources.store'),
                createPayload,
                {
                    forceFormData: hasFiles,
                    preserveScroll: true,
                    onSuccess: () => resetEditor(),
                    onFinish: () => setSubmitting(false),
                }
            );
        }
    };

    const handleDeleteResource = (id) => {
        router.delete(route('educator.resources.destroy', id), { preserveScroll: true });
    };

    const handleAttachFile = (resourceId, file) => {
        if (!file) return;
        setUploadingForId(resourceId);
        router.post(
            route('educator.attachments.store', resourceId),
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setUploadingForId(null),
            }
        );
    };

    const handleDeleteAttachment = (attachmentId) => {
        router.delete(route('educator.attachments.destroy', attachmentId), {
            preserveScroll: true,
        });
    };

    return (
        <MobileAppLayout
            title="Educator Studio"
            subtitle={educatorStatus === 'approved' ? 'Smart Content Engine' : 'Become an Educator'}
            backUrl="/learn"
        >
            <Head title="Educator Studio - Mwezi" />

            <div className="space-y-4">
                {flash?.success && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                        {flash.success}
                    </div>
                )}

                {(flash?.error || errorMessages.length > 0) && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                        {flash?.error && <p className="font-bold">{flash.error}</p>}
                        {errorMessages.map((msg, idx) => (
                            <p key={idx} className="font-medium">• {msg}</p>
                        ))}
                    </div>
                )}

                {educatorStatus !== 'approved' ? (
                    educatorStatus === 'pending' ? (
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-2xs border border-white/95 text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                                    Pending Review
                                </span>
                                <h2 className="font-extrabold text-sm text-[#2D2638] mt-2">
                                    Your Educator Application is Under Review
                                </h2>
                                <p className="text-xs text-[#6E637C] mt-1 leading-relaxed">
                                    An Admin or verified Health Personnel will review your application. Once approved, you&apos;ll unlock the Content Creation CRUD Engine.
                                </p>
                            </div>
                            {educatorBio && (
                                <div className="p-3 rounded-2xl bg-white/75 border border-white text-left">
                                    <span className="text-[10px] font-bold uppercase text-[#6E637C] block mb-1">
                                        Submitted Background
                                    </span>
                                    <p className="text-xs text-[#2D2638]">{educatorBio}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-2xs border border-white/95 space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 rounded-2xl bg-purple-100/85 text-[#7C3AED] flex items-center justify-center shrink-0">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-extrabold text-sm text-[#2D2638]">
                                        Apply to Become a Mwezi Educator
                                    </h2>
                                    <p className="text-[11px] text-[#6E637C] mt-0.5 leading-relaxed">
                                        Approved educators can create articles, video lessons, interactive checklists, infographics, audio guides, quizzes, and downloadable materials.
                                    </p>
                                </div>
                            </div>

                            {educatorStatus === 'rejected' && (
                                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-[11px] text-rose-700 font-medium">
                                    Your previous application was not approved. You can update your qualifications below and re-apply.
                                </div>
                            )}

                            <form onSubmit={handleApply} className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-[#5E546B] mb-1">
                                        Your Background, Qualifications &amp; Topics
                                    </label>
                                    <textarea
                                        required
                                        minLength={15}
                                        rows={4}
                                        value={bioInput}
                                        onChange={(e) => setBioInput(e.target.value)}
                                        placeholder="Tell us about your teaching, health education, or community outreach experience (min 15 characters)..."
                                        className="w-full px-3.5 py-2.5 bg-white/85 border border-white rounded-2xl text-xs text-[#2D2638]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={applying}
                                    className="w-full py-3 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-full text-xs shadow-md shadow-purple-300/40 transition active:scale-98 disabled:opacity-60"
                                >
                                    {applying ? 'Submitting...' : 'Submit Educator Application'}
                                </button>
                            </form>
                        </div>
                    )
                ) : (
                    <>
                        {/* APPROVED EDUCATOR HEADER */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                                        Approved Educator
                                    </span>
                                    <h2 className="font-extrabold text-xs text-[#2D2638] truncate">
                                        Smart Content Studio
                                    </h2>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => (showEditor ? resetEditor() : setShowEditor(true))}
                                className="px-3.5 py-2 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[11px] font-bold inline-flex items-center space-x-1 shrink-0 shadow-xs active:scale-95 transition"
                            >
                                {showEditor ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                <span>{showEditor ? 'Close' : 'New Lesson'}</span>
                            </button>
                        </div>

                        {/* SMART DYNAMIC CREATE / EDIT LESSON FORM */}
                        {showEditor && (
                            <form
                                onSubmit={handleSaveResource}
                                className="bg-white/85 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white space-y-3.5"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-xs text-[#2D2638]">
                                        {editingId ? 'Edit Learning Material' : 'Create Learning Material'}
                                    </h3>
                                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] text-[9.5px] font-bold uppercase">
                                        {activeFormat.label}
                                    </span>
                                </div>

                                {/* 1. SMART VISUAL FORMAT PICKER */}
                                <div className="space-y-1.5">
                                    <label className="block text-[10.5px] font-semibold text-[#5E546B]">
                                        Select Content Format
                                    </label>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {FORMAT_OPTIONS.map((opt) => {
                                            const Icon = opt.icon;
                                            const isSelected = format === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => handleFormatChange(opt.id)}
                                                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition active:scale-95 ${
                                                        isSelected
                                                            ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-xs'
                                                            : 'bg-white border-purple-100 text-[#5E546B] hover:bg-purple-50/60'
                                                    }`}
                                                >
                                                    <Icon className="w-3.5 h-3.5 mb-1" />
                                                    <span className="text-[9.5px] font-bold leading-none">
                                                        {opt.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10.5px] text-[#6E637C] bg-purple-50/70 border border-purple-100/80 rounded-2xl px-3 py-2">
                                        {activeFormat.hint}
                                    </p>
                                </div>

                                {/* 2. CATEGORY & DURATION (Dynamic per format) */}
                                <div className={format === 'infographic' ? '' : 'grid grid-cols-3 gap-2'}>
                                    <div className={format === 'infographic' ? '' : 'col-span-2'}>
                                        <label className="block text-[10.5px] font-semibold text-[#5E546B] mb-1">
                                            Category
                                        </label>
                                        <select
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 bg-white border border-purple-100 rounded-2xl text-xs font-semibold text-[#2D2638]"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {format !== 'infographic' && (
                                        <div>
                                            <label className="block text-[10.5px] font-semibold text-[#5E546B] mb-1">
                                                {activeFormat.durationLabel}
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="180"
                                                value={readTime}
                                                onChange={(e) => setReadTime(e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-purple-100 rounded-2xl text-xs text-[#2D2638]"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* 3. TITLE */}
                                <div>
                                    <label className="block text-[10.5px] font-semibold text-[#5E546B] mb-1">
                                        {activeFormat.label} Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={`Enter ${activeFormat.label.toLowerCase()} title...`}
                                        className="w-full px-3.5 py-2 bg-white border border-purple-100 rounded-2xl text-xs text-[#2D2638]"
                                    />
                                </div>

                                {/* 4. FORMAT-SPECIFIC PRIMARY MEDIA FIELDS */}
                                {format === 'video' && (
                                    <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-1.5">
                                        <label className="flex items-center space-x-1.5 text-[11px] font-bold text-sky-900">
                                            <Video className="w-3.5 h-3.5 text-sky-600" />
                                            <span>Video URL (Required — YouTube, Vimeo, or MP4)</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                            className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs text-[#2D2638]"
                                        />
                                    </div>
                                )}

                                {format === 'infographic' && (
                                    <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-2">
                                        <label className="flex items-center space-x-1.5 text-[11px] font-bold text-[#2D2638]">
                                            <ImageIcon className="w-3.5 h-3.5 text-[#7C3AED]" />
                                            <span>Infographic Image / Poster URL (optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={thumbnailUrl}
                                            onChange={(e) => setThumbnailUrl(e.target.value)}
                                            placeholder="https://example.com/poster.png"
                                            className="w-full px-3 py-2 bg-white border border-purple-100 rounded-xl text-xs text-[#2D2638]"
                                        />
                                        {thumbnailUrl && (
                                            <img
                                                src={thumbnailUrl}
                                                alt="Preview"
                                                className="w-full max-h-40 object-cover rounded-xl border border-white bg-white"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>
                                )}

                                {/* 5. SUMMARY */}
                                <div>
                                    <label className="block text-[10.5px] font-semibold text-[#5E546B] mb-1">
                                        {activeFormat.summaryLabel}
                                    </label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        placeholder={activeFormat.summaryPlaceholder}
                                        className="w-full px-3.5 py-2 bg-white border border-purple-100 rounded-2xl text-xs text-[#2D2638]"
                                    />
                                </div>

                                {/* 6. FORMAT-SPECIFIC CONTENT BODY OR INTERACTIVE CHECKLIST BUILDER */}
                                {format === 'checklist' ? (
                                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-900">
                                                <ListChecks className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Checklist Steps ({checklistSteps.filter((s) => s.trim()).length})</span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={addChecklistStep}
                                                className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold"
                                            >
                                                + Add Step
                                            </button>
                                        </div>
                                        <div className="space-y-1.5">
                                            {checklistSteps.map((step, idx) => (
                                                <div key={idx} className="flex items-center space-x-1.5">
                                                    <span className="w-5 h-5 rounded-full bg-white text-emerald-700 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                                                        {idx + 1}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        required={idx === 0}
                                                        value={step}
                                                        onChange={(e) => updateChecklistStep(idx, e.target.value)}
                                                        placeholder={`Step ${idx + 1}...`}
                                                        className="flex-1 px-3 py-1.5 bg-white border border-emerald-100 rounded-xl text-xs text-[#2D2638]"
                                                    />
                                                    {checklistSteps.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeChecklistStep(idx)}
                                                            className="text-rose-400 hover:text-rose-600 p-1"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-[10.5px] font-semibold text-[#5E546B] mb-1">
                                            {activeFormat.bodyLabel}
                                        </label>
                                        <textarea
                                            required
                                            rows={format === 'audio_guide' ? 5 : 4}
                                            value={bodyContent}
                                            onChange={(e) => setBodyContent(e.target.value)}
                                            placeholder={activeFormat.bodyPlaceholder}
                                            className="w-full px-3.5 py-2 bg-white border border-purple-100 rounded-2xl text-xs text-[#2D2638]"
                                        />
                                    </div>
                                )}

                                {/* 7. FORMAT-TAILORED ATTACHMENTS */}
                                {!editingId && (
                                    <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1.5">
                                        <label className="flex items-center space-x-1.5 text-[11px] font-bold text-[#2D2638]">
                                            <Paperclip className="w-3.5 h-3.5 text-[#7C3AED]" />
                                            <span>{activeFormat.attachLabel}</span>
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            accept={activeFormat.attachAccept}
                                            onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                                            className="w-full text-[11px] text-[#5E546B] file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-purple-100 file:text-[#7C3AED]"
                                        />
                                        {attachments.length > 0 && (
                                            <p className="text-[10px] text-[#6E637C]">
                                                {attachments.length} file(s) selected
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* 8. QUIZ BUILDER (Only for formats that support comprehension quizzes) */}
                                {activeFormat.showQuiz && (
                                    <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center space-x-1.5 text-[11px] font-bold text-[#2D2638]">
                                                <HelpCircle className="w-3.5 h-3.5 text-[#7C3AED]" />
                                                <span>Quiz Questions ({quizQuestions.length})</span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={addQuizQuestion}
                                                className="px-2.5 py-1 rounded-full bg-purple-100 text-[#7C3AED] text-[10.5px] font-bold"
                                            >
                                                + Add Question
                                            </button>
                                        </div>

                                        {quizQuestions.map((q, qIdx) => (
                                            <div key={qIdx} className="p-2.5 rounded-2xl bg-white border border-purple-100 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-[#7C3AED]">
                                                        Question {qIdx + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuizQuestion(qIdx)}
                                                        className="text-rose-500 p-1"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={q.question}
                                                    onChange={(e) => updateQuizQuestion(qIdx, 'question', e.target.value)}
                                                    placeholder="Enter question..."
                                                    className="w-full px-3 py-1.5 bg-slate-50 rounded-xl text-xs text-[#2D2638]"
                                                />
                                                <div className="space-y-1">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={oIdx} className="flex items-center space-x-1.5">
                                                            <input
                                                                type="radio"
                                                                name={`ed-correct-${qIdx}`}
                                                                checked={Number(q.correct_index) === oIdx}
                                                                onChange={() => updateQuizQuestion(qIdx, 'correct_index', oIdx)}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={(e) => updateQuizOption(qIdx, oIdx, e.target.value)}
                                                                placeholder={`Option ${oIdx + 1}`}
                                                                className="flex-1 px-2.5 py-1 bg-slate-50 rounded-xl text-[11px] text-[#2D2638]"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={q.explanation}
                                                    onChange={(e) => updateQuizQuestion(qIdx, 'explanation', e.target.value)}
                                                    placeholder="Optional explanation..."
                                                    className="w-full px-3 py-1.5 bg-slate-50 rounded-xl text-[11px] text-[#5E546B]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-full text-xs shadow-md shadow-purple-300/40 transition active:scale-98 disabled:opacity-60"
                                >
                                    {submitting
                                        ? 'Saving...'
                                        : editingId
                                        ? `Update ${activeFormat.label} for Approval`
                                        : `Submit ${activeFormat.label} for Approval`}
                                </button>
                            </form>
                        )}

                        {/* MY LEARNING MATERIALS LIST */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="font-bold text-xs text-[#2D2638]">My Learning Materials</h3>
                                <span className="text-[10px] font-bold text-[#6E637C]">{resources.length} items</span>
                            </div>

                            {resources.length === 0 ? (
                                <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-6 border border-white/90 text-center space-y-1.5">
                                    <BookOpen className="w-6 h-6 text-[#7C3AED] mx-auto" />
                                    <p className="text-xs font-bold text-[#2D2638]">No lessons created yet</p>
                                    <p className="text-[11px] text-[#6E637C]">
                                        Tap &ldquo;New Lesson&rdquo; and pick a format to get started.
                                    </p>
                                </div>
                            ) : (
                                resources.map((res) => (
                                    <div
                                        key={res.id}
                                        className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-2.5"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase ${
                                                            res.review_status === 'approved'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : res.review_status === 'pending_medical_review'
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-slate-100 text-[#5E546B]'
                                                        }`}
                                                    >
                                                        {res.review_status === 'approved'
                                                            ? 'Published'
                                                            : res.review_status === 'pending_medical_review'
                                                            ? 'Awaiting Approval'
                                                            : 'Draft'}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full bg-purple-100/80 text-[#7C3AED] text-[9.5px] font-bold uppercase">
                                                        {(res.format || 'article').replace('_', ' ')}
                                                    </span>
                                                    {Array.isArray(res.quiz_questions) && res.quiz_questions.length > 0 && (
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9.5px] font-bold uppercase">
                                                            {res.quiz_questions.length} Quiz Qs
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-xs text-[#2D2638] mt-1">{res.title}</h4>
                                                <p className="text-[10.5px] text-[#6E637C] line-clamp-2">{res.summary}</p>
                                            </div>

                                            <div className="flex items-center space-x-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(res)}
                                                    className="p-1.5 rounded-full text-[#7C3AED] hover:bg-purple-50"
                                                    title="Edit"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteResource(res.id)}
                                                    className="p-1.5 rounded-full text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {res.attachments && res.attachments.length > 0 && (
                                            <div className="space-y-1.5">
                                                {res.attachments.map((att) => (
                                                    <div
                                                        key={att.id}
                                                        className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-white/80 border border-white"
                                                    >
                                                        <div className="flex items-center space-x-2 min-w-0">
                                                            <span className="px-1.5 py-0.5 rounded-lg bg-purple-100 text-[#7C3AED] font-mono text-[9px] font-extrabold uppercase shrink-0">
                                                                {att.file_extension || 'FILE'}
                                                            </span>
                                                            <span className="text-[11px] font-semibold text-[#2D2638] truncate">
                                                                {att.title || att.original_name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-1 shrink-0">
                                                            <a
                                                                href={route('learn.attachments.download', att.id)}
                                                                className="p-1 rounded-full text-[#7C3AED]"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteAttachment(att.id)}
                                                                className="p-1 rounded-full text-rose-400 hover:text-rose-600"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <label className="flex items-center justify-center space-x-1.5 w-full py-2 px-3 rounded-full bg-white/85 hover:bg-white border border-white text-[11px] font-bold text-[#7C3AED] cursor-pointer transition">
                                            <Paperclip className="w-3.5 h-3.5" />
                                            <span>
                                                {uploadingForId === res.id
                                                    ? 'Uploading...'
                                                    : 'Attach Material (PDF, DOC, PPTX, XLSX, PNG, MP3)'}
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.odt,.ods,.odp,.png,.jpg,.jpeg,.webp,.mp3,.wav,.m4a"
                                                disabled={uploadingForId === res.id}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleAttachFile(res.id, file);
                                                    e.target.value = '';
                                                }}
                                            />
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </MobileAppLayout>
    );
}
