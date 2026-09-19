import { useState, useEffect } from "react";
import { apiClient } from "../api/client";

export interface FeaturedCoupon {
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount: number | null;
}

interface UseFeaturedCouponsReturn {
  coupons: FeaturedCoupon[];
  isLoading: boolean;
  error: string | null;
}

export function useFeaturedCoupons(): UseFeaturedCouponsReturn {
  const [coupons, setCoupons] = useState<FeaturedCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchFeaturedCoupons = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<FeaturedCoupon[]>("/api/v1/coupons/active");
        if (!cancelled) {
          setCoupons(response.data || []);
        }
      } catch (err: any) {
        console.error("Failed to fetch featured coupons:", err);
        if (!cancelled) {
          setError(err?.message || "Failed to load coupons");
          setCoupons([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchFeaturedCoupons();
    return () => {
      cancelled = true;
    };
  }, []);

  return { coupons, isLoading, error };
}