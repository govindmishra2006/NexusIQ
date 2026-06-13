import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, RefreshCw, ShieldCheck, Download, Loader2 } from "lucide-react";
import { KPIRow } from "./KPIRow";
import { AIBrainRow } from "./AIBrainRow";
import { AnalyticsRow } from "./AnalyticsRow";
import { supabase } from "../lib/supabase";

export function Dashboard({ data }: { data: any }) {
  const [isExporting, setIsExporting] = useState(false);

  if (!data) return null;

  // --- THE BLOB DOWNLOAD PIPELINE ---
  // --- THE BLOB DOWNLOAD PIPELINE ---
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // 🚨 THE FIX: Grab the current user's security token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("http://localhost:8000/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 🚨 THE FIX: Hand the VIP pass to the backend
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          filename: data.filename || "Shopify_Data_Export",
          metrics: data.metrics || {},
          aiBrief: data.aiBrief || {},
        }),
      });

      if (!response.ok) {
        throw new Error("Backend failed to generate the PDF.");
      }

      // Receive the binary data
      const blob = await response.blob();

      // The "Hidden Link Hack"
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `NexusIQ_Brief_${new Date().toISOString().split("T")[0]}.pdf`,
      );

      // Append, Click, and Destroy
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
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-[#8B95A8] text-xs font-semibold tracking-[0.08em] uppercase">
            Executive Dashboard
          </div>
          <div className="text-2xl font-bold text-[#F0F4FF] tracking-tight mt-1">
            30-Second CEO Brief
          </div>
        </div>

        {/* The Action Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-[#8B95A8]">
            <Clock size={12} />
            Last updated: Just now
          </div>

          {/* THE NEW BOARDROOM EXPORT BUTTON */}
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

      {/* Modular Rows */}
      <KPIRow data={data} />
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
    </motion.div>
  );
}
