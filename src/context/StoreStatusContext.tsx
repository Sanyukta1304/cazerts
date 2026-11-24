"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAllStoreClosures, StoreClosure } from "@/lib/store-closure";
import { msUntilOpening, resolveStoreState } from "@/lib/store-hours";

const STORES = [
  { id: "btm-layout", name: "BTM Layout" },
  { id: "indiranagar", name: "Indiranagar" },
  { id: "koramangala", name: "Koramangala" },
];

export type ClosedStore = {
  id: string;
  name: string;
  source: "admin" | "schedule";
  reason: string;
};

type StoreStatus = {
  ready: boolean;
  closedStores: ClosedStore[];
  anyClosed: boolean;
  /** true when every store is closed: items should be deactivated */
  orderingDisabled: boolean;
  /** true when every closed store is closed only because of the hours */
  allBySchedule: boolean;
  /** ms until the next 2:00 PM opening (0 until ready) */
  msUntilOpen: number;
};

const StoreStatusContext = createContext<StoreStatus>({
  ready: false,
  closedStores: [],
  anyClosed: false,
  orderingDisabled: false,
  allBySchedule: false,
  msUntilOpen: 0,
});

export function StoreStatusProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<StoreClosure[]>([]);
  // null until the browser has loaded, so server and browser render the same first
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      setNow(new Date());
      try {
        const data = await getAllStoreClosures();
        if (!cancelled) setRows(data);
      } catch {
        // keep the last known admin settings; the hours still apply
      }
    }

    check();
    const interval = setInterval(check, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const value = useMemo<StoreStatus>(() => {
    if (!now) {
      return {
        ready: false,
        closedStores: [],
        anyClosed: false,
        orderingDisabled: false,
        allBySchedule: false,
        msUntilOpen: 0,
      };
    }

    const closedStores: ClosedStore[] = [];
    for (const store of STORES) {
      const row = rows.find((r) => r.locationId === store.id);
      const state = resolveStoreState(row, now);
      if (state.state === "closed") {
        closedStores.push({
          id: store.id,
          name: store.name,
          source: state.source,
          reason:
            state.source === "admin"
              ? state.reason || "Taking a short break."
              : "We're outside our opening hours.",
        });
      }
    }

    const allClosed = closedStores.length === STORES.length;

    return {
      ready: true,
      closedStores,
      anyClosed: closedStores.length > 0,
      orderingDisabled: allClosed,
      allBySchedule:
        allClosed && closedStores.every((s) => s.source === "schedule"),
      msUntilOpen: msUntilOpening(now),
    };
  }, [rows, now]);

  return (
    <StoreStatusContext.Provider value={value}>
      {children}
    </StoreStatusContext.Provider>
  );
}

export function useStoreStatus() {
  return useContext(StoreStatusContext);
}