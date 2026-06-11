import { useState } from "react"
import { motion } from "framer-motion"
import axios from "axios"

function AIInsight({ datasetInfo }) {
    const [insight, setInsight] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)

    const generateSummary = async () => {
        setIsGenerating(true)
        try {
            // Send the exact data structure our Pydantic model requires
            const response = await axios.post("http://127.0.0.1:8000/generate-insight", {
                rows: datasetInfo.rows,
                columns: datasetInfo.columns,
                numerical_columns: datasetInfo.numerical_columns,
                categorical_columns: datasetInfo.categorical_columns
            })
            setInsight(response.data.insight)
        } catch (error) {
            console.error(error)
            setInsight("Failed to connect to the AI brain. Ensure your backend and API key are running.")
        } finally {
            setIsGenerating(false)
        }
    }

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
                        📊 <span className="text-white">{datasetInfo.rows} rows detected</span>
                    </p>
                    <p className="flex items-center gap-3">
                        📁 <span className="text-white">{datasetInfo.columns} columns configured</span>
                    </p>
                    
                    <div className="pt-6 border-t border-slate-700/50 mt-6">
                        {insight ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-slate-900/60 p-6 rounded-xl border border-blue-500/30 shadow-inner"
                            >
                                <h3 className="text-blue-400 font-semibold mb-3">Executive Summary</h3>
                                <p className="text-gray-200 leading-relaxed text-base">
                                    {insight}
                                </p>
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
    )
}

export default AIInsight