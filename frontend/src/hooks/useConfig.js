import { useEffect, useState, useCallback } from "react";

export function useConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/config", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load /api/config (status ${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setConfig(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveConfig = useCallback(async (nextConfig) => {
    const res = await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextConfig)
    });
    if (!res.ok) throw new Error("Could not save config");
    setConfig(nextConfig);
  }, []);

  return { config, loading, error, saveConfig };
}
