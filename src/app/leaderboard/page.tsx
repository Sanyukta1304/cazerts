"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles, Star, Trophy } from "lucide-react";
import { getLeaderboard, getCustomerRank, LeaderboardEntry, CustomerRank } from "@/lib/orders";
import { useAuth } from "@/context/AuthContext";

const RANK_STYLES = [
  { badge: "bg-yellow-400 text-black", ring: "ring-4 ring-yellow-300" },
  { badge: "bg-gray-300 text-black", ring: "ring-4 ring-gray-200" },
  { badge: "bg-amber-600 text-white", ring: "ring-4 ring-amber-400" },
];

const AVATAR_BG = ["#f5c451", "#7dd3c0", "#f4978e", "#a3c9f9", "#c8b6ff"];

// Crown/count pill — solid, high-contrast (was bg-yellow-400/10 + text-yellow-300, nearly invisible on cream)
const CROWN_PILL =
  "flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-magenta to-pink-500 border border-magenta px-4 py-2 rounded-full shadow-sm";

export default function LeaderboardPage() {
  const { user, isLoggedIn } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<CustomerRank | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const top5 = await getLeaderboard(5);
      setLeaderboard(top5);

      if (isLoggedIn && user?.phone) {
        const rank = await getCustomerRank(user.phone);
        setMyRank(rank);
      }
      setLoading(false);
    }
    load();
  }, [isLoggedIn, user?.phone]);

  const isInTop5 = myRank && myRank.rank <= 5;

  return (
    <div className="pt-28 pb-16 min-h-screen bg-cream text-black relative overflow-hidden">
      {/* Floating decorative icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => {
          const icons = [Crown, Sparkles, Star];
          const Icon = icons[i % icons.length];
          const colors = ["#ec4899", "#f5c451", "#a855f7", "#22d3ee"];
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${(i * 137.5) % 100}%`, bottom: -40 }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -900, opacity: [0, 0.4, 0.4, 0] }}
              transition={{
                duration: 14 + ((i * 3) % 10),
                delay: (i % 7) * 1.3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Icon size={18 + ((i * 7) % 24)} color={colors[i % colors.length]} strokeWidth={1.5} />
            </motion.div>
          );
        })}
      </div>

      <div className="relative max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-magenta uppercase tracking-[0.25em] text-xs font-semibold mb-3">
            All Stores · All Time
          </p>
          <h1 className="font-extrabold text-4xl md:text-6xl tracking-tight bg-gradient-to-r from-magenta via-pink-400 to-gold bg-clip-text text-transparent uppercase italic">
            Crown Leaderboard
          </h1>
          <p className="text-black/50 text-sm mt-3">Top 5 crown earners across CAZERTS</p>
        </div>

        {loading ? (
          <p className="text-center text-black/40">Loading leaderboard...</p>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-3xl p-14 text-center shadow-card">
            <p className="text-black/50">
              No crowns earned yet — first order takes the throne 👑
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, i) => {
              const rankStyle = RANK_STYLES[i] ?? { badge: "bg-white/10 text-white/70", ring: "" };
              const color = AVATAR_BG[i % AVATAR_BG.length];
              const isMe = myRank?.customerId === entry.customerId;

              return (
                <motion.div
                  key={entry.customerId}
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative flex items-center gap-5 rounded-3xl px-6 py-5 shadow-card ${
                    i === 0
                      ? "bg-gradient-to-r from-gold/20 via-magenta/10 to-gold/20 border-2 border-gold/40"
                      : "bg-white"
                  } ${isMe ? "outline outline-2 outline-magenta outline-offset-2" : ""}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-lg ${rankStyle.badge}`}>
                    {i + 1}
                  </div>

                  <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl ${rankStyle.ring}`} style={{ backgroundColor: color }}>
                    🍩
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg truncate flex items-center gap-2">
                      {isMe ? user?.name || entry.name : entry.name}
                      {i === 0 && (
                        <motion.span
                          animate={{ rotate: [0, -8, 8, -8, 0], y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          👑
                        </motion.span>
                      )}
                      {isMe && (
                        <span className="text-magenta text-xs font-bold bg-magenta/10 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-black/50 text-sm">
                      ₹{entry.totalSpent.toLocaleString("en-IN")} spent all-time
                    </p>
                  </div>

                  <div className={CROWN_PILL}>
                    <Crown size={18} className="text-white" />
                    <span className="font-extrabold text-lg text-white">{entry.crowns}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Your position — always shown when logged in and ranked, even if already in the top 5 */}
        {isLoggedIn && myRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex items-center gap-5 rounded-3xl px-6 py-5 bg-magenta/10 border border-magenta/30"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-magenta/20 flex items-center justify-center font-extrabold text-lg text-magenta">
              {myRank.rank}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg flex items-center gap-2">
                <Trophy size={18} className="text-magenta" />
                {isInTop5 ? "You're in the Top 5!" : "Your Rank"}
              </p>
              <p className="text-black/50 text-sm">
                {user?.name} · ₹{myRank.totalSpent.toLocaleString("en-IN")} spent all-time
              </p>
            </div>
            <div className={CROWN_PILL}>
              <Crown size={18} className="text-white" />
              <span className="font-extrabold text-lg text-white">{myRank.crowns}</span>
            </div>
          </motion.div>
        )}

        {isLoggedIn && !myRank && !loading && (
          <p className="text-center text-black/40 text-sm mt-8">
            Place your first order to start earning crowns! 👑
          </p>
        )}
      </div>
    </div>
  );
}