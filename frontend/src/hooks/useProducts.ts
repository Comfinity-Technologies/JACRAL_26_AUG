import { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import type { Product } from "../types/product";

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ items: Product[] }>("/api/v1/products?limit=100");
      setProducts(response.data.items ?? []);
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      setError(err?.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, isLoading, error, refetch: fetchProducts };
}
