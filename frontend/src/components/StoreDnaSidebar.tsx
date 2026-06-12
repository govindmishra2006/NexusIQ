import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Store, TrendingUp, DollarSign, Target } from "lucide-react";
import { useStoreDna } from "../store/useStoreDna";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StoreDnaSidebar({ isOpen, onClose }: SidebarProps) {
  // 1. Hook into our Global State
  const { dna, loading, updateDna } = useStoreDna();

  // 2. Local State for the form inputs
  const [storeName, setStoreName] = useState(dna.storeName);
  const [targetAov, setTargetAov] = useState(dna.targetAov.toString());
  const [targetRevenue, setTargetRevenue] = useState(
    dna.targetRevenue.toString(),
  );

  // 3. Keep local state in sync with global state if it loads late
  useEffect(() => {
    setStoreName(dna.storeName);
    setTargetAov(dna.targetAov.toString());
    setTargetRevenue(dna.targetRevenue.toString());
  }, [dna]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDna({
      storeName,
      targetAov: Number(targetAov),
      targetRevenue: Number(targetRevenue),
    });
    onClose(); // Slide the sidebar away after saving
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* The Sidebar Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0A0C10] border-l border-white/[0.08] shadow-2xl z-50 p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#00F5FF]/10 rounded-lg flex items-center justify-center">
                  <Target className="text-[#00F5FF]" size={20} />
                </div>
                <h2 className="text-xl font-bold text-[#F0F4FF]">Store DNA</h2>
              </div>
              <button
                onClick={onClose}
                className="text-[#8B95A8] hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-[#8B95A8] text-sm mb-8 leading-relaxed">
              Define your baseline metrics. NexusIQ AI will use this context to
              generate hyper-personalized insights based on your specific
              business goals.
            </p>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#8B95A8] uppercase">
                  Store Name
                </label>
                <div className="relative">
                  <Store
                    className="absolute left-3 top-3 text-[#4A5260]"
                    size={16}
                  />
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-[#0F1117] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-[#F0F4FF] focus:outline-none focus:border-[#00F5FF]/50 transition-colors"
                    placeholder="Acme Co."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#8B95A8] uppercase">
                  Target AOV ($)
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-3 text-[#4A5260]"
                    size={16}
                  />
                  <input
                    type="number"
                    required
                    value={targetAov}
                    onChange={(e) => setTargetAov(e.target.value)}
                    className="w-full bg-[#0F1117] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-[#F0F4FF] focus:outline-none focus:border-[#00F5FF]/50 transition-colors"
                    placeholder="85"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-[#8B95A8] uppercase">
                  Monthly Revenue Goal ($)
                </label>
                <div className="relative">
                  <TrendingUp
                    className="absolute left-3 top-3 text-[#4A5260]"
                    size={16}
                  />
                  <input
                    type="number"
                    required
                    value={targetRevenue}
                    onChange={(e) => setTargetRevenue(e.target.value)}
                    className="w-full bg-[#0F1117] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-[#F0F4FF] focus:outline-none focus:border-[#00F5FF]/50 transition-colors"
                    placeholder="100000"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00F5FF] text-[#0A0C10] font-bold py-3 rounded-xl hover:bg-[#00D1DB] transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving to Database..." : "Save Store DNA"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
