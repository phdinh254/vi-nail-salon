import { UserRole } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
};

export type JwtPayload = {
  sub: string;
  phone: string;
  name: string;
  role: UserRole;
};

export type BookingSessionPayload = {
  purpose: 'BOOKING_SESSION';
  phone: string;
};

export type GuestAppointmentPayload = {
  purpose: 'GUEST_APPOINTMENT';
  appointmentId: string;
};
