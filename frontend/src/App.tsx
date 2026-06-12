import { useState } from "react";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavBar } from "./components/NavBar";
import { EmptyState } from "./components/EmptyState";
import { LoadingState } from "./components/LoadingState";
import { Dashboard } from "./components/Dashboard";
import { supabase } from "./lib/supabase";
import { Auth } from "./components/Auth";

type AppState = "empty" | "loading" | "dashboard";

export default function App() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [appState, setAppState] = useState<AppState>("empty");
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

  if (!session) {
    return <Auth />;
  }


  // We keep the fake demo button for testing UI without a file
  const handleRunDemo = () => {
    setAppState("loading");
    setTimeout(() => setAppState("dashboard"), 3000);
  };

  // THE REAL API PIPELINE
  const handleFileUpload = async (file: File) => {
    setAppState("loading"); // 1. Fire up the Framer Motion spinner

    try {
      // 2. Package the CSV file
      const formData = new FormData();
      formData.append("file", file);

      // 3. Ping the Math Engine (Upload Endpoint)
      const uploadRes = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("File upload failed. Is it a valid Shopify CSV?");
      }

      const uploadData = await uploadRes.json();
      console.log("⚙️ Math Engine Response:", uploadData);

      // 4. Ping the AI Brain (Insight Endpoint)
      const aiRes = await fetch("http://localhost:8000/generate-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      // 5. Combine everything and unlock the dashboard!
      setDashboardData({
        metrics: uploadData.metrics,
        anomalies: uploadData.anomalies,
        charts: uploadData.chart_data,
        aiBrief: aiData,
      });

      setAppState("dashboard");
    } catch (error: any) {
      console.error("Pipeline Error:", error);
      alert(error.message); // If the Gatekeeper rejects it, the user sees why
      setAppState("empty"); // Reset the UI so they can try again
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0C10] font-['Inter',sans-serif] text-[#F0F4FF]">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,245,255,0.07) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10">
        <NavBar />
        <div className="pt-16">
          <div className="max-w-[1400px] mx-auto px-8">
            <AnimatePresence mode="wait">
              {appState === "empty" && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* We pass our new API function into the EmptyState dropzone */}
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
                  {/* Next up: We will pass dashboardData into here! */}
                  <Dashboard data={dashboardData} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
