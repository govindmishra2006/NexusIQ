import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

// --- 1. The Number Animation Engine ---
function AnimatedNumber({
  value,
  prefix = "",
  isCurrency = false,
}: {
  value: number;
  prefix?: string;
  isCurrency?: boolean;
}) {
  const count = useMotionValue(0);

  const rounded = useTransform(count, (latest) =>
    isCurrency ? latest.toFixed(2) : Math.round(latest),
  );

  const display = useTransform(
    rounded,
    (latest) => `${prefix}${Number(latest).toLocaleString()}`,
  );

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      type: "spring",
      bounce: 0.1,
    });
    return controls.stop;
  }, [value]);

  return <motion.span>{display}</motion.span>;
}

// --- 2. The Delta Badge Logic ---
function DeltaBadge({ delta }: { delta: number | undefined }) {
  if (delta === undefined) return null;

  const isPositive = delta > 0;
  const isNegative = delta < 0;

  let colorClass = "text-[#8B95A8] bg-white/[0.04] border-white/[0.08]";
  let arrow = "−";

  if (isPositive) {
    colorClass = "text-[#00F5FF] bg-[#00F5FF]/10 border-[#00F5FF]/20";
    arrow = "↑";
  } else if (isNegative) {
    colorClass = "text-rose-400 bg-rose-400/10 border-rose-400/20";
    arrow = "↓";
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 ${colorClass}`}
    >
      <span>{arrow}</span>
      <span>{Math.abs(delta)}%</span>
    </motion.div>
  );
}

// --- 3. The Moduler KPI Row Component ---
export function KPIRow({ data }: { data: any }) {
  if (!data) return null;

  const { metrics, aiBrief } = data;

  // Safely extract the deltas that Python snuck into the AI response payload
  const deltas = aiBrief?.deltas || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Revenue Card */}
      <div className="bg-[#0A0C10]/50 border border-white/[0.06] rounded-xl p-5 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F5FF]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <p className="text-xs text-[#8B95A8] uppercase tracking-wider mb-2 font-medium">
          Total Revenue
        </p>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-[#F0F4FF] tracking-tight">
            <AnimatedNumber
              value={metrics?.total_revenue || 0}
              prefix="$"
              isCurrency={true}
            />
          </div>
          <DeltaBadge delta={deltas.revenue} />
        </div>
      </div>

      {/* Orders Card */}
      <div className="bg-[#0A0C10]/50 border border-white/[0.06] rounded-xl p-5 backdrop-blur-md relative overflow-hidden">
        <p className="text-xs text-[#8B95A8] uppercase tracking-wider mb-2 font-medium">
          Total Orders
        </p>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-[#F0F4FF] tracking-tight">
            <AnimatedNumber value={metrics?.order_count || 0} />
          </div>
          <DeltaBadge delta={deltas.orders} />
        </div>
      </div>

      {/* AOV Card */}
      <div className="bg-[#0A0C10]/50 border border-white/[0.06] rounded-xl p-5 backdrop-blur-md relative overflow-hidden">
        <p className="text-xs text-[#8B95A8] uppercase tracking-wider mb-2 font-medium">
          Avg Order Value
        </p>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-[#F0F4FF] tracking-tight">
            <AnimatedNumber
              value={metrics?.avg_order_value || 0}
              prefix="$"
              isCurrency={true}
            />
          </div>
          <DeltaBadge delta={deltas.aov} />
        </div>
      </div>
    </div>
  );
}
