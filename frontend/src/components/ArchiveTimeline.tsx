import { useEffect } from "react";
import { motion } from "framer-motion";
import { useBriefArchive } from "../store/useBriefArchive";

interface ArchiveTimelineProps {
  onSelectBrief: (dashboardData: any) => void;
}

export default function ArchiveTimeline({
  onSelectBrief,
}: ArchiveTimelineProps) {
  const { archives, fetchArchives, loading } = useBriefArchive();

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  if (loading) {
    return (
      <div className="w-85 h-full flex items-center justify-center text-gray-500 border-r border-white/10 bg-black/20 font-mono text-xs">
        Loading history...
      </div>
    );
  }

  return (
    <div className="w-85 h-full border-r border-white/10 bg-black/20 backdrop-blur-xl p-4 overflow-y-auto hidden md:block">
      <h2 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-6 mt-2">
        Brief Archive
      </h2>

      <div className="space-y-4">
        {archives.map((archive, index) => {
          const data = archive.dashboard_data;
          const anomalyCount = data.anomalies?.count || 0;

          // 🚦 Dynamic border colors depending on severe metrics or anomaly quantities
          let borderColor = "border-l-emerald-500";
          if (anomalyCount > 0 && anomalyCount < 5)
            borderColor = "border-l-amber-500";
          if (anomalyCount >= 5) borderColor = "border-l-rose-500";

          return (
            <motion.div
              key={archive.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => onSelectBrief(data)}
              className={`p-4 rounded-xl cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all ${borderColor} border-l-4 shadow-lg`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] text-gray-400 font-mono">
                  {new Date(archive.created_at).toLocaleDateString()}
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-300 truncate max-w-[120px]">
                  {archive.filename}
                </span>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
                    Revenue
                  </p>
                  <p className="text-base font-semibold text-white tracking-tight">
                    $
                    {data.metrics?.total_revenue?.toLocaleString() ||
                      data.total_revenue?.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-bold ${anomalyCount > 0 ? "text-rose-400" : "text-emerald-400"}`}
                  >
                    {anomalyCount}{" "}
                    {anomalyCount === 1 ? "Anomaly" : "Anomalies"}
                  </p>
                </div>
              </div>
              {anomalyCount > 0 && data.anomalies?.top_suspect_skus?.[0] && (
                <div className="mt-3 pt-2 border-t border-white/5">
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider">
                    Top Suspect SKU
                  </p>
                  <p className="text-xs font-mono text-rose-300 truncate max-w-full">
                    ⚠️ {data.anomalies.top_suspect_skus[0]}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}

        {archives.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-10 font-mono">
            No past records.
          </div>
        )}
      </div>
    </div>
  );
}
