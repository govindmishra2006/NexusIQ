import {
  Brain,
  Target,
  Sparkles,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export function AIBrainRow({ data }: { data: any }) {
  if (!data || !data.aiBrief) return null;

  const brief = data.aiBrief;

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Executive Summary */}
      <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#00F5FF]/10 flex items-center justify-center">
            <Brain size={16} className="text-[#00F5FF]" />
          </div>
          <div className="text-[#8B95A8] text-xs font-semibold tracking-[0.08em] uppercase">
            Executive Summary
          </div>
          <div className="ml-auto px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
            Gemini AI
          </div>
        </div>
        <p className="text-sm text-[#F0F4FF] leading-relaxed">
          {brief.summary}
        </p>
        <div className="mt-5 pt-5 border-t border-white/[0.06] flex items-center gap-2 text-xs text-[#4A5260]">
          <Sparkles size={12} className="text-[#7C3AED]" />
          Root Causes: {brief.root_causes.join(" ")}
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
            <Target size={16} className="text-[#7C3AED]" />
          </div>
          <div className="text-[#8B95A8] text-xs font-semibold tracking-[0.08em] uppercase">
            Action Plan
          </div>
          <div className="ml-auto px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
            {brief.recommendations.length} Actions
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {brief.recommendations.map((rec: string, index: number) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center">
                <AlertTriangle size={12} className="text-[#EF4444]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#F0F4FF]">
                  Recommendation {index + 1}
                </div>
                <div className="text-xs text-[#8B95A8] mt-1">{rec}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
