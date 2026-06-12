import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Lock, Mail, Key } from "lucide-react";

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Account created successfully! You are now logged in");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#00F5FF]/10 rounded-xl flex items-center justify-center mb-4">
            <Lock className="text-[#00F5FF]" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-[#F0F4FF]">
            {isLogin ? "Welcome back" : "Create your vault"}
          </h2>
          <p className="text-[#8B95A8] text-sm mt-2">
            Enterprise analytics for Shopify merchants
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-[#8B95A8] uppercase">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3 text-[#4A5260]"
                size={16}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0F1117] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-[#F0F4FF] focus:outline-none focus:border-[#00F5FF]/50 transition-colors"
                placeholder="founder@startup.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-[#8B95A8] uppercase">
              Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 text-[#4A5260]" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F1117] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-[#F0F4FF] focus:outline-none focus:border-[#00F5FF]/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00F5FF] text-[#0A0C10] font-bold py-3 rounded-xl hover:bg-[#00D1DB] transition-colors disabled:opacity-50"
          >
            {loading ? "Authenticating..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-[#8B95A8] hover:text-[#F0F4FF] transition-colors"
          >
            {isLogin
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
