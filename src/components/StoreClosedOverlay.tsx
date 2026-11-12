"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Gift } from "lucide-react";
import { getAllStoreClosures, StoreClosure } from "@/lib/store-closure";
import {
  HOURS_LABEL,
  msUntilOpening,
  resolveStoreState,
} from "@/lib/store-hours";

const STORES = [
  { id: "btm-layout", name: "BTM Layout" },
  { id: "indiranagar", name: "Indiranagar" },
  { id: "koramangala", name: "Koramangala" },
];

type ClosedStore = {
  id: string;
  name: string;
  source: "admin" | "schedule";
  reason: string;
};

const RIBBON_V =
  "linear-gradient(90deg, #c98a14 0%, #f6d366 22%, #fff3b8 50%, #f6d366 78%, #c98a14 100%)";
const RIBBON_H =
  "linear-gradient(180deg, #c98a14 0%, #f6d366 22%, #fff3b8 50%, #f6d366 78%, #c98a14 100%)";

const PAPER_DOTS = {
  backgroundImage:
    "radial-gradient(rgba(255,255,255,0.14) 2.5px, transparent 2.5px), radial-gradient(rgba(255,255,255,0.14) 2.5px, transparent 2.5px)",
  backgroundSize: "36px 36px",
  backgroundPosition: "0 0, 18px 18px",
};

const SPARKLES = [
  { top: "12%", left: "10%", size: 14, delay: 0 },
  { top: "22%", left: "84%", size: 18, delay: 0.6 },
  { top: "48%", left: "6%", size: 12, delay: 1.1 },
  { top: "62%", left: "90%", size: 14, delay: 0.3 },
  { top: "80%", left: "18%", size: 18, delay: 0.9 },
  { top: "88%", left: "76%", size: 12, delay: 1.4 },
  { top: "34%", left: "24%", size: 10, delay: 1.8 },
  { top: "70%", left: "60%", size: 10, delay: 0.2 },
];

function formatCountdown(ms: number): string {
  const totalMin = Math.max(1, Math.ceil(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

function reasonOf(s: ClosedStore): string {
  if (s.source === "admin") return s.reason || "Taking a short break.";
  return "We're outside our opening hours.";
}

function Bow() {
  return (
    <svg
      viewBox="0 0 200 120"
      className="w-40 overflow-visible drop-shadow-xl md:w-52"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bowGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3b8" />
          <stop offset="50%" stopColor="#f6d366" />
          <stop offset="100%" stopColor="#c98a14" />
        </linearGradient>
      </defs>

      {/* tails */}
      <path
        d="M94 68 L56 118 L82 106 L98 118 Z"
        fill="url(#bowGold)"
        stroke="#b57a0f"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M106 68 L144 118 L118 106 L102 118 Z"
        fill="url(#bowGold)"
        stroke="#b57a0f"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* loops */}
      <path
        d="M100 60 C 70 8, 8 0, 14 46 C 18 88, 70 96, 100 60 Z"
        fill="url(#bowGold)"
        stroke="#b57a0f"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M100 60 C 130 8, 192 0, 186 46 C 182 88, 130 96, 100 60 Z"
        fill="url(#bowGold)"
        stroke="#b57a0f"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M100 60 C 78 28, 40 24, 42 46 C 44 68, 78 72, 100 60 Z"
        fill="rgba(181,122,15,0.35)"
      />
      <path
        d="M100 60 C 122 28, 160 24, 158 46 C 156 68, 122 72, 100 60 Z"
        fill="rgba(181,122,15,0.35)"
      />

      {/* knot */}
      <rect
        x="84"
        y="44"
        width="32"
        height="32"
        rx="11"
        fill="url(#bowGold)"
        stroke="#b57a0f"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function StoreClosedOverlay() {
  const [rows, setRows] = useState<StoreClosure[]>([]);
  // null until the page has loaded in the browser, so the server and the
  // browser always render the same thing first.
  const [now, setNow] = useState<Date | null>(null);

  // Check now, then every 15 seconds. The hours are re-checked every time,
  // so the site closes at 12:00 AM and opens at 2:00 PM on its own.
  useEffect(() => {
    let cancelled = false;

    async function check() {
      setNow(new Date());
      try {
        const data = await getAllStoreClosures();
        if (!cancelled) setRows(data);
      } catch {
        // Keep the last known admin settings; the hours still apply.
      }
    }

    check();
    const interval = setInterval(check, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Every closed store right now (closed by the admin or by the hours)
  const closedStores = useMemo<ClosedStore[]>(() => {
    if (!now) return [];

    const list: ClosedStore[] = [];
    for (const store of STORES) {
      const row = rows.find((r) => r.locationId === store.id);
      const state = resolveStoreState(row, now);

      if (state.state === "closed") {
        list.push({
          id: store.id,
          name: store.name,
          source: state.source,
          reason: state.source === "admin" ? state.reason : "",
        });
      }
    }
    return list;
  }, [rows, now]);

  const allClosed = closedStores.length === STORES.length;
  const allBySchedule =
    allClosed && closedStores.every((s) => s.source === "schedule");

  // Show the gift box if the admin closed ANY store, or if every store
  // is closed (for example outside opening hours).
  const adminClosedAny = closedStores.some((s) => s.source === "admin");
  const showGift = adminClosedAny || allClosed;

  // Stop the page behind the gift from scrolling.
  useEffect(() => {
    document.body.style.overflow = showGift ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showGift]);

  // One shared line if every closed store has the same reason; otherwise
  // (or when only some stores are closed) list each store by name.
  const reasons = Array.from(new Set(closedStores.map(reasonOf)));
  const showStoreNames = !allClosed || reasons.length > 1;

  return (
    <AnimatePresence>
      {showGift && (
        <motion.div
          key="gift-closed"
          role="alertdialog"
          aria-label="Store closed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-[100] overflow-y-auto bg-magenta"
        >
          <div className="relative min-h-full overflow-hidden" style={PAPER_DOTS}>
            {/* Sparkles */}
            {SPARKLES.map((s, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.4, 1, 0.4],
                  rotate: [0, 90, 180],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 1.4 + s.delay,
                  ease: "easeInOut",
                }}
                style={{ top: s.top, left: s.left, fontSize: s.size }}
                className="pointer-events-none absolute z-10 text-[#fff3b8]"
              >
                ✦
              </motion.span>
            ))}

            {/* Vertical ribbon */}
            <div className="absolute inset-y-0 left-1/2 z-10 w-16 -translate-x-1/2 md:w-24">
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                style={{ background: RIBBON_V }}
                className="h-full w-full origin-top shadow-lg"
              />
            </div>

            {/* Horizontal ribbon */}
            <div className="absolute inset-x-0 top-14 z-10 h-16 md:h-20">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                style={{ background: RIBBON_H }}
                className="h-full w-full origin-left shadow-lg"
              />
            </div>

            {/* Bow where the ribbons cross */}
            <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex h-16 items-center justify-center md:h-20">
              <motion.div
                initial={{ scale: 0, rotate: -25, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 14,
                  delay: 1.1,
                }}
              >
                <Bow />
              </motion.div>
            </div>

            {/* Hanging gift tag */}
            <div className="relative z-20 flex justify-center px-5 pb-12 pt-[112px] md:pt-[136px]">
              <motion.div
                initial={{ opacity: 0, y: -60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 160,
                  damping: 16,
                  delay: 1.35,
                }}
                className="w-full max-w-md"
              >
                <motion.div
                  animate={{ rotate: [-1.5, 1.5, -1.5] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                  }}
                  style={{ transformOrigin: "top center" }}
                  className="flex flex-col items-center"
                >
                  {/* string */}
                  <div className="h-10 w-0.5 bg-[#f6d366]" />

                  {/* tag */}
                  <div className="relative w-full rounded-3xl border-2 border-[#f6d366] bg-white p-7 text-center shadow-2xl md:p-9">
                    <span className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-[#c98a14] bg-[#fff3b8]" />

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-magenta/10">
                      <Gift size={26} className="text-magenta" />
                    </div>

                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-magenta">
                      CAZERTS
                    </p>

                    <h2 className="mt-2 text-2xl font-extrabold text-black md:text-3xl">
                      We&apos;re closed right now
                    </h2>

                    <p className="mt-2 text-sm text-black/50">
                      Your sweet treat is wrapped up and waiting for you.
                    </p>

                    {/* Why we're closed */}
                    <div className="mt-5 rounded-2xl bg-cream px-5 py-4 text-left">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">
                        Why we&apos;re closed
                      </p>

                      {showStoreNames ? (
                        <ul className="mt-2 space-y-2">
                          {closedStores.map((s) => (
                            <li key={s.id} className="text-sm">
                              <span className="font-bold text-magenta">
                                {s.name}:
                              </span>{" "}
                              <span className="font-semibold text-black">
                                {reasonOf(s)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1.5 text-sm font-semibold text-black">
                          {reasons[0] ?? "Taking a short break."}
                        </p>
                      )}
                    </div>

                    {allBySchedule && now && (
                      <p className="mt-4 text-sm font-bold text-magenta">
                        Opens in {formatCountdown(msUntilOpening(now))}
                      </p>
                    )}

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3">
                      <Clock size={16} className="text-magenta" />
                      <span className="text-sm font-bold text-black">
                        Open daily {HOURS_LABEL}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}