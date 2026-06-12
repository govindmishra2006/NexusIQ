import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { TrendingUp, AlertOctagon, ExternalLink } from "lucide-react";

export function AnalyticsRow({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Sales Trend Chart */}
      <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00F5FF]/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-[#00F5FF]" />
            </div>
            <div className="text-[#8B95A8] text-xs font-semibold tracking-[0.08em] uppercase">
              Data Distribution
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={data.charts}
            margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F5FF" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#00F5FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tick={{ fill: "#4A5260", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#4A5260", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F1117",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                color: "#F0F4FF",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#00F5FF"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Anomalies Detected Panel */}
      <div className="bg-white/[0.04] border border-[#FF4560]/20 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF4560]/10 border border-[#FF4560]/20 flex items-center justify-center">
              <AlertOctagon size={16} className="text-[#FF4560]" />
            </div>
            <div className="text-[#8B95A8] text-xs font-semibold tracking-[0.08em] uppercase">
              Anomalies Detected
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#FF4560]/10 border border-[#FF4560]/20 text-sm font-bold text-[#FF4560]">
            {data.anomalies.count} Found
          </div>
        </div>
        <div className="text-xs text-[#8B95A8] mb-5">
          IQR analysis flagged {data.anomalies.count} orders outside the normal
          bounds (${data.anomalies.lower_fence} - ${data.anomalies.upper_fence}
          ).
        </div>
        <div className="text-[#4A5260] text-[10px] font-semibold tracking-[0.1em] uppercase mb-3">
          Top Suspect SKUs
        </div>
        <div className="flex flex-col gap-3">
          {data.anomalies.top_suspect_skus.length > 0 ? (
            data.anomalies.top_suspect_skus.map(
              (sku: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FF4560]/[0.04] border border-[#FF4560]/[0.12]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center bg-[#FF4560]/20 text-[#FF4560]">
                      {index + 1}
                    </div>
                    <div className="text-sm font-medium text-[#F0F4FF]">
                      {sku}
                    </div>
                  </div>
                </div>
              ),
            )
          ) : (
            <div className="text-xs text-[#8B95A8]">
              No anomalous SKUs detected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
