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
    HeartPulse
} from 'lucide-react';

export default function CycleIndex({ 
    profile, 
    logs = [], 
    prediction, 
    availableSymptoms = [], 
    availableMoods = [] 
}) {
    // Current viewed month state
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

    // Selected day for logging
    const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
    const [showLoggerModal, setShowLoggerModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // Find existing log for selected date
    const selectedLog = logs.find(l => l.logged_date === selectedDate);

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
        setSelectedDate(dateString);
        const logForDay = logs.find(l => l.logged_date === dateString);
        setData({
            logged_date: dateString,
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
        <MobileAppLayout title="Cycle Tracker" subtitle="Encrypted • Private • Predictable">
            <Head title="Cycle Tracker & Calendar - Mwezi" />

            <div className="space-y-4">
                
                {/* 1. CYCLE SUMMARY HEADER CARD */}
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-mwezi-primary/40 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Average Cycle</span>
                        <div className="flex items-baseline space-x-1.5 mt-0.5">
                            <span className="font-heading font-extrabold text-2xl text-mwezi-tertiary">
                                {profile.average_cycle_length || 28}
                            </span>
                            <span className="text-xs font-semibold text-gray-600">days</span>
                        </div>
                    </div>

                    <div className="border-l border-gray-100 pl-4">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Period Duration</span>
                        <div className="flex items-baseline space-x-1.5 mt-0.5">
                            <span className="font-heading font-extrabold text-2xl text-mwezi-accent">
                                {profile.average_period_length || 5}
                            </span>
                            <span className="text-xs font-semibold text-gray-600">days</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="p-2 rounded-xl bg-mwezi-primary/30 text-mwezi-tertiary hover:bg-mwezi-primary/50 transition"
                            title="Export Healthcare Summary"
                        >
                            <FileText className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* 2. INTERACTIVE CALENDAR CONTAINER */}
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
                    {/* Month Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading font-bold text-base text-mwezi-tertiary">
                            {monthNames[currentMonth]} {currentYear}
                        </h2>
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={prevMonth}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((w, idx) => (
                            <span key={idx} className="text-[10px] font-bold text-gray-400 uppercase">
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

                            let bgClass = "bg-gray-50 text-gray-700 hover:bg-gray-100";
                            let ringClass = "";

                            if (item.isLoggedPeriod) {
                                bgClass = "bg-mwezi-accent text-white font-bold shadow-sm"; // Peach Pink
                            } else if (item.isPredictedPeriod) {
                                bgClass = "bg-mwezi-primary text-mwezi-tertiary font-bold"; // Powder Blue
                            } else if (item.isOvulation) {
                                bgClass = "bg-mwezi-secondary text-mwezi-tertiary font-semibold"; // Light Lilac
                            }

                            if (item.isToday) {
                                ringClass = "ring-2 ring-mwezi-tertiary";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => openLoggerForDate(item.dateString)}
                                    className={`h-11 rounded-[12px] flex flex-col items-center justify-center text-xs relative transition active:scale-95 ${bgClass} ${ringClass}`}
                                >
                                    <span>{item.dayNum}</span>
                                    {item.log?.symptoms?.length > 0 && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-mwezi-tertiary absolute bottom-1" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-around text-[10px] font-semibold text-gray-600">
                        <div className="flex items-center space-x-1">
                            <span className="w-3 h-3 rounded-full bg-mwezi-accent inline-block" />
                            <span>Logged Flow</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className="w-3 h-3 rounded-full bg-mwezi-primary inline-block" />
                            <span>Predicted</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <span className="w-3 h-3 rounded-full bg-mwezi-secondary inline-block" />
                            <span>Ovulation</span>
                        </div>
                    </div>
                </div>

                {/* 3. LOG FOR SELECTED DAY BUTTON */}
                <button
                    onClick={() => openLoggerForDate(selectedDate)}
                    className="w-full py-3.5 bg-mwezi-accent hover:bg-mwezi-accent/95 active:scale-[0.99] text-white font-bold rounded-[20px] text-xs shadow-md transition flex items-center justify-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Log Symptoms & Flow for {selectedDate}</span>
                </button>

                {/* 4. RECENT 5 LOGS HISTORY LIST */}
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100">
                    <h3 className="font-heading font-bold text-xs text-mwezi-tertiary uppercase tracking-wider mb-3">
                        Recent Logged Days
                    </h3>

                    <div className="space-y-2.5">
                        {logs.slice(0, 5).map((log) => (
                            <div 
                                key={log.id} 
                                onClick={() => openLoggerForDate(log.logged_date)}
                                className="p-2.5 rounded-xl bg-gray-50 hover:bg-mwezi-primary/20 transition cursor-pointer flex items-center justify-between border border-gray-100"
                            >
                                <div className="flex items-center space-x-2.5">
                                    <div className="w-8 h-8 rounded-full bg-mwezi-accent/20 flex items-center justify-center text-mwezi-tertiary">
                                        <Droplet className="w-4 h-4 text-mwezi-accent" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">{log.logged_date}</p>
                                        <p className="text-[10px] text-gray-500 capitalize">
                                            Flow: {log.flow_intensity} • {log.pad_changes_count} pads changed
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-[10px] font-semibold text-mwezi-tertiary">
                                        {log.symptoms?.length || 0} symptoms
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* DAILY LOGGER MODAL */}
            {showLoggerModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-white w-full max-w-[440px] rounded-t-[28px] sm:rounded-[24px] max-h-[90vh] overflow-y-auto p-5 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                            <div>
                                <h3 className="font-heading font-bold text-base text-mwezi-tertiary">Daily Cycle Logger</h3>
                                <p className="text-xs text-gray-500">{data.logged_date}</p>
                            </div>
                            <button onClick={() => setShowLoggerModal(false)} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveLog} className="space-y-4">
                            {/* Flow Intensity Selection */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Flow Intensity</label>
                                <div className="grid grid-cols-5 gap-1 text-center">
                                    {['none', 'spotting', 'light', 'medium', 'heavy'].map((flow) => (
                                        <button
                                            key={flow}
                                            type="button"
                                            onClick={() => setData('flow_intensity', flow)}
                                            className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase transition ${
                                                data.flow_intensity === flow
                                                    ? 'bg-mwezi-accent text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {flow}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pad Changes Count */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Pads Changed Today</label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setData('pad_changes_count', Math.max(0, data.pad_changes_count - 1))}
                                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-sm"
                                    >
                                        -
                                    </button>
                                    <span className="font-bold text-sm text-gray-800">{data.pad_changes_count}</span>
                                    <button
                                        type="button"
                                        onClick={() => setData('pad_changes_count', data.pad_changes_count + 1)}
                                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-sm"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Symptoms Chips */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Symptoms</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableSymptoms.map((sym) => {
                                        const selected = data.symptoms.includes(sym);
                                        return (
                                            <button
                                                key={sym}
                                                type="button"
                                                onClick={() => toggleSymptom(sym)}
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                                                    selected
                                                        ? 'bg-mwezi-secondary text-mwezi-tertiary border border-mwezi-accent font-bold'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Moods</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableMoods.map((mood) => {
                                        const selected = data.moods.includes(mood);
                                        return (
                                            <button
                                                key={mood}
                                                type="button"
                                                onClick={() => toggleMood(mood)}
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                                                    selected
                                                        ? 'bg-mwezi-primary text-mwezi-tertiary border border-mwezi-primary font-bold'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {mood}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Encrypted Private Notes */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                                    <span>Private Journal Notes</span>
                                    <span className="text-[10px] text-emerald-700 font-medium flex items-center space-x-0.5">
                                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                        <span>Encrypted</span>
                                    </span>
                                </label>
                                <textarea
                                    value={data.private_notes}
                                    onChange={(e) => setData('private_notes', e.target.value)}
                                    rows="2"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-[14px] text-xs focus:ring-2 focus:ring-mwezi-accent"
                                    placeholder="Add any personal health or medication notes..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 bg-mwezi-accent hover:bg-mwezi-accent/95 active:scale-[0.99] text-white font-bold rounded-[20px] text-xs shadow-md transition disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Encrypted Record'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* EXPORT HEALTHCARE SUMMARY DIALOG */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <h3 className="font-heading font-bold text-base text-mwezi-tertiary flex items-center space-x-2">
                                <HeartPulse className="w-5 h-5 text-mwezi-tertiary" />
                                <span>Healthcare Visit Summary</span>
                            </h3>
                            <button onClick={() => setShowExportModal(false)} className="text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-600">
                            Present this anonymized medical summary to your clinic or school nurse:
                        </p>
                        <div className="p-3 bg-mwezi-light border rounded-xl text-xs space-y-1.5 text-gray-800">
                            <p><strong>Cycle Rhythm:</strong> Regular {profile.average_cycle_length || 28}-day cycle</p>
                            <p><strong>Period Duration:</strong> ~{profile.average_period_length || 5} days</p>
                            <p><strong>Last Recorded Start:</strong> {profile.last_period_start || 'Recent'}</p>
                            <p><strong>Recent Flow Intensity:</strong> Moderate with standard pad change frequency</p>
                            <p><strong>Primary Symptoms Logged:</strong> Mild cramps, backache</p>
                        </div>
                        <button
                            onClick={() => { window.print(); setShowExportModal(false); }}
                            className="w-full py-2.5 bg-mwezi-accent text-white rounded-[20px] text-xs font-bold shadow-sm"
                        >
                            Print / Save PDF
                        </button>
                    </div>
                </div>
            )}
        </MobileAppLayout>
    );
}

