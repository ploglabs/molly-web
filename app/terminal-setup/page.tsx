"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TerminalSetupPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, "?"));
    const token = params.get("token");

    if (!token) {
      setError("No token found in URL.");
      return;
    }

    fetch("/api/setup/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          if (data.redirect) {
            router.push(data.redirect);
          }
        } else if (data.redirect) {
          router.push(data.redirect);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to authenticate");
      });
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#090909] text-white font-mono">
      <div className="text-center space-y-4">
        {error ? (
          <div className="text-red-500">
            <p className="text-xl font-bold uppercase mb-2">Error</p>
            <p>{error}</p>
          </div>
        ) : (
          <div>
            <p className="text-xl font-bold uppercase mb-2 animate-pulse">Authenticating...</p>
            <p className="text-zinc-500 text-sm">Please wait while we connect your terminal.</p>
          </div>
        )}
      </div>
    </div>
  );
}
