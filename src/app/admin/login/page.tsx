"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(false);
    const form = new FormData(event.currentTarget);
    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    const response = await fetch("/api/admin/login", { method: "POST", body: JSON.stringify({ email: form.get("email"), password: form.get("password"), callbackUrl }), headers: { "content-type": "application/json" } });
    if (!response.ok) { setError(true); setLoading(false); return; }
    router.replace((await response.json()).url ?? "/admin");
    router.refresh();
  }
  return <main className="admin-login"><form className="admin-card" onSubmit={submit}><h1>Admin sign in</h1><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{error ? <p role="alert">Unable to sign in. Check your credentials and try again.</p> : null}<button className="admin-button" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button></form></main>;
}
