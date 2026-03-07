import { useState } from "react";
import { supabase } from "./supabase";
import { generateUsername } from "./utils/username";

export default function Auth({ onLogin }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signUp() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    const username = generateUsername();
    localStorage.setItem("kards_username", username);
    setLoading(false);
    onLogin();
  }

  async function login() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    if (!localStorage.getItem("kards_username")) {
      localStorage.setItem("kards_username", generateUsername());
    }
    setLoading(false);
    onLogin();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
          background-color: #f7f4ef;
          background-image: radial-gradient(circle, rgba(91,143,94,0.18) 1.5px, transparent 1.5px);
          background-size: 28px 28px;
        }

        .auth-root::before, .auth-root::after {
          content: '';
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .auth-root::before {
          width: 500px; height: 500px;
          background: rgba(91,143,94,0.13);
          top: -120px; right: -120px;
        }
        .auth-root::after {
          width: 380px; height: 380px;
          background: rgba(180,155,100,0.10);
          bottom: -80px; left: -80px;
        }

        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          margin: 24px;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 28px;
          padding: 48px 44px 44px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06);
          animation: cardIn 0.5s cubic-bezier(0.34,1.3,0.64,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .auth-logo {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 42px;
          letter-spacing: -0.03em;
          color: #1e1c19;
          margin: 0 0 4px;
          line-height: 1;
        }
        .auth-logo span { color: #5b8f5e; }

        .auth-tagline {
          font-size: 13px;
          color: rgba(30,28,25,0.42);
          font-weight: 300;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0 0 36px;
        }

        .auth-tabs {
          display: flex;
          background: #f0ece5;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 32px;
          gap: 4px;
        }

        .auth-tab {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 9px;
          background: transparent;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(30,28,25,0.45);
          letter-spacing: 0.03em;
          transition: all 0.22s ease;
        }
        .auth-tab.active {
          background: #ffffff;
          color: #1e1c19;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .auth-field { margin-bottom: 16px; }

        .auth-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(30,28,25,0.5);
          margin-bottom: 7px;
        }

        .auth-input {
          width: 100%;
          padding: 13px 16px;
          border: 1px solid rgba(0,0,0,0.09);
          border-radius: 12px;
          background: #faf8f5;
          color: #1e1c19;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 300;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }
        .auth-input:focus {
          border-color: rgba(91,143,94,0.4);
          box-shadow: 0 0 0 3px rgba(91,143,94,0.08);
          background: #ffffff;
        }
        .auth-input::placeholder { color: rgba(30,28,25,0.3); }

        .auth-error {
          font-size: 13px;
          color: #c0513a;
          background: rgba(192,81,58,0.07);
          border: 1px solid rgba(192,81,58,0.15);
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 18px;
          animation: shake 0.3s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-5px); }
          75%      { transform: translateX(5px); }
        }

        .auth-submit {
          width: 100%;
          padding: 14px;
          margin-top: 8px;
          border: none;
          border-radius: 12px;
          background: #5b8f5e;
          color: #ffffff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-sizing: border-box;
        }
        .auth-submit:hover:not(:disabled) {
          background: #4a7a4d;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(91,143,94,0.28);
        }
        .auth-submit:active:not(:disabled) { transform: scale(0.98); }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 12px;
          color: rgba(30,28,25,0.35);
          letter-spacing: 0.04em;
        }
        .auth-footer button {
          background: none;
          border: none;
          color: #5b8f5e;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
      `}</style>

      <div className="auth-root">
        <div className="auth-card">

          <div className="auth-logo">K<span>.</span>ARDS</div>
          <p className="auth-tagline">Your personal card collection</p>

          <div className="auth-tabs">
            <button
              className={"auth-tab" + (mode === "login" ? " active" : "")}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Sign In
            </button>
            <button
              className={"auth-tab" + (mode === "signup" ? " active" : "")}
              onClick={() => { setMode("signup"); setError(""); }}
            >
              Create Account
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (mode === "login" ? login() : signUp())}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (mode === "login" ? login() : signUp())}
            />
          </div>

          <button
            className="auth-submit"
            onClick={mode === "login" ? login : signUp}
            disabled={loading || !email || !password}
          >
            {loading
              ? <><div className="auth-spinner" />{mode === "login" ? "Signing in…" : "Creating account…"}</>
              : mode === "login" ? "Sign In →" : "Create Account →"
            }
          </button>

          <div className="auth-footer">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}