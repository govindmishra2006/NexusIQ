import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../lib/supabase";

export function ForecastCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const response = await fetch("http://localhost:8000/forecast", {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "failed to fetch forecast data");
        }
        const result = await response.json();

        const formattedData = result.forecast_data.map((day: any) => ({
          ...day,
          date: new Date(day.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          confidenceBand: [day.lower_band, day.upper_band],
        }));

        setData({ ...result, forecast_data: formattedData });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-96 bg-white/[0.02] border border-white/[0.08] rounded-2xl flex flex-col items-center justify-center animate-pulse">
        <Activity className="w-8 h-8 text-[#00F5FF]/50 mb-4 animate-bounce" />
        <p className="text-[#8B95A8] text-sm">
          Running Scikit-Learn Regression...
        </p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
        <AlertTriangle className="text-red-400 w-6 h-6" />
        <p className="text-red-200 text-sm">{error}</p>
      </div>
    );
  }
  if (!data) return null;

  const isOnTrack = data.goal_delta_pct >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-[#0A0C10] border border-white/[0.08] rounded-3xl p-6 md:p-8"
      style={{
        boxShadow:
          "0 4px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="text-[#00F5FF] text-xs font-bold tracking-[0.15em] uppercase mb-2 flex items-center gap-2">
            <Activity size={14} />
            30-Day Predictive Forecast
          </div>
          <h3 className="text-2xl font-bold text-[#F0F4FF]">
            Projected: ${data.projected_30d_total.toLocaleString()}
          </h3>
        </div>

        {/* The Strategic Pill Badge */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            isOnTrack
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {isOnTrack ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="text-sm font-semibold tracking-wide">
            {isOnTrack
              ? `On track to beat goal by ${data.goal_delta_pct}%`
              : `Trending to miss goal by ${Math.abs(data.goal_delta_pct)}%`}
          </span>
        </div>
      </div>

      {data.confidence === "low" && (
        <div className="mb-6 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-yellow-500 w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-yellow-200/80 text-sm leading-relaxed">
            <strong>High Volatility Detected:</strong> Your recent sales history
            is highly erratic (R² = {data.r_squared}). The confidence bands
            below have been widened automatically to account for this
            unpredictability.
          </p>
        </div>
      )}

      {/* The Recharts Area & Line Implementation */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data.forecast_data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#00F5FF" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#4A5260"
              fontSize={12}
              tickMargin={10}
              axisLine={false}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis
              stroke="#4A5260"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#141820",
                borderColor: "rgba(255,255,255,0.08)",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                color: "#F0F4FF",
              }}
              itemStyle={{ color: "#00F5FF" }}
              formatter={(value: any, name: string) => {
                if (name === "confidenceBand")
                  return [`$${value[0]} - $${value[1]}`, "95% Range"];
                return [`$${value}`, "Predicted Revenue"];
              }}
              labelStyle={{ color: "#8B95A8", marginBottom: "4px" }}
            />
            {/* 1. The Shaded Confidence Band */}
            <Area
              type="monotone"
              dataKey="confidenceBand"
              stroke="none"
              fill="url(#colorBand)"
              isAnimationActive={true}
            />
            {/* 2. The Dashed Future Estimate Line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#00F5FF"
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={false}
              activeDot={{
                r: 6,
                fill: "#0A0C10",
                stroke: "#00F5FF",
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
