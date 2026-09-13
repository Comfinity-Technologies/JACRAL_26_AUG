import { useState, useEffect, useCallback } from "react";
import { getLandingPage } from "../services/landingPageService";
import type { LandingPageData } from "../types/landingPage";

export function useLandingPage() {
  const [data, setData] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getLandingPage();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load landing page data:", err);
      setError(err?.message || "Failed to load landing page data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
