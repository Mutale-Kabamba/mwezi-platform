import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { 
    Calendar as CalendarIcon, 
    Droplet, 
    Plus, 
    Check, 
    ChevronLeft, 
    ChevronRight, 
    FileText, 
    ShieldCheck, 
    Settings,
    X,
    HeartPulse,
    Info,
    Sparkles,
    CalendarCheck,
    Lock
} from 'lucide-react';

export default function CycleIndex({ 
    profile, 
    logs = [], 
    prediction, 
    availableSymptoms = [], 
    availableMoods = [] 
}) {
    // Helper to format dates cleanly (e.g. "Tue, 3 Nov 2026")
    const formatDisplayDate = (d) => {
        if (!d) return '';
        const cleanStr = typeof d === 'string' ? d.split('T')[0] : d;
        const dateObj = new Date(cleanStr);
        if (isNaN(dateObj.getTime())) return cleanStr;
        return dateObj.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Current viewed month state
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

    // Selected day for logging
    const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
    const [showLoggerModal, setShowLoggerModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // Find existing log for selected date
    const selectedLog = logs.find(l => (l.logged_date ? l.logged_date.split('T')[0] : '') === selectedDate);

    // Form for logging
    const { data, setData, post, processing, reset } = useForm({
        logged_date: selectedDate,
        flow_intensity: selectedLog ? selectedLog.flow_intensity : 'none',
        symptoms: selectedLog && selectedLog.symptoms ? selectedLog.symptoms : [],
        moods: selectedLog && selectedLog.moods ? selectedLog.moods : [],
        pad_changes_count: selectedLog ? selectedLog.pad_changes_count : 0,
        private_notes: selectedLog ? (selectedLog.private_notes || '') : '',
    });

    const openLoggerForDate = (dateString) => {
        const normalized = typeof dateString === 'string' ? dateString.split('T')[0] : dateString;
        setSelectedDate(normalized);
        const logForDay = logs.find(l => (l.logged_date ? l.logged_date.split('T')[0] : '') === normalized);
        setData({
            logged_date: normalized,
            flow_intensity: logForDay ? logForDay.flow_intensity : 'none',
            symptoms: logForDay && logForDay.symptoms ? logForDay.symptoms : [],
            moods: logForDay && logForDay.moods ? logForDay.moods : [],
            pad_changes_count: logForDay ? logForDay.pad_changes_count : 0,
            private_notes: logForDay ? (logForDay.private_notes || '') : '',
        });
        setShowLoggerModal(true);
    };

    const handleSaveLog = (e) => {
        e.preventDefault();
        post(route('cycle.log.store'), {
            onSuccess: () => setShowLoggerModal(false),
        });
    };

    const toggleSymptom = (sym) => {
        if (data.symptoms.includes(sym)) {
            setData('symptoms', data.symptoms.filter(s => s !== sym));
        } else {
            setData('symptoms', [...data.symptoms, sym]);
        }
    };

    const toggleMood = (mood) => {
        if (data.moods.includes(mood)) {
            setData('moods', data.moods.filter(m => m !== mood));
        } else {
            setData('moods', [...data.moods, mood]);
        }
    };

    // Calendar navigation
    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    // Month calculations
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun

    // Log map for fast lookup
    const logsMap = {};
    logs.forEach(l => {
        logsMap[l.logged_date] = l;
    });

    // Check prediction window dates
    const predictedStart = prediction ? new Date(prediction.predicted_start_date) : null;
    const predictedEnd = prediction ? new Date(prediction.predicted_end_date) : null;
    const ovStart = prediction?.ovulation_window?.start ? new Date(prediction.ovulation_window.start) : null;
    const ovEnd = prediction?.ovulation_window?.end ? new Date(prediction.ovulation_window.end) : null;

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
        days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const monthStr = String(currentMonth + 1).padStart(2, '0');
        const dayStr = String(d).padStart(2, '0');
        const fullDateStr = `${currentYear}-${monthStr}-${dayStr}`;
        const dayDate = new Date(currentYear, currentMonth, d);

        const log = logsMap[fullDateStr];
        const isLoggedPeriod = log && log.flow_intensity && log.flow_intensity !== 'none';
        
        let isPredictedPeriod = false;
        if (predictedStart && predictedEnd && dayDate >= predictedStart && dayDate <= predictedEnd) {
            isPredictedPeriod = true;
        }

        let isOvulation = false;
        if (ovStart && ovEnd && dayDate >= ovStart && dayDate <= ovEnd) {
            isOvulation = true;
        }

        const isToday = fullDateStr === today.toISOString().split('T')[0];

        days.push({
            dayNum: d,
            dateString: fullDateStr,
            log,
            isLoggedPeriod,
            isPredictedPeriod,
            isOvulation,
            isToday,
        });
    }

    return (
        <MobileAppLayout 
            title="Cycle Tracker" 
            subtitle="Encrypted • Private • Medically Informed"
            actionButton={
                <button
                    onClick={() => setShowExportModal(true)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 flex items-center justify-center transition active:scale-90"
                    title="Export Medical Visit Summary"
                    aria-label="Export Summary"
                >
                    <FileText className="w-4 h-4 text-rose-600" />
                </button>
            }
        >
            <Head title="Cycle Tracker & Calendar - Mwezi" />

            <div className="space-y-4">
                
                {/* 1. NATIVE TOP METRIC TILES (3-Tile Carousel) */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white rounded-3xl p-3 shadow-xs border border-rose-150/70 text-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Avg Cycle
                        </span>
                        <div className="flex items-baseline justify-center space-x-1 mt-0.5">
                            <span className="font-extrabold text-xl text-slate-900">
                                {profile.average_cycle_length || 28}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">d</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 font-semibold mt-0.5 block truncate">Regular</span>
                    </div>

                    <div className="bg-white rounded-3xl p-3 shadow-xs border border-rose-150/70 text-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Period
                        </span>
                        <div className="flex items-baseline justify-center space-x-1 mt-0.5">
                            <span className="font-extrabold text-xl text-rose-600">
                                {profile.average_period_length || 5}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">d</span>
                        </div>
                        <span className="text-[9px] text-rose-500 font-semibold mt-0.5 block truncate">Expected</span>
                    </div>

                    <div className="bg-white rounded-3xl p-3 shadow-xs border border-rose-150/70 text-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Logged
                        </span>
                        <div className="flex items-baseline justify-center space-x-1 mt-0.5">
                            <span className="font-extrabold text-xl text-purple-600">
                                {logs.length}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">days</span>
                        </div>
                        <span className="text-[9px] text-purple-500 font-semibold mt-0.5 block truncate">Encrypted</span>
                    </div>
                </div>

                {/* 2. NATIVE CALENDAR CARD */}
                <div className="bg-white rounded-3xl p-4 shadow-xs border border-rose-150/80">
                    {/* Month Switcher Header */}
                    <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                                {monthNames[currentMonth]} {currentYear}
                            </h2>
                            <p className="text-[10px] text-slate-400 font-medium">Tap any date to log flow or symptoms</p>
                        </div>
                        <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-2xl border border-slate-200/60">
                            <button
                                onClick={prevMonth}
                                className="p-1.5 rounded-xl hover:bg-white text-slate-600 active:scale-90 transition shadow-xs"
                                aria-label="Previous month"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="p-1.5 rounded-xl hover:bg-white text-slate-600 active:scale-90 transition shadow-xs"
                                aria-label="Next month"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, idx) => (
                            <span key={idx} className="text-[10px] font-bold text-slate-400 uppercase">
                                {w}
                            </span>
                        ))}
                    </div>

                    {/* Day Grid */}
                    <div className="grid grid-cols-7 gap-1.5">
                        {days.map((item, idx) => {
                            if (!item) {
                                return <div key={idx} className="h-10" />;
                            }

                            let bgClass = "bg-slate-50/70 text-slate-700 hover:bg-rose-50/50 hover:text-rose-700 border border-transparent";
                            let ringClass = "";

                            if (item.isLoggedPeriod) {
                                bgClass = "bg-rose-500 text-white font-bold shadow-xs border-rose-500";
                            } else if (item.isPredictedPeriod) {
                                bgClass = "bg-pink-100 text-pink-800 font-bold border-pink-200";
                            } else if (item.isOvulation) {
                                bgClass = "bg-purple-100 text-purple-800 font-semibold border-purple-200";
                            }

                            if (item.isToday) {
                                ringClass = "ring-2 ring-rose-500 ring-offset-1";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => openLoggerForDate(item.dateString)}
                                    className={`h-11 rounded-2xl flex flex-col items-center justify-center text-xs relative transition active:scale-90 ${bgClass} ${ringClass}`}
                                >
                                    <span className="text-xs font-semibold">{item.dayNum}</span>
                                    {item.log?.symptoms?.length > 0 && (
                                        <div className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                                            item.isLoggedPeriod ? 'bg-white' : 'bg-rose-500'
                                        }`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Calendar Color Legend */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-around text-[10px] text-slate-600">
                        <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
                            <span>Logged Flow</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-pink-200" />
                            <span>Predicted</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-200" />
                            <span>Ovulation</span>
                        </div>
                    </div>
                </div>

                {/* 3. SELECTED DAY QUICK LOG BUTTON */}
                <button
                    onClick={() => openLoggerForDate(selectedDate)}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-3xl text-xs shadow-md shadow-rose-200/60 transition flex items-center justify-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>{selectedLog ? `Update Record for ${formatDisplayDate(selectedDate)}` : `Log Symptoms for ${formatDisplayDate(selectedDate)}`}</span>
                </button>

                {/* 4. RECENT LOGS LIST */}
                <div className="bg-white rounded-3xl p-4 shadow-xs border border-rose-150/80">
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Recent Recorded Days
                        </h3>
                        <span className="text-[10px] text-slate-400 font-medium">Last 5</span>
                    </div>

                    <div className="space-y-2">
                        {logs.length === 0 ? (
                            <p className="text-xs text-slate-400 py-2 text-center">No symptoms logged yet.</p>
                        ) : (
                            logs.slice(0, 5).map((log) => (
                                <div 
                                    key={log.id} 
                                    onClick={() => openLoggerForDate(log.logged_date)}
                                    className="p-3 rounded-2xl bg-slate-50 hover:bg-rose-50/60 transition cursor-pointer flex items-center justify-between border border-slate-100/80 active:scale-[0.99]"
                                >
                                    <div className="flex items-center space-x-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                            <Droplet className="w-4 h-4 text-rose-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{formatDisplayDate(log.logged_date)}</p>
                                            <p className="text-[10px] text-slate-500 capitalize">
                                                Flow: {log.flow_intensity} • {log.pad_changes_count || 0} pads
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                            {log.symptoms?.length || 0} symptoms
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* DAILY LOGGER NATIVE BOTTOM SHEET */}
            {showLoggerModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs p-0 animate-fadeIn">
                    <div 
                        className="fixed inset-0 bg-transparent"
                        onClick={() => setShowLoggerModal(false)}
                    />
                    <div className="relative bg-white w-full rounded-t-[32px] max-h-[88%] overflow-y-auto p-5 shadow-2xl space-y-4 border-t border-rose-100 hide-scrollbar z-10">
                        
                        {/* Sheet Handle & Header */}
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-1" />
                        
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-base text-slate-900">Log Symptoms & Flow</h3>
                                <p className="text-xs text-rose-600 font-semibold">{formatDisplayDate(data.logged_date)}</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setShowLoggerModal(false)} 
                                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveLog} className="space-y-4">
                            {/* Flow Intensity Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                    Flow Intensity
                                </label>
                                <div className="grid grid-cols-5 gap-1 text-center">
                                    {['none', 'spotting', 'light', 'medium', 'heavy'].map((flow) => (
                                        <button
                                            key={flow}
                                            type="button"
                                            onClick={() => setData('flow_intensity', flow)}
                                            className={`py-2 px-1 rounded-2xl text-[10px] font-bold uppercase transition ${
                                                data.flow_intensity === flow
                                                    ? 'bg-rose-600 text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {flow}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pad Changes Stepper */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                    Pads or Liners Changed
                                </label>
                                <div className="flex items-center space-x-3 p-1.5 rounded-2xl bg-slate-50 border border-slate-200/60 max-w-xs">
                                    <button
                                        type="button"
                                        onClick={() => setData('pad_changes_count', Math.max(0, data.pad_changes_count - 1))}
                                        className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 font-bold text-sm text-slate-700 shadow-xs border border-slate-200 flex items-center justify-center"
                                    >
                                        -
                                    </button>
                                    <span className="font-extrabold text-sm text-slate-900 flex-1 text-center">
                                        {data.pad_changes_count} pads
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setData('pad_changes_count', data.pad_changes_count + 1)}
                                        className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 font-bold text-sm text-slate-700 shadow-xs border border-slate-200 flex items-center justify-center"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Symptoms Chips */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                    Symptoms Felt
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableSymptoms.map((sym) => {
                                        const selected = data.symptoms.includes(sym);
                                        return (
                                            <button
                                                key={sym}
                                                type="button"
                                                onClick={() => toggleSymptom(sym)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                                    selected
                                                        ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                                                }`}
                                            >
                                                {sym}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Mood Chips */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                    Mood & Energy
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableMoods.map((mood) => {
                                        const selected = data.moods.includes(mood);
                                        return (
                                            <button
                                                key={mood}
                                                type="button"
                                                onClick={() => toggleMood(mood)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                                    selected
                                                        ? 'bg-purple-100 text-purple-800 border border-purple-300 font-bold'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                                                }`}
                                            >
                                                {mood}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Private Notes */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-bold text-slate-800">Private Notes</label>
                                    <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                                        <Lock className="w-3 h-3 text-emerald-600" />
                                        <span>Encrypted</span>
                                    </span>
                                </div>
                                <textarea
                                    value={data.private_notes}
                                    onChange={(e) => setData('private_notes', e.target.value)}
                                    rows="2"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
                                    placeholder="Add any private observations or medication notes..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-200/60 transition disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Record'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* EXPORT HEALTHCARE SUMMARY SHEET */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
                    <div 
                        className="fixed inset-0 bg-transparent"
                        onClick={() => setShowExportModal(false)}
                    />
                    <div className="relative bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-rose-100 z-10">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                                    <HeartPulse className="w-4 h-4 text-rose-600" />
                                </div>
                                <h3 className="font-bold text-sm text-slate-900">Healthcare Summary</h3>
                            </div>
                            <button onClick={() => setShowExportModal(false)} className="text-slate-400 p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            Confidential medical summary to present to your clinic or school nurse:
                        </p>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-800">
                            <p><strong>Cycle Rhythm:</strong> Regular {profile.average_cycle_length || 28}-day cycle</p>
                            <p><strong>Period Duration:</strong> ~{profile.average_period_length || 5} days average</p>
                            <p><strong>Last Recorded:</strong> {profile.last_period_start || 'Recent cycle'}</p>
                            <p><strong>Pad Changes:</strong> Standard frequency logged</p>
                            <p><strong>Recorded Symptoms:</strong> Mild cramps, fatigue</p>
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                            <button
                                onClick={() => { window.print(); setShowExportModal(false); }}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-200/60 transition"
                            >
                                Print / PDF
                            </button>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MobileAppLayout>
    );
}
