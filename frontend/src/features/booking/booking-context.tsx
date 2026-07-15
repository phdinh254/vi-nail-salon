"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { services } from "@/fixtures/services";

export type BookingState = {
  serviceIds: string[];
  staffId: string | "ANY" | null;
  date: Date | null;
  time: string | null;
  customerName: string;
  customerPhone: string;
  nailDesignId: string | null;
  allergyNote: string;
  requestNote: string;
  otpVerified: boolean;
};

const initialState: BookingState = {
  serviceIds: [],
  staffId: null,
  date: null,
  time: null,
  customerName: "",
  customerPhone: "",
  nailDesignId: null,
  allergyNote: "",
  requestNote: "",
  otpVerified: false,
};

type BookingContextValue = {
  state: BookingState;
  update: <K extends keyof BookingState>(key: K, value: BookingState[K]) => void;
  toggleService: (serviceId: string) => void;
  selectedServices: typeof services;
  totalPrice: number;
  totalDurationMinutes: number;
  reset: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>(initialState);

  function update<K extends keyof BookingState>(key: K, value: BookingState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function toggleService(serviceId: string) {
    setState((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  }

  function reset() {
    setState(initialState);
  }

  const selectedServices = useMemo(
    () => services.filter((service) => state.serviceIds.includes(service.id)),
    [state.serviceIds],
  );
  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.priceFrom, 0),
    [selectedServices],
  );
  const totalDurationMinutes = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.durationMinutes, 0),
    [selectedServices],
  );

  const value = useMemo(
    () => ({ state, update, toggleService, selectedServices, totalPrice, totalDurationMinutes, reset }),
    [state, selectedServices, totalPrice, totalDurationMinutes],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking phải được dùng bên trong BookingProvider");
  return context;
}
