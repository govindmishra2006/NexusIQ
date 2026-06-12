import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, XAxis, YAxis, Bar } from "recharts";
function AIInsight({ datasetInfo }) {
  const [aiData, setAiData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      // Send the exact data structure our Pydantic model requires
      const response = await axios.post(
        "http://127.0.0.1:8000/generate-insight",
        {
          rows: datasetInfo.rows,
          columns: datasetInfo.columns,
          numerical_columns: datasetInfo.numerical_columns,
          categorical_columns: datasetInfo.categorical_columns,
        },
      );
      setAiData(response.data);
    } catch (error) {
      console.error(error);
      setAiData({
        summary: "Failed to connect to the AI engine.",
        chart: null,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl"
    >
      <h2 className="text-3xl font-bold mb-6 text-white">
        🧠 AI Business Analysis
      </h2>

      {datasetInfo.rows === 0 ? (
        <p className="text-gray-400">
          Upload a dataset to begin business analysis.
        </p>
      ) : (
        <div className="space-y-4 text-lg text-gray-300">
          <p className="flex items-center gap-3">
            ✅ <span className="text-white">Dataset processed securely</span>
          </p>
          <p className="flex items-center gap-3">
            📊{" "}
            <span className="text-white">{datasetInfo.rows} rows detected</span>
          </p>
          <p className="flex items-center gap-3">
            📁{" "}
            <span className="text-white">
              {datasetInfo.columns} columns configured
            </span>
          </p>

          <div className="pt-6 border-t border-slate-700/50 mt-6">
            {aiData ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/60 p-6 rounded-xl border border-blue-500/30 shadow-inner"
              >
                <h3 className="text-blue-400 font-semibold mb-3">
                  Executive Summary
                </h3>
                <p className="text-gray-200 leading-relaxed text-base">
                  {aiData.summary}
                </p>
                {aiData.chart && (
                  <div className="mt-8 pt-6 border-t border-slate-700/50">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      📊 AI Recommended Visualization
                    </h3>

                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        {aiData.chart.type === "pie" ? (
                          <PieChart>
                            <Pie
                              data={datasetInfo.chart_data}
                              dataKey="count"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                            >
                              {datasetInfo.chart_data.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    [
                                      "#3b82f6",
                                      "#8b5cf6",
                                      "#10b981",
                                      "#f59e0b",
                                    ][index % 4]
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "none",
                                borderRadius: "8px",
                                color: "#fff",
                              }}
                            />
                          </PieChart>
                        ) : (
                          <BarChart data={datasetInfo.chart_data}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "none",
                                borderRadius: "8px",
                                color: "#fff",
                              }}
                            />
                            <Bar
                              dataKey="count"
                              fill="#8b5cf6"
                              radius={[6, 6, 0, 0]}
                            />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>

                    <p className="text-sm text-gray-400 mt-4 text-center">
                      AI generated a {aiData.chart.type} chart mapping{" "}
                      <span className="text-emerald-400 font-medium">
                        {aiData.chart.x_axis}
                      </span>{" "}
                      against{" "}
                      <span className="text-emerald-400 font-medium">
                        {aiData.chart.y_axis}
                      </span>
                      .
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="flex items-center gap-3 text-emerald-400 font-semibold">
                  🚀 Ready for advanced LLM reasoning
                </p>
                <button
                  onClick={generateSummary}
                  disabled={isGenerating}
                  className="
                                    bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 
                                    text-white px-6 py-3 rounded-xl font-medium transition-all duration-300
                                    shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]
                                    hover:-translate-y-1
                                    "
                >
                  {isGenerating ? "Analyzing..." : "Generate Summary"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default AIInsight;
