import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { useTranslation } from '@/i18n/LanguageContext';
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
    Lock,
    CircleDot,
    Moon,
    Flame,
    Heart,
    Smile,
    Activity,
    RotateCcw
} from 'lucide-react';

export default function CycleIndex({
    profile,
    logs = [],
    prediction,
    availableSymptoms = [],
    availableMoods = []
}) {
    const { t } = useTranslation();

    // View Mode State: 'doughnut' (Cycle Wheel) vs 'calendar' (Full Calendar Grid)
    const [viewMode, setViewMode] = useState('doughnut');

    // Helper to safely extract YYYY-MM-DD from any date representation
    const extractYmd = (d) => {
        if (!d) return '';
        const str = String(d).trim();
        return str.split('T')[0].split(' ')[0];
    };

    // Helper to format dates cleanly (e.g. "Wed, 4 Nov 2026")
    const formatDisplayDate = (d) => {
        if (!d) return '';
        const cleanStr = extractYmd(d);
        if (cleanStr.includes('-')) {
            const parts = cleanStr.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                const dateObj = new Date(year, month, day);
                if (!isNaN(dateObj.getTime())) {
                    return dateObj.toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    });
                }
            }
        }
        const dateObj = new Date(cleanStr);
        if (isNaN(dateObj.getTime())) return cleanStr;
        return dateObj.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const today = new Date();
    const todayYmd = extractYmd(today.toISOString());

    // Current viewed month state for calendar view
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

    // Selected day for logging
    const [selectedDate, setSelectedDate] = useState(todayYmd);
    const [showLoggerModal, setShowLoggerModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedPhaseTab, setSelectedPhaseTab] = useState(null);

    // Dynamic Cycle Calculations
    const cycleLength = profile?.average_cycle_length || 28;
    const periodLength = profile?.average_period_length || 5;

    // Calculate current cycle day from last_period_start
    const { currentCycleDay, daysUntilNextPeriod } = useMemo(() => {
        if (!profile?.last_period_start) {
            return { currentCycleDay: 14, daysUntilNextPeriod: 14 };
        }
        const lastStart = new Date(profile.last_period_start);
        const diffMs = today.getTime() - lastStart.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays >= 0) {
            const day = (diffDays % cycleLength) + 1;
            const remaining = Math.max(0, cycleLength - day);
            return { currentCycleDay: day, daysUntilNextPeriod: remaining };
        }
        return { currentCycleDay: 1, daysUntilNextPeriod: cycleLength - 1 };
    }, [profile?.last_period_start, cycleLength]);

    // Biological Phase Ranges based on WHO & ACOG standards
    const ovPeakDay = Math.max(periodLength + 2, cycleLength - 14);
    const ovStartDay = Math.max(periodLength + 1, ovPeakDay - 2);
    const ovEndDay = Math.min(cycleLength - 2, ovPeakDay + 2);

    const phases = useMemo(() => [
        {
            id: 'menstrual',
            name: 'Period / Menstruation',
            shortName: 'Period',
            range: `Days 1–${periodLength}`,
            startDay: 1,
            endDay: periodLength,
            color: '#BE123C', // Rose 700
            bgColor: 'bg-rose-50',
            borderColor: 'border-rose-200',
            textColor: 'text-rose-700',
            badgeBg: 'bg-rose-100 text-rose-800',
            conceptionRisk: 'Low pregnancy chance',
            icon: Droplet,
            hormones: 'Estrogen & progesterone at lowest baseline.',
            energy: 'Rest & inward reflection',
            wellnessTip: 'Stay hydrated, enjoy warm ginger or rooibos tea, and use warm compresses for cramp relief.',
        },
        {
            id: 'follicular',
            name: 'Follicular Phase',
            shortName: 'Follicular',
            range: `Days ${periodLength + 1}–${ovStartDay - 1}`,
            startDay: periodLength + 1,
            endDay: ovStartDay - 1,
            color: '#FB7185', // Coral / Rose 400
            bgColor: 'bg-pink-50',
            borderColor: 'border-pink-200',
            textColor: 'text-pink-700',
            badgeBg: 'bg-pink-100 text-pink-800',
            conceptionRisk: 'Moderate pregnancy chance',
            icon: Sparkles,
            hormones: 'FSH stimulating follicles, estrogen steadily rising.',
            energy: 'Surging energy, elevated mood & focus',
            wellnessTip: 'Great time for challenging work, dynamic workouts, and nutrient-dense fresh greens.',
        },
        {
            id: 'ovulation',
            name: 'Fertile Window & Ovulation',
            shortName: 'Ovulation',
            range: `Days ${ovStartDay}–${ovEndDay} (Peak Day ${ovPeakDay})`,
            startDay: ovStartDay,
            endDay: ovEndDay,
            color: '#9333EA', // Royal Purple
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-700',
            badgeBg: 'bg-purple-100 text-purple-800',
            conceptionRisk: 'Peak pregnancy chance',
            icon: HeartPulse,
            hormones: 'Luteinizing hormone (LH) surge releases mature egg.',
            energy: 'Peak confidence, stamina & social drive',
            wellnessTip: 'Stay fueled with healthy fats (avocado, nuts) and track any mild lower abdominal twinges.',
        },
        {
            id: 'luteal',
            name: 'Luteal Phase',
            shortName: 'Luteal',
            range: `Days ${ovEndDay + 1}–${cycleLength}`,
            startDay: ovEndDay + 1,
            endDay: cycleLength,
            color: '#A855F7', // Soft Lavender
            bgColor: 'bg-violet-50',
            borderColor: 'border-violet-200',
            textColor: 'text-violet-700',
            badgeBg: 'bg-violet-100 text-violet-800',
            conceptionRisk: 'Low pregnancy chance',
            icon: Moon,
            hormones: 'Progesterone peaks to nurture uterine lining.',
            energy: 'Calm & grounding; mild pre-menstrual sensitivity',
            wellnessTip: 'Prioritize magnesium-rich snacks (dark chocolate, pumpkin seeds) and 8 hours of restorative sleep.',
        }
    ], [periodLength, ovStartDay, ovPeakDay, ovEndDay, cycleLength]);

    // Active phase today
    const currentPhase = useMemo(() => {
        return phases.find(p => currentCycleDay >= p.startDay && currentCycleDay <= p.endDay) || phases[0];
    }, [phases, currentCycleDay]);

    // Polar to Cartesian coordinate converter for SVG circle
    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
            x: Number((centerX + radius * Math.cos(angleInRadians)).toFixed(2)),
            y: Number((centerY + radius * Math.sin(angleInRadians)).toFixed(2)),
        };
    };

    // Generates smooth SVG arc paths with exact angles
    const describeArc = (x, y, radius, startAngle, endAngle) => {
        let diff = endAngle - startAngle;
        if (diff < 0) diff += 360;
        if (diff >= 360) diff = 359.99;
        const start = polarToCartesian(x, y, radius, startAngle);
        const end = polarToCartesian(x, y, radius, startAngle + diff);
        const largeArcFlag = diff > 180 ? 1 : 0;
        const sweepFlag = 1; // Clockwise
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
    };

    // Calculate arc segments for the doughnut wheel
    const doughnutSegments = useMemo(() => {
        const cx = 130;
        const cy = 130;
        const radius = 94;
        const strokeWidth = 16;
        const gapDegrees = 3.5; // Gap between phase arcs

        return phases.map((phase) => {
            const startFraction = (phase.startDay - 1) / cycleLength;
            const endFraction = phase.endDay / cycleLength;

            const rawStartAngle = startFraction * 360;
            const rawEndAngle = endFraction * 360;

            const startAngle = rawStartAngle + gapDegrees / 2;
            const endAngle = rawEndAngle - gapDegrees / 2;

            const path = describeArc(cx, cy, radius, startAngle, endAngle);
            const isCurrent = currentPhase.id === phase.id;

            return {
                ...phase,
                path,
                startAngle,
                endAngle,
                isCurrent,
                strokeWidth,
            };
        });
    }, [phases, cycleLength, currentPhase]);

    // Position of today's pin on the ring
    const todayPointer = useMemo(() => {
        const cx = 130;
        const cy = 130;
        const radius = 94;
        const fraction = (currentCycleDay - 0.5) / cycleLength;
        const angle = fraction * 360;
        return polarToCartesian(cx, cy, radius, angle);
    }, [currentCycleDay, cycleLength]);

    // Position of ovulation peak sparkle on the ring
    const peakPointer = useMemo(() => {
        const cx = 130;
        const cy = 130;
        const radius = 94;
        const fraction = (ovPeakDay - 0.5) / cycleLength;
        const angle = fraction * 360;
        return polarToCartesian(cx, cy, radius, angle);
    }, [ovPeakDay, cycleLength]);

    // Find existing log for selected date
    const selectedLog = logs.find(l => extractYmd(l.logged_date) === selectedDate);

    // Form for logging
    const { data, setData, post, processing } = useForm({
        logged_date: selectedDate,
        flow_intensity: selectedLog ? selectedLog.flow_intensity : 'none',
        symptoms: selectedLog && selectedLog.symptoms ? selectedLog.symptoms : [],
        moods: selectedLog && selectedLog.moods ? selectedLog.moods : [],
        pad_changes_count: selectedLog ? selectedLog.pad_changes_count : 0,
        private_notes: selectedLog ? (selectedLog.private_notes || '') : '',
    });

    const openLoggerForDate = (dateString) => {
        const normalized = extractYmd(dateString);
        setSelectedDate(normalized);
        const logForDay = logs.find(l => extractYmd(l.logged_date) === normalized);
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

    const jumpToToday = () => {
        setCurrentYear(today.getFullYear());
        setCurrentMonth(today.getMonth());
        setSelectedDate(todayYmd);
    };

    // Month calculations
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun

    // Log map for fast lookup
    const logsMap = useMemo(() => {
        const map = {};
        logs.forEach(l => {
            const ymd = extractYmd(l.logged_date);
            if (ymd) map[ymd] = l;
        });
        return map;
    }, [logs]);

    // Prediction window dates
    const predictedStart = prediction ? new Date(prediction.predicted_start_date) : null;
    const predictedEnd = prediction ? new Date(prediction.predicted_end_date) : null;
    const ovStart = prediction?.ovulation_window?.start ? new Date(prediction.ovulation_window.start) : null;
    const ovEnd = prediction?.ovulation_window?.end ? new Date(prediction.ovulation_window.end) : null;

    const calendarDays = useMemo(() => {
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

            const isToday = fullDateStr === todayYmd;
            const isSelected = fullDateStr === selectedDate;

            days.push({
                dayNum: d,
                dateString: fullDateStr,
                log,
                isLoggedPeriod,
                isPredictedPeriod,
                isOvulation,
                isToday,
                isSelected,
            });
        }
        return days;
    }, [currentYear, currentMonth, daysInMonth, firstDayIndex, logsMap, predictedStart, predictedEnd, ovStart, ovEnd, todayYmd, selectedDate]);

    return (
        <MobileAppLayout
            title={t('cycle_title', 'Cycle Tracker')}
            actionButton={
                <button
                    onClick={() => setShowExportModal(true)}
                    className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 flex items-center justify-center transition active:scale-90"
                    title={t('cycle_summary_btn', 'Healthcare Summary')}
                    aria-label="Export Summary"
                >
                    <FileText className="w-4 h-4 text-rose-600" />
                </button>
            }
        >
            <Head title="Cycle Tracker & Calendar - Mwezi" />

            <div className="space-y-3.5 pb-6">

                {/* 1. THREE TOP METRIC TILES */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white rounded-2xl p-2.5 shadow-2xs border border-rose-150/70 text-center flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Avg Cycle
                        </span>
                        <div className="flex items-baseline justify-center space-x-1 my-0.5">
                            <span className="font-extrabold text-lg text-slate-900">
                                {cycleLength}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">d</span>
                        </div>
                        <span className={`text-[8.5px] font-bold block truncate ${profile?.is_first_year_menarche ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {profile?.is_first_year_menarche ? 'Teen Calibrated' : 'Regular'}
                        </span>
                    </div>

                    <div className="bg-white rounded-2xl p-2.5 shadow-2xs border border-rose-150/70 text-center flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Period
                        </span>
                        <div className="flex items-baseline justify-center space-x-1 my-0.5">
                            <span className="font-extrabold text-lg text-rose-600">
                                {periodLength}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">d</span>
                        </div>
                        <span className="text-[8.5px] text-rose-500 font-bold block truncate">Expected</span>
                    </div>

                    <div className="bg-white rounded-2xl p-2.5 shadow-2xs border border-rose-150/70 text-center flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Cycle Day
                        </span>
                        <div className="flex items-baseline justify-center space-x-0.5 my-0.5">
                            <span className="font-extrabold text-lg text-purple-700">
                                {currentCycleDay}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">/{cycleLength}</span>
                        </div>
                        <span className="text-[8.5px] text-purple-600 font-bold block truncate capitalize">
                            {currentPhase.shortName}
                        </span>
                    </div>
                </div>

                {/* Teen Menarche Calibration Notice (if active) */}
                {profile?.is_first_year_menarche && (
                    <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3 flex items-start space-x-2 text-xs text-amber-900 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold block text-amber-950 text-[11px]">Teen Calibration Active (21–45 Days)</span>
                            <span className="text-[10px] text-amber-800 leading-relaxed block mt-0.5">
                                For adolescents in the first 1–2 years, fluctuating intervals are healthy and natural.
                            </span>
                        </div>
                    </div>
                )}

                {/* 2. MODERN SEGMENTED VIEW SWITCHER */}
                <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center border border-slate-200/60 shadow-2xs">
                    <button
                        type="button"
                        onClick={() => setViewMode('doughnut')}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 ${
                            viewMode === 'doughnut'
                                ? 'bg-white text-rose-700 shadow-xs border border-rose-100'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <CircleDot className="w-3.5 h-3.5 text-rose-600" />
                        <span>Cycle Wheel</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('calendar')}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 ${
                            viewMode === 'calendar'
                                ? 'bg-white text-rose-700 shadow-xs border border-rose-100'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <CalendarIcon className="w-3.5 h-3.5 text-rose-600" />
                        <span>Full Calendar</span>
                    </button>
                </div>

                {/* 3. VIEW 1: DOUGHNUT CHART (CYCLE WHEEL) VIEW */}
                {viewMode === 'doughnut' && (
                    <div className="space-y-3.5 animate-fadeIn">
                        {/* Interactive Circular Wheel Container */}
                        <div className="bg-white rounded-3xl p-4 shadow-xs border border-rose-150/80 flex flex-col items-center">
                            
                            {/* Doughnut SVG Container */}
                            <div className="relative w-[260px] h-[260px] flex items-center justify-center my-1">
                                <svg
                                    viewBox="0 0 260 260"
                                    className="w-full h-full transform -rotate-0"
                                >
                                    <defs>
                                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="3" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                    </defs>

                                    {/* Background Track Ring */}
                                    <circle
                                        cx="130"
                                        cy="130"
                                        r="94"
                                        fill="none"
                                        stroke="#F1F5F9"
                                        strokeWidth="16"
                                    />

                                    {/* Phase Arc Segments */}
                                    {doughnutSegments.map((segment) => (
                                        <path
                                            key={segment.id}
                                            d={segment.path}
                                            fill="none"
                                            stroke={segment.color}
                                            strokeWidth={segment.isCurrent ? 18 : 15}
                                            strokeLinecap="round"
                                            className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                                            onClick={() => setSelectedPhaseTab(segment.id)}
                                        />
                                    ))}

                                    {/* Ovulation Peak Indicator Dot */}
                                    <circle
                                        cx={peakPointer.x}
                                        cy={peakPointer.y}
                                        r="3.5"
                                        fill="#FFFFFF"
                                        stroke="#9333EA"
                                        strokeWidth="2"
                                    />

                                    {/* Today's Glowing Pin on the Wheel */}
                                    <circle
                                        cx={todayPointer.x}
                                        cy={todayPointer.y}
                                        r="9"
                                        fill="#BE123C"
                                        opacity="0.3"
                                        className="animate-ping"
                                    />
                                    <circle
                                        cx={todayPointer.x}
                                        cy={todayPointer.y}
                                        r="7.5"
                                        fill="#FFFFFF"
                                        stroke="#BE123C"
                                        strokeWidth="3.5"
                                        className="shadow-md"
                                    />
                                    <circle
                                        cx={todayPointer.x}
                                        cy={todayPointer.y}
                                        r="2.5"
                                        fill="#BE123C"
                                    />
                                </svg>

                                {/* Center Hub Information */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-6">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Cycle Day
                                    </span>
                                    <div className="flex items-baseline space-x-1 my-0.5">
                                        <span className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                                            {currentCycleDay}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400">/{cycleLength}</span>
                                    </div>
                                    <div className={`mt-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${currentPhase.badgeBg}`}>
                                        {currentPhase.shortName}
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-semibold mt-1">
                                        {daysUntilNextPeriod === 0 
                                            ? 'Period expected today' 
                                            : `Next period in ~${daysUntilNextPeriod} days`}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                                        {currentPhase.conceptionRisk}
                                    </span>
                                </div>
                            </div>

                            {/* Wheel Legend Strip */}
                            <div className="grid grid-cols-4 gap-1.5 w-full mt-2 pt-3 border-t border-slate-100 text-center">
                                {phases.map((p) => {
                                    const isSelected = (selectedPhaseTab || currentPhase.id) === p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setSelectedPhaseTab(p.id)}
                                            className={`p-1.5 rounded-xl transition text-[9.5px] flex flex-col items-center ${
                                                isSelected 
                                                    ? `${p.bgColor} ${p.textColor} font-bold ring-1 ring-${p.color}/40` 
                                                    : 'hover:bg-slate-50 text-slate-500 font-medium'
                                            }`}
                                        >
                                            <span 
                                                className="w-2 h-2 rounded-full mb-1 shrink-0" 
                                                style={{ backgroundColor: p.color }}
                                            />
                                            <span className="truncate w-full">{p.shortName}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Log Button for Today */}
                        <button
                            type="button"
                            onClick={() => openLoggerForDate(todayYmd)}
                            className="w-full py-3.5 bg-[#BE123C] hover:bg-[#9F1239] active:scale-95 text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-200/60 transition flex items-center justify-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>
                                {logsMap[todayYmd] 
                                    ? `Update Symptoms for Today (Day ${currentCycleDay})` 
                                    : `Log Symptoms for Today (Day ${currentCycleDay})`}
                            </span>
                        </button>

                        {/* Phase Physiological Insights Card */}
                        {(() => {
                            const activePhaseData = phases.find(p => p.id === (selectedPhaseTab || currentPhase.id)) || currentPhase;
                            const IconComponent = activePhaseData.icon;

                            return (
                                <div className={`rounded-3xl p-4 shadow-2xs border ${activePhaseData.bgColor} ${activePhaseData.borderColor} transition-all`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-7 h-7 rounded-xl bg-white shadow-2xs flex items-center justify-center text-slate-800">
                                                <IconComponent className="w-3.5 h-3.5" style={{ color: activePhaseData.color }} />
                                            </div>
                                            <div>
                                                <h3 className="font-extrabold text-xs text-slate-900 leading-tight">
                                                    {activePhaseData.name}
                                                </h3>
                                                <span className="text-[10px] text-slate-500 font-semibold">
                                                    {activePhaseData.range}
                                                </span>
                                            </div>
                                        </div>
                                        {activePhaseData.id === currentPhase.id && (
                                            <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-rose-700 shadow-2xs border border-rose-200/60">
                                                Active Now
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1.5 text-xs text-slate-700 mt-2.5">
                                        <div className="bg-white/80 rounded-2xl p-2.5 border border-white/60">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Hormonal Rhythm
                                            </span>
                                            <p className="text-[11px] text-slate-700 font-medium mt-0.5">
                                                {activePhaseData.hormones}
                                            </p>
                                        </div>

                                        <div className="bg-white/80 rounded-2xl p-2.5 border border-white/60">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Daily Self-Care Tip
                                            </span>
                                            <p className="text-[11px] text-slate-700 font-medium mt-0.5">
                                                {activePhaseData.wellnessTip}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* 4. VIEW 2: FULL CALENDAR VIEW */}
                {viewMode === 'calendar' && (
                    <div className="space-y-3.5 animate-fadeIn">
                        {/* Month Calendar Card */}
                        <div className="bg-white rounded-3xl p-4 shadow-xs border border-rose-150/80">
                            
                            {/* Month Header with Navigation Controls */}
                            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
                                <div>
                                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                                        {monthNames[currentMonth]} {currentYear}
                                    </h2>
                                    <p className="text-[10px] text-slate-400 font-medium">Tap any date to view or record symptoms</p>
                                </div>
                                
                                <div className="flex items-center space-x-1.5">
                                    <button
                                        type="button"
                                        onClick={jumpToToday}
                                        className="text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-xl transition active:scale-95"
                                        title="Jump to Today"
                                    >
                                        Today
                                    </button>
                                    <div className="flex items-center space-x-0.5 bg-slate-50 p-0.5 rounded-xl border border-slate-200/60">
                                        <button
                                            type="button"
                                            onClick={prevMonth}
                                            className="p-1 rounded-lg hover:bg-white text-slate-600 active:scale-90 transition shadow-2xs"
                                            aria-label="Previous month"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={nextMonth}
                                            className="p-1 rounded-lg hover:bg-white text-slate-600 active:scale-90 transition shadow-2xs"
                                            aria-label="Next month"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
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
                                {calendarDays.map((item, idx) => {
                                    if (!item) {
                                        return <div key={idx} className="h-10" />;
                                    }

                                    let bgClass = "bg-slate-50/70 text-slate-700 hover:bg-rose-50/50 hover:text-rose-700 border border-transparent";
                                    let ringClass = "";

                                    if (item.isLoggedPeriod) {
                                        bgClass = "bg-[#BE123C] text-white font-bold shadow-2xs border-[#BE123C]";
                                    } else if (item.isPredictedPeriod) {
                                        bgClass = "bg-rose-100/80 text-rose-900 font-bold border-rose-200";
                                    } else if (item.isOvulation) {
                                        bgClass = "bg-purple-100/90 text-purple-900 font-bold border-purple-200";
                                    }

                                    if (item.isSelected) {
                                        ringClass = "ring-2 ring-rose-600 ring-offset-1 scale-[1.03] z-10 font-black";
                                    } else if (item.isToday) {
                                        ringClass = "ring-1.5 ring-slate-400 ring-offset-1 font-extrabold";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedDate(item.dateString)}
                                            className={`h-11 rounded-2xl flex flex-col items-center justify-center text-xs relative transition active:scale-90 ${bgClass} ${ringClass}`}
                                        >
                                            <span className="text-xs">{item.dayNum}</span>
                                            
                                            {/* Micro-indicators for symptoms/pads */}
                                            <div className="flex items-center space-x-0.5 absolute bottom-1">
                                                {item.log?.symptoms?.length > 0 && (
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        item.isLoggedPeriod ? 'bg-white' : 'bg-rose-500'
                                                    }`} />
                                                )}
                                                {item.log?.moods?.length > 0 && (
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        item.isLoggedPeriod ? 'bg-rose-200' : 'bg-purple-400'
                                                    }`} />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Calendar Color Legend */}
                            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-around text-[10px] text-slate-600">
                                <div className="flex items-center space-x-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#BE123C] shadow-2xs" />
                                    <span>Logged Flow</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-200" />
                                    <span>Predicted</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-purple-200" />
                                    <span>Ovulation</span>
                                </div>
                            </div>
                        </div>

                        {/* Selected Day Detail Card & Quick Action */}
                        <div className="bg-white rounded-3xl p-4 shadow-xs border border-rose-150/80 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Selected Date
                                    </span>
                                    <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                                        {formatDisplayDate(selectedDate)}
                                    </h3>
                                </div>

                                {selectedLog ? (
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 flex items-center space-x-1">
                                        <Check className="w-3 h-3" />
                                        <span>Logged</span>
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                                        No entry recorded
                                    </span>
                                )}
                            </div>

                            {/* Recorded Day Highlights (if any) */}
                            {selectedLog && (
                                <div className="space-y-2 text-xs">
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedLog.flow_intensity && selectedLog.flow_intensity !== 'none' && (
                                            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold capitalize text-[10px]">
                                                Flow: {selectedLog.flow_intensity}
                                            </span>
                                        )}
                                        {selectedLog.pad_changes_count > 0 && (
                                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                                {selectedLog.pad_changes_count} pads changed
                                            </span>
                                        )}
                                        {selectedLog.symptoms?.map((s) => (
                                            <span key={s} className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 font-medium text-[10px] border border-pink-200/50">
                                                {s}
                                            </span>
                                        ))}
                                        {selectedLog.moods?.map((m) => (
                                            <span key={m} className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-medium text-[10px] border border-purple-200/50">
                                                {m}
                                            </span>
                                        ))}
                                    </div>

                                    {selectedLog.private_notes && (
                                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-2xl italic border border-slate-100">
                                            "{selectedLog.private_notes}"
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Button to Log or Edit Record */}
                            <button
                                type="button"
                                onClick={() => openLoggerForDate(selectedDate)}
                                className="w-full py-3 bg-[#BE123C] hover:bg-[#9F1239] active:scale-95 text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-200/60 transition flex items-center justify-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>
                                    {selectedLog 
                                        ? `Edit Record for ${formatDisplayDate(selectedDate)}` 
                                        : `Log Symptoms for ${formatDisplayDate(selectedDate)}`}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* 5. RECENT LOGS LIST (SHARED AT BOTTOM) */}
                <div className="bg-white rounded-3xl p-4 shadow-xs border border-rose-150/80">
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Recent Recorded Days
                        </h3>
                        <span className="text-[10px] text-slate-400 font-medium">Last 5 records</span>
                    </div>

                    <div className="space-y-2">
                        {logs.length === 0 ? (
                            <p className="text-xs text-slate-400 py-3 text-center">No symptoms logged yet.</p>
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
                <div className="absolute inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs p-0 animate-fadeIn rounded-b-[40px] overflow-hidden">
                    <div
                        className="absolute inset-0 bg-transparent"
                        onClick={() => setShowLoggerModal(false)}
                    />
                    <div className="relative bg-white w-full rounded-t-[32px] max-h-[88%] overflow-y-auto p-5 shadow-2xl space-y-4 border-t border-rose-100 hide-scrollbar z-10">

                        {/* Sheet Handle & Header */}
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-1" />

                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-base text-slate-900">{t('cycle_log_symptoms', 'Log Symptoms & Flow')}</h3>
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
                                    {t('cycle_flow_intensity', 'Flow Intensity')}
                                </label>
                                <div className="grid grid-cols-5 gap-1 text-center">
                                    {['none', 'spotting', 'light', 'medium', 'heavy'].map((flow) => (
                                        <button
                                            key={flow}
                                            type="button"
                                            onClick={() => setData('flow_intensity', flow)}
                                            className={`py-2 px-1 rounded-2xl text-[10px] font-bold uppercase transition ${data.flow_intensity === flow
                                                    ? 'bg-[#BE123C] text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {t(`cycle_flow_${flow}`, flow)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pad Changes Stepper */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                    {t('cycle_pads_changed', 'Pads or Liners Changed')}
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
                                        {data.pad_changes_count} {t('cycle_pads_count', 'pads')}
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
                                    {t('cycle_symptoms_felt', 'Symptoms Felt')}
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableSymptoms.map((sym) => {
                                        const selected = data.symptoms.includes(sym);
                                        const symKey = `symptom_${sym.toLowerCase().replace(/[\s\/]/g, '_')}`;
                                        return (
                                            <button
                                                key={sym}
                                                type="button"
                                                onClick={() => toggleSymptom(sym)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition ${selected
                                                        ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                                                    }`}
                                            >
                                                {t(symKey, sym)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Mood Chips */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                    {t('cycle_mood_energy', 'Mood & Energy')}
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableMoods.map((mood) => {
                                        const selected = data.moods.includes(mood);
                                        const moodKey = `mood_${mood.toLowerCase()}`;
                                        return (
                                            <button
                                                key={mood}
                                                type="button"
                                                onClick={() => toggleMood(mood)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition ${selected
                                                        ? 'bg-purple-100 text-purple-800 border border-purple-300 font-bold'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                                                    }`}
                                            >
                                                {t(moodKey, mood)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Private Notes */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-bold text-slate-800">{t('cycle_private_notes', 'Private Notes')}</label>
                                    <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                                        <Lock className="w-3 h-3 text-emerald-600" />
                                        <span>{t('luna_encrypted', 'Encrypted')}</span>
                                    </span>
                                </div>
                                <textarea
                                    value={data.private_notes}
                                    onChange={(e) => setData('private_notes', e.target.value)}
                                    rows="2"
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
                                    placeholder={t('cycle_notes_placeholder', 'Add any private observations or medication notes...')}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 bg-[#BE123C] hover:bg-[#9F1239] active:scale-95 text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-200/60 transition disabled:opacity-50"
                            >
                                {processing ? t('loading', 'Saving...') : t('cycle_save_record', 'Save Record')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* EXPORT HEALTHCARE SUMMARY SHEET */}
            {showExportModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn rounded-[40px] overflow-hidden">
                    <div
                        className="absolute inset-0 bg-transparent"
                        onClick={() => setShowExportModal(false)}
                    />
                    <div className="relative bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-rose-100 z-10">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                                    <HeartPulse className="w-4 h-4 text-rose-600" />
                                </div>
                                <h3 className="font-bold text-sm text-slate-900">{t('cycle_export_title', 'Healthcare Summary')}</h3>
                            </div>
                            <button onClick={() => setShowExportModal(false)} className="text-slate-400 p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            {t('cycle_export_desc', 'Confidential medical summary to present to your clinic or school nurse:')}
                        </p>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-800">
                            <p><strong>{t('cycle_export_rhythm', 'Cycle Rhythm:')}</strong> Regular {profile?.average_cycle_length || 28}-day cycle</p>
                            <p><strong>{t('cycle_export_duration', 'Period Duration:')}</strong> ~{profile?.average_period_length || 5} days average</p>
                            <p><strong>{t('cycle_export_last', 'Last Recorded:')}</strong> {profile?.last_period_start || 'Recent cycle'}</p>
                            <p><strong>{t('cycle_export_pads', 'Pad Changes:')}</strong> Standard frequency logged</p>
                            <p><strong>{t('cycle_export_symptoms', 'Recorded Symptoms:')}</strong> Mild cramps, fatigue</p>
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                            <button
                                onClick={() => { window.print(); setShowExportModal(false); }}
                                className="flex-1 py-2.5 bg-[#BE123C] hover:bg-[#9F1239] text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-200/60 transition"
                            >
                                {t('cycle_export_print', 'Print / PDF')}
                            </button>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold transition"
                            >
                                {t('close', 'Close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MobileAppLayout>
    );
}
