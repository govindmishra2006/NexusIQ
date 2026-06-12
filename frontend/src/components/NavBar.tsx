import { Bell } from "lucide-react";

export function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0A0C10]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center justify-between px-8 max-w-[1400px] mx-auto h-full">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gradient-to-br from-[#00F5FF] to-[#7C3AED] rounded-lg" />
          <span className="text-lg font-bold text-[#F0F4FF] tracking-tight">NexusIQ</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/20">
            BETA
          </span>
          <Bell
            size={18}
            className="text-[#8B95A8] cursor-pointer hover:text-[#F0F4FF] transition-colors"
          />
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#00F5FF] flex items-center justify-center text-xs font-bold text-white">
            G
          </div>
        </div>
      </div>
    </nav>
  );
}
