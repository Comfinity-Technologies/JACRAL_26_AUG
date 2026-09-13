import { useState, useEffect } from "react";

export interface TopCustomer {
  user_id: number;
  name: string;
  total_orders: number;
  total_spent: string;
  total_items_ordered: number;
}

export function useLeaderboard() {
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await fetch(`${baseUrl}/api/v1/analytics/top-customers`);
        if (response.ok) {
          const data = await response.json();
          setTopCustomers(data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return { topCustomers, isLoading };
}
