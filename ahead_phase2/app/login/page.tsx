"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [next, setNext] = useState("/results");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(params.get("next") || "/results");
  }, []);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      setStatus("Check your email — your Ahead sign-in link is on its way.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shell">
      <nav className="nav"><Link href="/" className="brand">Ahead<span className="dot">.</span></Link><div className="nav-right">Save your plan</div></nav>
      <main className="assessment-wrap narrow">
        <div className="question-card">
          <div className="eyebrow">Save your plan</div>
          <h1>Keep your progress.</h1>
          <p className="lead">Enter your email and we’ll send you a secure sign-in link. No password needed.</p>
          <form onSubmit={submit}>
            <div className="field"><label>Email</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
            <button className="primary-btn full-btn" disabled={busy}>{busy ? "Sending…" : "Send sign-in link →"}</button>
          </form>
          {status && <div className="status-box">{status}</div>}
        </div>
      </main>
    </div>
  );
}
