"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn("password", { email, password, flow });
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid rgba(144,208,96,0.25)",
    background: "rgba(144,208,96,0.05)",
    color: "#f0ead8",
    fontFamily: "inherit",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0a0f0a" }}>
      <div style={{ width: "340px", background: "#111811", border: "1px solid rgba(144,208,96,0.2)", borderRadius: "12px", padding: "32px" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "18px", color: "#f0ead8", marginBottom: "4px" }}>
            {flow === "signIn" ? "Sign in" : "Create account"}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(240,234,216,0.4)", letterSpacing: "0.04em" }}>
            to save your progress across devices
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          {error && (
            <div style={{ fontSize: "11px", color: "#ff5a45" }}>{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid rgba(232,170,64,0.5)",
              background: "rgba(232,170,64,0.15)",
              color: "#e8aa40",
              fontFamily: "inherit",
              fontSize: "12px",
              letterSpacing: "0.08em",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "..." : flow === "signIn" ? "sign in" : "create account"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "11px", color: "rgba(240,234,216,0.4)" }}>
          {flow === "signIn" ? "No account? " : "Already have one? "}
          <button
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            style={{ background: "none", border: "none", color: "#e8aa40", fontFamily: "inherit", fontSize: "11px", cursor: "pointer", padding: 0 }}
          >
            {flow === "signIn" ? "sign up" : "sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
