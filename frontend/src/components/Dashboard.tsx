import { motion } from "framer-motion";
import { Clock, RefreshCw, ShieldCheck } from "lucide-react";
import { KPIRow } from "./KPIRow";
import { AIBrainRow } from "./AIBrainRow";
import { AnalyticsRow } from "./AnalyticsRow";

export function Dashboard({ data }: { data: any }) {
  if (!data) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6 py-8"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-[#8B95A8] text-xs font-semibold tracking-[0.08em] uppercase">
            Executive Dashboard
          </div>
          <div className="text-2xl font-bold text-[#F0F4FF] tracking-tight mt-1">
            30-Second CEO Brief
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#8B95A8]">
            <Clock size={12} />
            Last updated: Just now
          </div>
          <div className="ml-4 p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] cursor-pointer transition-colors">
            <RefreshCw size={14} className="text-[#8B95A8]" />
          </div>
        </div>
      </div>

      <KPIRow data={data} />
      <AIBrainRow data={data} />
      <AnalyticsRow data={data} />

      <footer className="mt-8 py-6 border-t border-white/[0.06]">
        <div className="flex items-center justify-between text-xs text-[#4A5260]">
          <span>NexusIQ © 2025 · Enterprise Analytics Platform</span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} />
            SOC 2 Compliant · Your data never leaves your session
          </span>
        </div>
      </footer>
    </motion.div>
  );
}
