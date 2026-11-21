import { Link } from '@inertiajs/react';
import { Moon } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#F8EAE6] flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-purple-200/60 selection:text-[#2D2638]">
            {/* Ambient Soft Pastel Mesh Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-28 -left-24 h-[420px] w-[420px] rounded-full bg-[#FADCD3] opacity-90 blur-3xl" />
                <div className="absolute top-1/4 -right-28 h-[460px] w-[460px] rounded-full bg-[#D8C2FA] opacity-75 blur-3xl" />
                <div className="absolute -bottom-32 left-1/4 h-[440px] w-[440px] rounded-full bg-[#F3D2E5] opacity-85 blur-3xl" />
                <div className="absolute bottom-10 right-10 h-[300px] w-[300px] rounded-full bg-[#E5D4FC] opacity-70 blur-3xl" />
            </div>

            <div className="relative z-10 mb-5 text-center">
                <Link href="/" className="inline-flex items-center space-x-2 text-[#2D2638]">
                    <div className="w-8 h-8 rounded-full bg-white/75 border border-white flex items-center justify-center shadow-xs">
                        <Moon className="w-4 h-4 text-[#3D334D]" strokeWidth={2.2} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Mwezi</span>
                </Link>
            </div>

            <div className="relative z-10 w-full sm:max-w-md rounded-[32px] bg-white/55 backdrop-blur-2xl border border-white/85 shadow-[0_24px_60px_-15px_rgba(92,71,112,0.16)] px-7 py-6 text-[#2D2638]">
                {children}
            </div>
        </div>
    );
}
