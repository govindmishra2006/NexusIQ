import { Upload } from "lucide-react";
import { useRef } from "react";

interface EmptyStateProps {
  onRunDemo: () => void;
  // NEW: We add a prop to handle the actual file selection
  onFileUpload: (file: File) => void; 
}

export function EmptyState({ onRunDemo, onFileUpload }: EmptyStateProps) {
  // We use a ref to trigger the hidden file input when the glowing box is clicked
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
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
        Drop your Shopify orders export. NexusIQ's math engine detects anomalies, surfaces trends,
        and generates your executive briefing instantly.
      </p>

      {/* HIDDEN FILE INPUT */}
      <input 
        type="file" 
        accept=".csv" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />

      <div
        className="w-full max-w-2xl relative rounded-3xl"
        style={{
          boxShadow: "0 0 40px rgba(0, 245, 255, 0.1), 0 0 80px rgba(124, 58, 237, 0.08)",
        }}
      >
        <div className="bg-gradient-to-r from-[#00F5FF]/40 via-[#7C3AED]/40 to-[#00F5FF]/40 rounded-3xl p-[1px]">
          {/* We trigger the hidden file input when this box is clicked */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#0F1117] rounded-3xl p-12 flex flex-col items-center gap-6 cursor-pointer group transition-all duration-300 hover:bg-[#141820]"
          >
            <Upload
              size={48}
              className="text-[#00F5FF] opacity-70 group-hover:opacity-100 transition-opacity"
            />
            <div className="text-xl font-semibold text-[#F0F4FF] mt-2">
              Drop your Shopify Orders CSV here
            </div>
            <div className="text-sm text-[#8B95A8]">
              or click to browse — we accept .csv files up to 50MB
            </div>
            <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/20">
              CSV Format
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full max-w-2xl my-4">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[#4A5260] text-xs">OR</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      {/* We keep the Demo button for testing */}
      <button
        onClick={onRunDemo}
        className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#00F5FF] to-[#7C3AED] text-[#0A0C10] font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200"
      >
        Run Demo Analysis →
      </button>
      <div className="text-xs text-[#4A5260] mt-3">
        Uses 90-day sample dataset from a Shopify DTC brand
      </div>
    </div>
  );
}