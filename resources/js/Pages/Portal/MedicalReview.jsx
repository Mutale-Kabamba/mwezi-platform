import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import {
    Stethoscope,
    CheckCircle,
    FileText,
    Check,
    Plus,
    Trash2,
    Video,
    HelpCircle,
    Paperclip,
    Download,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

export default function MedicalReview({
    pendingArticles = [],
    approvedArticles = [],
    categories = [],
    educatorApplications = [],
}) {
    const { auth } = usePage().props;
    const hpczStatus = auth?.user?.hpcz_verification_status || 'unverified';
    const hpczNumber = auth?.user?.hpcz_registration_number;
    const canApprove = Boolean(auth?.tierPolicy?.can_approve_learning_content);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [bodyContent, setBodyContent] = useState('');
    const [format, setFormat] = useState('article');
    const [videoUrl, setVideoUrl] = useState('');
    const [readTime, setReadTime] = useState(5);
    const [attachments, setAttachments] = useState([]);
    const [quizQuestions, setQuizQuestions] = useState([]);

    const [uploadingForId, setUploadingForId] = useState(null);

    const handleApprove = (articleId) => {
        router.post(route('portal.reviewer.approve', articleId), {}, { preserveScroll: true });
    };

    const handleRejectResource = (articleId) => {
        router.post(route('portal.reviewer.reject', articleId), {}, { preserveScroll: true });
    };

    const handleEducatorReview = (userId, status) => {
        router.post(route('portal.educators.review', userId), { status }, { preserveScroll: true });
    };

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

    const handleCreateResource = (e) => {
        e.preventDefault();
        setSubmitting(true);

        const cleanedQuiz = quizQuestions
            .filter((q) => q.question.trim() && q.options.filter((o) => o.trim()).length >= 2)
            .map((q) => ({
                question: q.question.trim(),
                options: q.options.map((o) => o.trim()).filter(Boolean),
                correct_index: Number(q.correct_index) || 0,
                explanation: q.explanation?.trim() || '',
            }));

        const payload = {
            category_id: categoryId,
            title,
            summary,
            body_content: bodyContent,
            format,
            video_url: videoUrl || null,
            read_time_minutes: Number(readTime) || 4,
            quiz_questions: cleanedQuiz.length > 0 ? cleanedQuiz : null,
            attachments,
        };

        router.post(route('portal.reviewer.resources.store'), payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setTitle('');
                setSummary('');
                setBodyContent('');
                setFormat('article');
                setVideoUrl('');
                setReadTime(5);
                setAttachments([]);
                setQuizQuestions([]);
                setShowCreateForm(false);
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleAttachFile = (resourceId, file) => {
        if (!file) return;
        setUploadingForId(resourceId);
        router.post(
            route('portal.reviewer.attachments.store', resourceId),
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setUploadingForId(null),
            }
        );
    };

    const handleDeleteAttachment = (attachmentId) => {
        router.delete(route('portal.reviewer.attachments.destroy', attachmentId), {
            preserveScroll: true,
        });
    };

    const handleDeleteResource = (resourceId) => {
        router.delete(route('portal.reviewer.resources.destroy', resourceId), {
            preserveScroll: true,
        });
    };

    return (
        <MobileAppLayout
            title="Medical Review"
            subtitle="Clinical Content Governance"
            backUrl="/dashboard"
        >
            <Head title="Medical Review Queue - Mwezi" />

            <div className="space-y-4">
                {/* 1. CLINICAL GOVERNANCE PROFILE CARD */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-teal-100/85 text-teal-700 flex items-center justify-center shrink-0">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                                    Healthcare Reviewer
                                </span>
                                <h2 className="font-extrabold text-sm text-[#2D2638] leading-snug">
                                    Verified Medical Clearance Desk
                                </h2>
                                <div className="mt-1 flex items-center space-x-2 flex-wrap">
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase ${
                                            hpczStatus === 'verified'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : hpczStatus === 'rejected'
                                                ? 'bg-rose-100 text-rose-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                        HPCZ: {hpczStatus.replace(/_/g, ' ')}
                                    </span>
                                    {hpczNumber && (
                                        <span className="text-[10px] font-mono text-[#6E637C]">#{hpczNumber}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-2.5 rounded-2xl bg-amber-50/90 border border-amber-100 text-center">
                            <span className="block text-xl font-extrabold text-amber-800 leading-none">
                                {pendingArticles.length}
                            </span>
                            <span className="text-[9.5px] font-bold text-amber-700 uppercase tracking-wider mt-1 block">
                                Pending Review
                            </span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-emerald-50/90 border border-emerald-100 text-center">
                            <span className="block text-xl font-extrabold text-emerald-800 leading-none">
                                {approvedArticles.length}
                            </span>
                            <span className="text-[9.5px] font-bold text-emerald-700 uppercase tracking-wider mt-1 block">
                                Published Lessons
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. CREATE LESSON / GUIDE / VIDEO / QUIZ / MATERIALS */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowCreateForm((v) => !v)}
                        className="w-full flex items-center justify-between text-left"
                    >
                        <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-100/85 text-[#7C3AED] flex items-center justify-center shrink-0">
                                <Plus className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xs text-[#2D2638]">
                                    Publish New Lesson, Video or Quiz
                                </h3>
                                <p className="text-[10.5px] text-[#6E637C]">
                                    Attach PDF, Word, PowerPoint or Excel materials
                                </p>
                            </div>
                        </div>
                        {showCreateForm ? (
                            <ChevronUp className="w-4 h-4 text-[#6E637C]" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-[#6E637C]" />
                        )}
                    </button>

                    {showCreateForm && (
                        <form onSubmit={handleCreateResource} className="space-y-3 pt-2 border-t border-white">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10.5px] font-semibold text-[#5E546B] mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 bg-white/85 border border-white rounded-2xl text-xs font-semibold text-[#2D2638]"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10.5px] font-semibold text-[#5E546B] mb-1">
                                        Format
                                    </label>
                                    <select
                                        value={format}
                                        onChange={(e) => setFormat(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/85 border border-white rounded-2xl text-xs font-semibold text-[#2D2638]"
                                    >
                                        <option value="article">Article / Guide</option>
                                        <option value="video">Video Lesson</option>
                                        <option value="checklist">Checklist</option>
                                        <option value="infographic">Infographic</option>
                                        <option value="audio_guide">Audio Guide</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10.5px] font-semibold text-[#5E546B] mb-1">
                                    Lesson Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Understanding Your Menstrual Cycle"
                                    className="w-full px-3.5 py-2 bg-white/85 border border-white rounded-2xl text-xs text-[#2D2638]"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                    <label className="block text-[10.5px] font-semibold text-[#5E546B] mb-1">
                                        Video URL (optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full px-3 py-2 bg-white/85 border border-white rounded-2xl text-xs text-[#2D2638]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10.5px] font-semibold text-[#5E546B] mb-1">
                                        Min Read
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={readTime}
                                        onChange={(e) => setReadTime(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/85 border border-white rounded-2xl text-xs text-[#2D2638]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10.5px] font-semibold text-[#5E546B] mb-1">
                                    Short Summary
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="Brief overview for learners..."
                                    className="w-full px-3.5 py-2 bg-white/85 border border-white rounded-2xl text-xs text-[#2D2638]"
                                />
                            </div>

                            <div>
                                <label className="block text-[10.5px] font-semibold text-[#5E546B] mb-1">
                                    Lesson Content (Markdown supported)
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={bodyContent}
                                    onChange={(e) => setBodyContent(e.target.value)}
                                    placeholder="Write the full lesson or guide..."
                                    className="w-full px-3.5 py-2 bg-white/85 border border-white rounded-2xl text-xs text-[#2D2638]"
                                />
                            </div>

                            {/* Document Materials Upload */}
                            <div className="p-3 rounded-2xl bg-white/70 border border-white space-y-1.5">
                                <label className="flex items-center space-x-1.5 text-[11px] font-bold text-[#2D2638]">
                                    <Paperclip className="w-3.5 h-3.5 text-[#7C3AED]" />
                                    <span>Attach Downloadable Documents (PDF, DOC, PPTX, XLSX, CSV)</span>
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.odt,.ods,.odp"
                                    onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                                    className="w-full text-[11px] text-[#5E546B] file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-purple-100 file:text-[#7C3AED]"
                                />
                                {attachments.length > 0 && (
                                    <p className="text-[10px] text-[#6E637C]">
                                        {attachments.length} file(s) selected
                                    </p>
                                )}
                            </div>

                            {/* Quiz Questions Builder */}
                            <div className="p-3 rounded-2xl bg-white/70 border border-white space-y-2.5">
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
                                                        name={`correct-${qIdx}`}
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
                                            placeholder="Optional explanation shown after answer..."
                                            className="w-full px-3 py-1.5 bg-slate-50 rounded-xl text-[11px] text-[#5E546B]"
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-full text-xs shadow-md shadow-purple-300/40 transition active:scale-98 disabled:opacity-60"
                            >
                                {submitting ? 'Publishing...' : 'Publish Lesson'}
                            </button>
                        </form>
                    )}
                </div>

                {/* 3. PENDING REVIEW QUEUE */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h3 className="font-bold text-xs text-[#2D2638]">Awaiting Medical Clearance</h3>
                            <p className="text-[10.5px] text-[#6E637C]">
                                Partner submissions awaiting review
                            </p>
                        </div>
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                            {pendingArticles.length} Pending
                        </span>
                    </div>

                    {pendingArticles.length === 0 ? (
                        <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-5 border border-white/90 text-center space-y-1">
                            <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto" />
                            <p className="text-xs font-bold text-[#2D2638]">All submissions clinically approved</p>
                            <p className="text-[10.5px] text-[#6E637C]">No pending articles in the verification queue.</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {pendingArticles.map((art) => (
                                <div
                                    key={art.id}
                                    className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-2.5"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-bold text-[#7C3AED] bg-purple-100/80 px-2.5 py-0.5 rounded-full">
                                            {art.category?.name || 'General'}
                                        </span>
                                        <span className="text-[10px] text-[#6E637C] capitalize">
                                            {art.format?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xs text-[#2D2638]">{art.title}</h4>
                                        <p className="text-[11px] text-[#6E637C] mt-0.5 line-clamp-2">{art.summary}</p>
                                        {art.author?.name && (
                                            <p className="text-[10px] text-[#7C3AED] font-semibold mt-1">
                                                By {art.author.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={!canApprove}
                                            onClick={() => handleApprove(art.id)}
                                            className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-full text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs active:scale-98"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span>Approve &amp; Publish</span>
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!canApprove}
                                            onClick={() => handleRejectResource(art.id)}
                                            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 rounded-full text-xs font-bold transition active:scale-98"
                                        >
                                            Return Draft
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3.5 EDUCATOR APPLICATIONS QUEUE */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h3 className="font-bold text-xs text-[#2D2638]">Educator Applications</h3>
                            <p className="text-[10.5px] text-[#6E637C]">
                                Approve applicants to unlock content creation
                            </p>
                        </div>
                        <span className="px-2.5 py-0.5 bg-purple-100 text-[#7C3AED] rounded-full text-[10px] font-bold">
                            {educatorApplications.filter((e) => e.educator_status === 'pending').length} Pending
                        </span>
                    </div>

                    {educatorApplications.length === 0 ? (
                        <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-4 border border-white/90 text-center">
                            <p className="text-xs text-[#6E637C]">No educator applications yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {educatorApplications.map((app) => (
                                <div
                                    key={app.id}
                                    className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-2"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-xs text-[#2D2638] truncate">{app.name}</h4>
                                            <p className="text-[10px] text-[#6E637C] truncate">{app.email}</p>
                                        </div>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase shrink-0 ${
                                                app.educator_status === 'approved'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}
                                        >
                                            {app.educator_status}
                                        </span>
                                    </div>
                                    {app.educator_bio && (
                                        <p className="text-[11px] text-[#5E546B] bg-white/70 border border-white rounded-2xl p-2.5">
                                            {app.educator_bio}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2">
                                        {app.educator_status !== 'approved' && (
                                            <button
                                                type="button"
                                                disabled={!canApprove}
                                                onClick={() => handleEducatorReview(app.id, 'approved')}
                                                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-full text-[11px] font-bold transition"
                                            >
                                                Approve Educator
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            disabled={!canApprove}
                                            onClick={() => handleEducatorReview(app.id, 'rejected')}
                                            className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 rounded-full text-[11px] font-bold transition"
                                        >
                                            {app.educator_status === 'approved' ? 'Revoke Access' : 'Decline'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. PUBLISHED LESSONS & ATTACHMENTS CATALOG */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-bold text-xs text-[#2D2638]">
                            Published Lessons &amp; Materials
                        </h3>
                        <span className="text-[10px] font-bold text-[#6E637C]">
                            {approvedArticles.length} total
                        </span>
                    </div>

                    <div className="space-y-2.5">
                        {approvedArticles.map((art) => (
                            <div
                                key={art.id}
                                className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-2xs border border-white/95 space-y-2.5"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                            <span className="text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100/80 text-[#7C3AED]">
                                                {art.category?.name || 'Guide'}
                                            </span>
                                            {art.video_url && (
                                                <span className="text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 inline-flex items-center space-x-1">
                                                    <Video className="w-2.5 h-2.5" />
                                                    <span>Video</span>
                                                </span>
                                            )}
                                            {Array.isArray(art.quiz_questions) && art.quiz_questions.length > 0 && (
                                                <span className="text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                                    {art.quiz_questions.length} Quiz Qs
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-xs text-[#2D2638] mt-1">{art.title}</h4>
                                        <p className="text-[10.5px] text-[#6E637C]">
                                            {art.read_time_minutes} min • Verified
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteResource(art.id)}
                                        className="p-1.5 rounded-full text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                                        title="Delete lesson"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Attached Document Materials */}
                                {art.attachments && art.attachments.length > 0 && (
                                    <div className="space-y-1.5 pt-1">
                                        {art.attachments.map((att) => (
                                            <div
                                                key={att.id}
                                                className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/80 border border-white"
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
                                                        className="p-1.5 rounded-full text-[#7C3AED] hover:bg-purple-50"
                                                        title="Download"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteAttachment(att.id)}
                                                        className="p-1.5 rounded-full text-rose-400 hover:text-rose-600"
                                                        title="Remove attachment"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Quick Attach File Input */}
                                <label className="flex items-center justify-center space-x-1.5 w-full py-2 px-3 rounded-full bg-white/85 hover:bg-white border border-white text-[11px] font-bold text-[#7C3AED] cursor-pointer transition">
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span>
                                        {uploadingForId === art.id
                                            ? 'Uploading...'
                                            : 'Attach Material (PDF, DOC, PPTX, XLSX)'}
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.odt,.ods,.odp"
                                        disabled={uploadingForId === art.id}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleAttachFile(art.id, file);
                                            e.target.value = '';
                                        }}
                                    />
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MobileAppLayout>
    );
}
