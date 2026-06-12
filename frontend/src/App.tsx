import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavBar } from "./components/NavBar";
import { EmptyState } from "./components/EmptyState";
import { LoadingState } from "./components/LoadingState";
import { Dashboard } from "./components/Dashboard";
import { StoreDnaSidebar } from "./components/StoreDnaSidebar";
import { Target } from "lucide-react";
import { supabase } from "./lib/supabase";
import { Auth } from "./components/Auth";
import ArchiveTimeline from "./components/ArchiveTimeline";
import { useBriefArchive } from "./store/useBriefArchive";

type AppState = "empty" | "loading" | "dashboard";

export default function App() {
  // 1. ALL HOOKS COHESIVELY INSTANTIATED AT THE TOP LEVEL
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [appState, setAppState] = useState<AppState>("empty");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Destructure the cloud archive actions here at the top level
  const { saveArchive } = useBriefArchive();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. THE SECURITY BOUNCER GATEKEEPER GOES HERE (AFTER ALL HOOKS)
  if (!session) {
    return <Auth />;
  }

  // Fake demo pipeline simulation
  const handleRunDemo = () => {
    setAppState("loading");
    setTimeout(() => setAppState("dashboard"), 3000);
  };

  // THE REAL API PRODUCTION PIPELINE
  const handleFileUpload = async (file: File) => {
    setAppState("loading"); // Fire up the Framer Motion spinner

    try {
      // Package the raw CSV file
      const formData = new FormData();
      formData.append("file", file);

      // Ping the Python Math Engine (Upload Endpoint)
      const uploadRes = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("File upload failed. Is it a valid Shopify CSV?");
      }

      const uploadData = await uploadRes.json();
      console.log("⚙️ Math Engine Response:", uploadData);

      // Ping the AI Brain (Insight Endpoint) with User JWT Cryptographic Token
      const aiRes = await fetch("http://localhost:8000/generate-insight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          filename: uploadData.filename,
          rows: uploadData.rows,
          columns: uploadData.columns,
          numerical_columns: uploadData.numerical_columns,
          categorical_columns: uploadData.categorical_columns,
          total_revenue: uploadData.metrics.total_revenue,
          order_count: uploadData.metrics.order_count,
          avg_order_value: uploadData.metrics.avg_order_value,
          anomaly_count: uploadData.anomalies.count,
          top_anomalous_skus: uploadData.anomalies.top_suspect_skus,
        }),
      });

      if (!aiRes.ok) {
        throw new Error("AI Brain failed to generate the brief.");
      }

      const aiData = await aiRes.json();
      console.log("🧠 AI Brain Response:", aiData);

      // Establish the standard unified data schema layout
      const completeDashboardState = {
        metrics: uploadData.metrics,
        anomalies: uploadData.anomalies,
        charts: uploadData.chart_data || uploadData.charts,
        aiBrief: aiData,
        filename: uploadData.filename,
      };

      // Force UI state update
      setDashboardData(completeDashboardState);
      setAppState("dashboard");

      // Silently persist snapshot to PostgreSQL via Zustand cloud action
      await saveArchive(uploadData.filename, completeDashboardState);
    } catch (error: any) {
      console.error("Pipeline Error:", error);
      alert(error.message);
      setAppState("empty"); // Bounce back to staging area on failure
    }
  };

  // Handler when a user clicks an archive item from the timeline component
  const handleSelectHistoricalBrief = (historicalData: any) => {
    setDashboardData(historicalData);
    setAppState("dashboard");
  };

  return (
    <div className="flex h-screen w-full bg-[#0A0C10] font-['Inter',sans-serif] text-[#F0F4FF] overflow-hidden">
      {/* 1. LEFT RAIL TIMELINE ARCHIVE INTEGRATION */}
      <ArchiveTimeline onSelectBrief={handleSelectHistoricalBrief} />

      {/* 2. THE MAIN DASHBOARD & VIEWPORT LAYER */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10">
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,245,255,0.07) 0%, transparent 70%)",
          }}
        />

        <NavBar />

        {/* DNA Configuration Trigger Row */}
        <div className="pt-24 flex justify-end max-w-[1400px] w-full mx-auto px-8 relative z-10">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center space-x-2 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] backdrop-blur-md px-4 py-2.5 rounded-xl text-[#F0F4FF] transition-all duration-200 group active:scale-95"
          >
            <Target
              size={16}
              className="text-[#00F5FF] group-hover:rotate-12 transition-transform"
            />
            <span className="text-sm font-semibold tracking-wide">
              Configure Store DNA
            </span>
          </button>
        </div>

        {/* Dynamic Display Staging Area */}
        <div className="pt-4 flex-1 pb-12 relative z-10">
          <div className="max-w-[1400px] mx-auto px-8 h-full">
            <AnimatePresence mode="wait">
              {appState === "empty" && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <EmptyState
                    onRunDemo={handleRunDemo}
                    onFileUpload={handleFileUpload}
                  />
                </motion.div>
              )}

              {appState === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center"
                >
                  <LoadingState />
                </motion.div>
              )}

              {appState === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Dashboard data={dashboardData} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 3. CONTROLLER LAYER: STORE DNA SIDEBAR CONTAINER */}
      <StoreDnaSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
