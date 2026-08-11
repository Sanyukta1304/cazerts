"use client";

import { supabase } from "@/lib/supabase";

// Store is scheduled to be open 2:00 PM – 11:59 PM every day, IST.
// Kept in sync with cazerts-admin's lib/store-status.ts.
const OPEN_HOUR = 14; // 2:00 PM
const CLOSE_HOUR = 24; // midnight (i.e. up to 11:59:59 PM)
const TIMEZONE = "Asia/Kolkata";

export type StoreStatus = {
  locationId: string;
  isOpen: boolean; // the final answer: can customers order right now?
  withinScheduledHours: boolean;
  manuallyClosed: boolean;
  manuallyOpened: boolean;
};

function getIstHour(): number {
  const istString = new Date().toLocaleString("en-US", { timeZone: TIMEZONE, hour12: false });
  return new Date(istString).getHours();
}

function getIstDateString(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

function isWithinScheduledHours(): boolean {
  const hour = getIstHour();
  return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

export async function getStoreStatus(locationId: string): Promise<StoreStatus> {
  const { data, error } = await supabase
    .from("store_settings")
    .select("manual_closed, manual_closed_date, manual_open, manual_open_date")
    .eq("location_id", locationId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching store status:", error);
    // Fail open on the customer-facing site rather than blocking orders
    // because of a transient read error.
    const withinScheduledHours = isWithinScheduledHours();
    return {
      locationId,
      withinScheduledHours,
      manuallyClosed: false,
      manuallyOpened: false,
      isOpen: withinScheduledHours,
    };
  }

  const today = getIstDateString();
  const manuallyClosed = !!data?.manual_closed && data?.manual_closed_date === today;
  const manuallyOpened = !!data?.manual_open && data?.manual_open_date === today;
  const withinScheduledHours = isWithinScheduledHours();

  return {
    locationId,
    withinScheduledHours,
    manuallyClosed,
    manuallyOpened,
    isOpen: !manuallyClosed && (withinScheduledHours || manuallyOpened),
  };
}