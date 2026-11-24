"use client";

import { Clock, Info } from "lucide-react";
import { HOURS_LABEL } from "@/lib/store-hours";
import { useStoreStatus } from "@/context/StoreStatusContext";

function formatCountdown(ms: number): string {
  const totalMin = Math.max(1, Math.ceil(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

export default function StoreClosedBanner() {
  const { ready, closedStores, anyClosed, orderingDisabled, allBySchedule, msUntilOpen } =
    useStoreStatus();

  if (!ready || !anyClosed) return null;

  const reasons = Array.from(new Set(closedStores.map((s) => s.reason)));
  const showNames = !orderingDisabled || reasons.length > 1;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-xl rounded-2xl border border-red-200 bg-white px-5 py-4 shadow-xl lg:bottom-5"
    >
      <div className="flex items-start gap-3">
        <Info size={18} className="mt-0.5 shrink-0 text-red-500" />
        <div className="min-w-0 text-sm">
          <p className="font-bold text-black">
            {orderingDisabled
              ? "We're closed right now"
              : "Some stores are closed right now"}
          </p>

          {showNames ? (
            <ul className="mt-1 space-y-0.5">
              {closedStores.map((s) => (
                <li key={s.id} className="text-black/60">
                  <span className="font-semibold text-magenta">{s.name}:</span>{" "}
                  {s.reason}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-black/60">{reasons[0]}</p>
          )}

          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-black/45">
            <span className="inline-flex items-center gap-1">
              <Clock size={12} /> Open daily {HOURS_LABEL}
            </span>
            {orderingDisabled && allBySchedule && (
              <span className="font-semibold text-magenta">
                Opens in {formatCountdown(msUntilOpen)}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}