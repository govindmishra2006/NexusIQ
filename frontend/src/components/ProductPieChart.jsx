import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts"
import { motion } from "framer-motion"

function ProductPieChart({ data }) {
    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl"
        >
            <h2 className="text-3xl font-bold mb-6 text-white">
                Product Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" outerRadius={100}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '12px', 
                            color: '#fff' 
                        }} 
                    />
                </PieChart>
            </ResponsiveContainer>
        </motion.div>
    )
}

export default ProductPieChart