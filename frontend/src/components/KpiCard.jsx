import { motion } from "framer-motion";

function KpiCard({ title, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      className="
            bg-slate-800/40 
            backdrop-blur-md 
            border 
            border-slate-700/50 
            rounded-2xl 
            p-6
            shadow-xl 
            hover:bg-slate-800/60 
            hover:-translate-y-1 
            transition-all 
            duration-300
            overflow-hidden
            "
    >
      <p className="text-gray-400 font-medium">{title}</p>
      <h1 className="text-5xl font-bold mt-4 text-white">{value}</h1>
    </motion.div>
  );
}

export default KpiCard;
