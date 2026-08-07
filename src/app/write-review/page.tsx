"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star, CheckCircle2, AlertCircle } from "lucide-react";
import { useReviews } from "@/context/ReviewsContext";

export default function WriteReviewPage() {
  const router = useRouter();
  const { addReview } = useReviews();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reactionMessages: Record<number, string> = {
    5: "🎉 Amazing! You're officially a CAZERTS VIP now.",
    4: "😄 So glad you loved it! We'll aim for that 5th star next time.",
    3: "🙂 Thanks! We'll work on making it even sweeter.",
    2: "😕 Oh no, we're sorry it wasn't great. We'll do better!",
    1: "😢 We're really sorry! This isn't the CAZERTS experience we want for you.",
  };

  const handleStarClick = (star: number) => {
    setRating(star);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || rating === 0 || !text) return;

    setError("");
    setSubmitting(true);

    try {
      await addReview({ name, rating, text });
      setSubmitted(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch {
      setError("Couldn't submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-20 bg-cream min-h-screen flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-3">
            Thank You For Your Review!
          </h1>
          <p className="text-black/60">
            Redirecting you back to the homepage...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 bg-cream min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-card p-8 md:p-10 w-full max-w-lg"
      >
        <h1 className="text-2xl font-extrabold text-black text-center mb-2">
          Share Your Experience
        </h1>
        <p className="text-black/60 text-sm text-center mb-8">
          We'd love to hear what you think about CAZERTS!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-3">
              Your Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    size={32}
                    className={
                      star <= (hoverRating || rating)
                        ? "fill-gold text-gold"
                        : "fill-black/10 text-black/10"
                    }
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-magenta font-medium mt-3">
                {reactionMessages[rating]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Your Review
            </label>
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Tell us about your experience with CAZERTS..."
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 px-4 py-3 rounded-xl">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={rating === 0 || submitting}
            className="w-full bg-magenta text-white font-semibold px-6 py-3.5 rounded-full hover:bg-magenta-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}