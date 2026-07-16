"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { listServices } from "@/services/catalog.service";
import type { Service } from "@/types/service";
import type { Appointment } from "@/types/appointment";

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
  services: Service[];
  servicesLoading: boolean;
  servicesError: string | null;
  selectedServices: Service[];
  totalPrice: number;
  totalDurationMinutes: number;
  createdAppointment: Appointment | null;
  setCreatedAppointment: (appointment: Appointment | null) => void;
  reset: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>(initialState);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const {
    data: servicesData,
    isLoading: servicesLoading,
    error: servicesError,
  } = useApi(listServices, []);
  const services = useMemo(() => servicesData ?? [], [servicesData]);

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
    setCreatedAppointment(null);
  }

  const selectedServices = useMemo(
    () => services.filter((service) => state.serviceIds.includes(service.id)),
    [services, state.serviceIds],
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
    () => ({
      state,
      update,
      toggleService,
      services,
      servicesLoading,
      servicesError,
      selectedServices,
      totalPrice,
      totalDurationMinutes,
      createdAppointment,
      setCreatedAppointment,
      reset,
    }),
    [
      state,
      services,
      servicesLoading,
      servicesError,
      selectedServices,
      totalPrice,
      totalDurationMinutes,
      createdAppointment,
    ],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking phải được dùng bên trong BookingProvider");
  return context;
}
