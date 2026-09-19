import { useState, useEffect } from "react";
import { apiClient } from "../api/client";

export interface Deal {
    id: number;
    image_url: string;
    title: string | null;
    subtitle: string | null;
    link_url: string | null;
    display_order: number;
    bg_color?: string | null;
    text_color?: string | null;
}

interface UseDealsReturn {
    deals: Deal[];
    isLoading: boolean;
    error: string | null;
}

export function useDeals(): UseDealsReturn {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchDeals = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiClient.get<Deal[]>("/api/v1/deals/active");
                if (!cancelled) {
                    setDeals(response.data || []);
                }
            } catch (err: any) {
                console.error("Failed to fetch deals:", err);
                if (!cancelled) {
                    setError(err?.message || "Failed to load deals");
                    setDeals([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchDeals();
        return () => {
            cancelled = true;
        };
    }, []);

    return { deals, isLoading, error };
}