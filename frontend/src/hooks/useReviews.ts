import { useState, useEffect } from "react";
import { getPublishedReviews } from "../services/reviewService";
import type { CustomerReview } from "../types/review";

interface UseReviewsReturn {
  reviews: CustomerReview[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReviews(): UseReviewsReturn {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPublishedReviews();
      setReviews(data);
    } catch (err: any) {
      console.error("Failed to fetch reviews:", err);
      setError(err?.message || "Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return { reviews, isLoading, error, refetch: fetchReviews };
}
