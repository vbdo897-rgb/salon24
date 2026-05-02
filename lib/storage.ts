import { supabase } from "./supabase";

export type BookingStatus = "waiting" | "completed" | "cancelled";

export type Booking = {
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: BookingStatus;
};

export type Settings = {
  maxPerDay: number;
  bookingOpen: boolean;
  timeSlots: string[];
};

const SETTINGS_KEY = "settings";

// ===== Settings =====
export const getSettings = (): Settings => {
  if (typeof window === "undefined") {
    return {
      maxPerDay: 20,
      bookingOpen: true,
      timeSlots: ["12:00", "12:30", "01:00"],
    };
  }

  const data = localStorage.getItem(SETTINGS_KEY);

  return data
    ? JSON.parse(data)
    : {
        maxPerDay: 20,
        bookingOpen: true,
        timeSlots: ["12:00", "12:30", "01:00"],
      };
};

export const saveSettings = (settings: Settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// ===== Bookings From Supabase =====
export const getBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("date", { ascending: false })
    .order("time", { ascending: true });

  if (error) {
    console.log("getBookings error:", error.message);
    return [];
  }

  return data || [];
};

export const addBooking = async (
  booking: Omit<Booking, "status" | "id">
) => {
  const { error } = await supabase.from("bookings").insert([
    {
      name: booking.name,
      phone: booking.phone,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      status: "waiting",
    },
  ]);

  if (error) {
    console.log("addBooking error:", error.message);
    throw error;
  }
};

export const updateBookingStatus = async (
  id: string,
  status: BookingStatus
) => {
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.log("updateBookingStatus error:", error.message);
    throw error;
  }

  return await getBookings();
};

// ===== Check Slot =====
export const isSlotBooked = async (date: string, time: string) => {
  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("date", date)
    .eq("time", time)
    .neq("status", "cancelled");

  if (error) {
    console.log("isSlotBooked error:", error.message);
    return false;
  }

  return (data || []).length > 0;
};