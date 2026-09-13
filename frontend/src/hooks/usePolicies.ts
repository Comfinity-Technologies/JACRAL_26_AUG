import { useEffect, useState } from "react";
import { apiClient } from "../api/client";

export type Policy = {
  id: number;
  slug: string;
  title: string;
  content: string;
  is_active: boolean;
  updated_at?: string;
};

export function usePolicies() {
  const [policies, setPolicies] = useState<Record<string, Policy>>({});
  const [list, setList] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/api/v1/policies")
      .then((res) => {
        const data: Policy[] = res.data;
        const map: Record<string, Policy> = {};
        data.forEach((p) => (map[p.slug] = p));
        setPolicies(map);
        setList(data);
      })
      .catch((err) => console.error("Failed to load policies", err))
      .finally(() => setLoading(false));
  }, []);

  return { policies, list, loading };
}
