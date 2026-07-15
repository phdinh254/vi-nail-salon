export type StaffShift = {
  day: string;
  time: string;
};

export type Staff = {
  id: string;
  name: string;
  role: string;
  bio: string;
  yearsExperience: number;
  specialties: string[];
  serviceIds: string[];
  isActive: boolean;
  shifts: StaffShift[];
};
