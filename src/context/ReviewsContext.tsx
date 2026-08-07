"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
};

type ReviewsContextType = {
  reviews: Review[];
  addReview: (review: Omit<Review, "id">) => Promise<void>;
};

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    async function loadReviews() {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, name, rating, text")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading reviews:", error);
        return;
      }
      setReviews(data ?? []);
    }
    loadReviews();
  }, []);

  const addReview = async (review: Omit<Review, "id">) => {
    const { data, error } = await supabase
      .from("reviews")
      .insert({ name: review.name, rating: review.rating, text: review.text })
      .select("id, name, rating, text")
      .single();

    if (error) {
      console.error("Error adding review:", error);
      throw error;
    }

    setReviews((prev) => [data, ...prev]);
  };

  return (
    <ReviewsContext.Provider value={{ reviews, addReview }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
}