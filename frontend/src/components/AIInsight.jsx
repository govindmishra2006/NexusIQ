import { motion } from "framer-motion"

function AIInsight({ datasetInfo }) {
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
                    <div className="pt-4 border-t border-slate-700/50 mt-4">
                        <p className="flex items-center gap-3 text-emerald-400 font-semibold">
                            🚀 Ready for advanced LLM reasoning
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    )
}

export default AIInsight