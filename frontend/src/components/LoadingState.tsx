import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

const steps = [
  { icon: "check", text: "Parsing CSV schema...", active: false },
  { icon: "check", text: "Running IQR anomaly detection...", active: false },
  { icon: "loader", text: "Generating executive brief...", active: true },
];

export function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-8"
    >
      <div className="relative w-20 h-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, #00F5FF, #7C3AED, transparent)",
            boxShadow: "0 0 30px rgba(0, 245, 255, 0.3)",
          }}
        />
        <div className="absolute inset-2 rounded-full bg-[#0A0C10]" />
      </div>

      <div className="text-center">
        <div className="text-2xl font-bold text-[#F0F4FF] tracking-tight">
          Running Math Engine...
        </div>
        <div className="text-sm text-[#8B95A8] mt-2">
          Detecting anomalies with IQR analysis across 847 orders
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.5 }}
            className="flex items-center gap-3 text-sm"
          >
            {step.icon === "check" ? (
              <CheckCircle2 size={16} className="text-[#10B981]" />
            ) : (
              <Loader2 size={16} className="text-[#00F5FF] animate-spin" />
            )}
            <span
              className={
                step.active ? "text-[#F0F4FF] font-medium" : "text-[#8B95A8]"
              }
            >
              {step.text}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
