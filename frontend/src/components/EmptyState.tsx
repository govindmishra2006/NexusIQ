import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useStoreDna } from "../store/useStoreDna";

interface EmptyStateProps {
  onRunDemo: () => void;
  onFileUpload?: (file: File) => void; // Kept for type safety if your parent still passes it
}

export function EmptyState({ onRunDemo }: EmptyStateProps) {
  const { isShopifyConnected, shopDomain, setShopifyConnection } =
    useStoreDna();
  const [shopInput, setShopInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 1. THE URL SNIFFER
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("integration") === "success") {
      window.history.replaceState({}, document.title, window.location.pathname);
      setShopifyConnection(true, "Your Store", new Date().toISOString());
    }
  }, [setShopifyConnection]);

  // 2. THE OAUTH HANDSHAKE
  const handleConnect = async () => {
    if (!shopInput.includes(".myshopify.com")) {
      alert("Please enter a valid .myshopify.com domain");
      return;
    }

    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(
        `http://localhost:8000/shopify/install-url?shop=${shopInput}`,
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        },
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to generate install URL");
      }
    } catch (error) {
      console.error(error);
      alert("Connection failed. Check console logs.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-16">
      <div className="text-[#00F5FF] text-xs font-semibold tracking-[0.15em] uppercase mb-4">
        Powered by IQR Anomaly Detection + LLM Intelligence
      </div>
      <h1 className="text-5xl font-bold text-[#F0F4FF] text-center leading-tight tracking-tight mb-4 max-w-2xl">
        Your 30-Second CEO Brief
      </h1>
      <p className="text-[#8B95A8] text-lg text-center max-w-xl mb-12">
        Connect your Shopify store. NexusIQ's math engine automatically syncs
        orders, detects anomalies, and generates your executive briefing
        nightly.
      </p>

      {/* 3. THE ANIMATED INTEGRATION PORTAL */}
      <div className="w-full max-w-2xl mb-8">
        <AnimatePresence mode="wait">
          {!isShopifyConnected ? (
            <motion.div
              key="connect-box"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-12 flex flex-col items-center text-center relative overflow-hidden"
              style={{
                boxShadow:
                  "0 0 40px rgba(0, 245, 255, 0.05), 0 0 80px rgba(124, 58, 237, 0.05)",
              }}
            >
              <div className="p-4 bg-[#00F5FF]/10 rounded-full border border-[#00F5FF]/20 mb-6">
                <Server className="w-8 h-8 text-[#00F5FF]" />
              </div>
              <h3 className="text-2xl font-bold text-[#F0F4FF] mb-2">
                Connect Shopify Data Engine
              </h3>
              <p className="text-[#8B95A8] mb-8 max-w-md">
                Establish a secure OAuth connection to permanently replace
                manual CSV uploads.
              </p>

              <div className="flex w-full max-w-md relative z-10">
                <input
                  type="text"
                  placeholder="mystore.myshopify.com"
                  value={shopInput}
                  onChange={(e) => setShopInput(e.target.value)}
                  className="flex-1 px-4 py-3 bg-black/50 border border-white/[0.08] border-r-0 rounded-l-lg text-[#F0F4FF] placeholder-[#4A5260] focus:outline-none focus:border-[#00F5FF]/50 transition-colors"
                />
                <button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="px-6 py-3 bg-[#00F5FF]/10 text-[#00F5FF] font-semibold border border-[#00F5FF]/20 rounded-r-lg hover:bg-[#00F5FF]/20 transition-colors flex items-center justify-center min-w-[120px]"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Connect"
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sync-box"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#00F5FF]/[0.03] border border-[#00F5FF]/20 rounded-3xl p-12 flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-[#00F5FF]/10 rounded-full flex items-center justify-center border border-[#00F5FF]/20">
                  <CheckCircle className="w-8 h-8 text-[#00F5FF]" />
                </div>
                <span className="absolute top-0 right-0 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F5FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00F5FF]"></span>
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#F0F4FF] mb-2">
                Live Sync Active
              </h3>
              <p className="text-[#8B95A8] font-mono mb-8">
                Connected to {shopDomain || "Shopify"}
              </p>

              <button
                onClick={onRunDemo}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00F5FF] to-[#7C3AED] text-[#0A0C10] font-semibold text-sm hover:opacity-90 transition-all duration-200"
              >
                View Executive Brief →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 w-full max-w-2xl my-4">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[#4A5260] text-xs">OR</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      <button
        onClick={onRunDemo}
        className="px-8 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#8B95A8] font-semibold text-sm hover:bg-white/[0.08] transition-all duration-200"
      >
        Run Demo Analysis
      </button>
    </div>
  );
}
