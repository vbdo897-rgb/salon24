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
  adminPassword?: string;
};

export type Service = {
  id: string;
  name: string;
  price: number;
  created_at?: string;
};

const defaultSettings: Settings = {
  maxPerDay: 20,
  bookingOpen: true,
  timeSlots: ["12:00", "13:00", "14:00", "15:00"],
  adminPassword: "1234",
};

// ===== Services From Supabase =====
export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, price, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.log("getServices error:", error.message);
    return [];
  }

  return (data || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    price: Number(s.price || 0),
    created_at: s.created_at,
  }));
};

export const addService = async (name: string, price: number) => {
  const { error } = await supabase.from("services").insert([
    {
      name,
      price,
    },
  ]);

  if (error) {
    console.log("addService error:", error.message);
    throw error;
  }
};

export const updateService = async (
  id: string,
  name: string,
  price: number
) => {
  const { error } = await supabase
    .from("services")
    .update({
      name,
      price,
    })
    .eq("id", id);

  if (error) {
    console.log("updateService error:", error.message);
    throw error;
  }
};

export const deleteService = async (id: string) => {
  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) {
    console.log("deleteService error:", error.message);
    throw error;
  }
};

// ===== Settings From Supabase =====
export const getSettings = async (): Promise<Settings> => {
  const { data, error } = await supabase
    .from("settings")
    .select("id, maxPerDay, bookingOpen, timeSlots, adminPassword")
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    console.log("getSettings error:", error.message);
    return defaultSettings;
  }

  if (!data) {
    await saveSettings(defaultSettings);
    return defaultSettings;
  }

  return {
    maxPerDay: data.maxPerDay ?? defaultSettings.maxPerDay,
    bookingOpen: data.bookingOpen ?? defaultSettings.bookingOpen,
    timeSlots: Array.isArray(data.timeSlots)
      ? data.timeSlots
      : defaultSettings.timeSlots,
    adminPassword: data.adminPassword ?? defaultSettings.adminPassword,
  };
};

export const saveSettings = async (settings: Settings) => {
  const { error } = await supabase.from("settings").upsert(
    {
      id: "main",
      maxPerDay: settings.maxPerDay,
      bookingOpen: settings.bookingOpen,
      timeSlots: settings.timeSlots,
      adminPassword: settings.adminPassword ?? "1234",
    },
    { onConflict: "id" }
  );

  if (error) {
    console.log("saveSettings error:", error.message);
    throw error;
  }
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

export const deleteBooking = async (id: string) => {
  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    console.log("deleteBooking error:", error.message);
    throw error;
  }

  return await getBookings();
};

export const deleteBookingsByDate = async (date: string) => {
  const { error } = await supabase.from("bookings").delete().eq("date", date);

  if (error) {
    console.log("deleteBookingsByDate error:", error.message);
    throw error;
  }

  return await getBookings();
};

export const deleteOldBookings = async (today: string) => {
  const { error } = await supabase.from("bookings").delete().lt("date", today);

  if (error) {
    console.log("deleteOldBookings error:", error.message);
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