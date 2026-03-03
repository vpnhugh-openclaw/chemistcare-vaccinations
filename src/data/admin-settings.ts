export type AdminSettings = {
  pharmacyName: string;
  pharmacyEmail: string;
  bookingPageSlug: string;
  appointmentNotifications: boolean;
  workingHours: {
    day: string;
    open: string;
    close: string;
    closed: boolean;
  }[];
  slotIntervalMinutes: number;
  bookingLeadTimeHours: number;
  bookingWindowDays: number;
};

export const defaultAdminSettings: AdminSettings = {
  pharmacyName: "ChemistCare Pharmacy",
  pharmacyEmail: "pharmacy@example.com.au",
  bookingPageSlug: "my-pharmacy",
  appointmentNotifications: true,
  slotIntervalMinutes: 15,
  bookingLeadTimeHours: 2,
  bookingWindowDays: 28,
  workingHours: [
    { day: "Monday", open: "08:30", close: "18:00", closed: false },
    { day: "Tuesday", open: "08:30", close: "18:00", closed: false },
    { day: "Wednesday", open: "08:30", close: "18:00", closed: false },
    { day: "Thursday", open: "08:30", close: "18:00", closed: false },
    { day: "Friday", open: "08:30", close: "17:00", closed: false },
    { day: "Saturday", open: "09:00", close: "13:00", closed: false },
    { day: "Sunday", open: "09:00", close: "13:00", closed: true },
  ],
};
