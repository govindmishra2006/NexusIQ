import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  RefreshCw,
  ShieldCheck,
  Download,
  Loader2,
  Server,
  CheckCircle,
} from "lucide-react";
import { KPIRow } from "./KPIRow";
import { AIBrainRow } from "./AIBrainRow";
import { AnalyticsRow } from "./AnalyticsRow";
import { supabase } from "../lib/supabase";
import { useStoreDna } from "../store/useStoreDna";
import {ForecastCard} from "./ForecastCard";

// ==========================================
// 1. THE SHOPIFY INTEGRATION UI PORTAL
// ==========================================
const ShopifyIntegrationCard = () => {
  const { isShopifyConnected, shopDomain, lastSyncTime, setShopifyConnection } =
    useStoreDna();
  const [shopInput, setShopInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // The URL Sniffer
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("integration") === "success") {
      window.history.replaceState({}, document.title, window.location.pathname);
      setShopifyConnection(true, "Your Store", new Date().toISOString());
    }
  }, [setShopifyConnection]);

  // The OAuth Handshake
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
    <div className="w-full mb-4 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02]">
      <AnimatePresence mode="wait">
        {!isShopifyConnected ? (
          // --- STATE 1: NOT CONNECTED (Dark Theme) ---
          <motion.div
            key="connect-box"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-8 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="p-4 bg-[#00F5FF]/10 rounded-full border border-[#00F5FF]/20">
              <Server className="w-8 h-8 text-[#00F5FF]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F0F4FF]">
                Connect Shopify Data Engine
              </h3>
              <p className="text-sm text-[#8B95A8] max-w-md mx-auto mt-2">
                Stop manually uploading CSVs. Establish a secure OAuth
                connection to automatically sync orders and generate nightly AI
                briefs.
              </p>
            </div>
            <div className="flex w-full max-w-md mt-6">
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
          // --- STATE 2: LIVE SYNC ACTIVE (Dark Theme) ---
          <motion.div
            key="sync-box"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-[#00F5FF]/[0.03] flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-[#00F5FF]/10 rounded-full flex items-center justify-center border border-[#00F5FF]/20">
                  <CheckCircle className="w-6 h-6 text-[#00F5FF]" />
                </div>
                <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F5FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00F5FF]"></span>
                </span>
              </div>
              <div>
                <h3 className="text-md font-bold text-[#F0F4FF]">
                  Live Sync Active
                </h3>
                <p className="text-xs text-[#8B95A8] font-mono mt-1 flex items-center gap-2">
                  <ShieldCheck size={12} className="text-[#00F5FF]" />
                  Connected to {shopDomain || "Shopify"}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-[#4A5260] uppercase tracking-wider font-bold">
                Last Sync
              </p>
              <p className="text-sm text-[#00F5FF] mt-1 font-mono">
                {lastSyncTime
                  ? new Date(lastSyncTime).toLocaleTimeString()
                  : "Just now"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 2. THE MAIN DASHBOARD ASSEMBLY
// ==========================================
export function Dashboard({ data }: { data: any }) {
  const [isExporting, setIsExporting] = useState(false);

  // --- THE BLOB DOWNLOAD PIPELINE ---
  const handleExportPDF = async () => {
    if (!data) return; // Prevent export if no data exists yet

    setIsExporting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("http://localhost:8000/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          filename: data.filename || "Shopify_Data_Export",
          metrics: data.metrics || {},
          aiBrief: data.aiBrief || {},
        }),
      });

      if (!response.ok) throw new Error("Backend failed to generate the PDF.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `NexusIQ_Brief_${new Date().toISOString().split("T")[0]}.pdf`,
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Failed to export PDF. Check terminal logs.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6 py-8"
    >
      {/* The new Connection Engine always renders */}
      <ShopifyIntegrationCard />

      {/* The Dashboard Data only renders if data is present */}
      {data ? (
        <>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[#8B95A8] text-xs font-semibold tracking-[0.08em] uppercase">
                Executive Dashboard
              </div>
              <div className="text-2xl font-bold text-[#F0F4FF] tracking-tight mt-1">
                30-Second CEO Brief
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-[#8B95A8]">
                <Clock size={12} />
                Last updated: Just now
              </div>

              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/20 hover:bg-[#00F5FF]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold tracking-wide"
              >
                {isExporting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Rendering...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Export Brief
                  </>
                )}
              </button>

              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] cursor-pointer transition-colors">
                <RefreshCw size={16} className="text-[#8B95A8]" />
              </div>
            </div>
          </div>

          <KPIRow data={data} />
          <ForecastCard />
          <AIBrainRow data={data} />
          <AnalyticsRow data={data} />

          <footer className="mt-8 py-6 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-xs text-[#4A5260]">
              <span>NexusIQ © 2026 · Enterprise Analytics Platform</span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} />
                SOC 2 Compliant · Your data never leaves your session
              </span>
            </div>
          </footer>
        </>
      ) : (
        <div className="text-center py-12 text-[#4A5260] text-sm">
          Awaiting data. Please connect your Shopify store or upload a CSV.
        </div>
      )}
    </motion.div>
  );
}
