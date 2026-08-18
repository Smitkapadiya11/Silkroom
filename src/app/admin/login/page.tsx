"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(false);
    const form = new FormData(event.currentTarget);
    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    const result = await signIn("credentials", {
      username: form.get("username")?.toString() ?? "",
      password: form.get("password")?.toString() ?? "",
      redirect: false,
      callbackUrl: callbackUrl ?? "/admin",
    });
    if (result?.error) {
      setError(true);
      setLoading(false);
      return;
    }
    router.replace(result?.url ?? callbackUrl ?? "/admin");
    router.refresh();
  }

  return (
    <main className="admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <p className="admin-login-kicker">Silk Room operations</p>
        <h1>Sign in to pack, print and dispatch</h1>
        <p className="admin-login-copy">Use the operator username. Sessions last eight hours.</p>
        <label htmlFor="admin-username">
          Username
          <input
            id="admin-username"
            name="username"
            type="text"
            autoComplete="username"
            required
            autoFocus
          />
        </label>
        <label htmlFor="admin-password">
          Password
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {error ? (
          <p role="alert">Unable to sign in. Check the username and password, then try again.</p>
        ) : null}
        <button className="admin-button" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
