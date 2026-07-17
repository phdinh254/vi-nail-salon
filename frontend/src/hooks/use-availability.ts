"use client";

import { useEffect, useRef, useState } from "react";
import { getAvailability } from "@/services/availability.service";
import type { AvailabilitySlot } from "@/types/availability";
import { ApiError } from "@/lib/api-client";

/**
 * Fetches real availability slots for one local calendar date. Re-fetches whenever date,
 * serviceIds, or staffId change; a request-sequence ref discards any response that arrives
 * after a newer request has already been fired, so a rapid date change can never let a stale
 * response clobber the current selection.
 */
export function useAvailability(params: {
  date: Date | null;
  serviceIds: string[];
  staffId?: string | null;
}): { slots: AvailabilitySlot[]; isLoading: boolean; error: string | null } {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const dateKey = params.date ? params.date.toDateString() : null;
  const serviceIdsKey = params.serviceIds.join(",");
  const hasQuery = Boolean(params.date) && params.serviceIds.length > 0;

  useEffect(() => {
    // Nothing to fetch — this isn't a fetch failure, just an incomplete selection, so leave
    // `slots` as whatever it already was rather than forcing a synchronous reset here; the
    // returned value below already masks it to [] whenever `hasQuery` is false.
    if (!params.date || params.serviceIds.length === 0) return;
    const date = params.date;
    const serviceIds = params.serviceIds;
    const staffId = params.staffId;

    async function run() {
      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setError(null);
      try {
        const res = await getAvailability({ date, serviceIds, staffId });
        if (requestIdRef.current !== requestId) return;
        setSlots(res.slots);
      } catch (err) {
        if (requestIdRef.current !== requestId) return;
        setError(err instanceof ApiError ? err.message : "Không thể tải khung giờ trống.");
        setSlots([]);
      } finally {
        if (requestIdRef.current === requestId) setIsLoading(false);
      }
    }
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey, serviceIdsKey, params.staffId]);

  return { slots: hasQuery ? slots : [], isLoading, error: hasQuery ? error : null };
}
