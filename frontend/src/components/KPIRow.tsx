import { DollarSign, ShoppingBag, BarChart3, TrendingUp } from "lucide-react";

export function KPIRow({ data }: { data: any }) {
  if (!data) return null;

  // We format the live backend math into our 3 KPI cards
  const kpis = [
    {
      label: "Total Revenue",
      value: `$${data.metrics.total_revenue.toLocaleString()}`,
      trend: "Analyzed",
      compare: "from uploaded dataset",
      gradientFrom: "from-[#00F5FF]/40",
      Icon: DollarSign,
    },
    {
      label: "Total Orders",
      value: data.metrics.order_count.toLocaleString(),
      trend: "Analyzed",
      compare: "from uploaded dataset",
      gradientFrom: "from-[#7C3AED]/40",
      Icon: ShoppingBag,
    },
    {
      label: "Avg Order Value",
      value: `$${data.metrics.avg_order_value.toLocaleString()}`,
      trend: "Analyzed",
      compare: "from uploaded dataset",
      gradientFrom: "from-[#10B981]/40",
      Icon: BarChart3,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-5">
      {kpis.map((kpi, i) => (
        <div
          key={kpi.label}
          className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-[#8B95A8] text-xs font-semibold tracking-[0.08em] uppercase">
              {kpi.label}
            </div>
            <kpi.Icon size={18} className="text-[#00F5FF] opacity-60" />
          </div>
          <div className="text-[2rem] font-bold text-[#F0F4FF] tracking-tight leading-none">
            {kpi.value}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <TrendingUp size={14} className="text-[#10B981]" />
            <span className="text-xs font-semibold text-[#10B981]">{kpi.trend}</span>
            <span className="text-xs text-[#4A5260]">{kpi.compare}</span>
          </div>
          <div
            className={`mt-4 h-[2px] rounded-full bg-gradient-to-r ${kpi.gradientFrom} to-transparent`}
          />
        </div>
      ))}
    </div>
  );
}