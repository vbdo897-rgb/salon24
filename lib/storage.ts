import { supabase } from "./supabase";

export type BookingStatus = "waiting" | "completed" | "cancelled";

export type Booking = {
  id: string;
  name: string;
  phone: string;
  service: string;

  date: string;
  time: string;

  queue_number?: number;
  estimated_time?: string;
  barber_number?: number;

  status: BookingStatus;
};

export type Settings = {
  maxPerDay: number;
  bookingOpen: boolean;

  queueDuration: number;
  barbersCount: number;
  workStart: string;
  workEnd: string;

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

  queueDuration: 45,
  barbersCount: 2,

  workStart: "12:00",
  workEnd: "23:00",


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
    .select(`
id,
maxPerDay,
bookingOpen,
adminPassword,
queue_duration,
barbers_count,
work_start,
work_end
`)
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

  queueDuration:
    data.queue_duration ?? defaultSettings.queueDuration,

  barbersCount:
    data.barbers_count ?? defaultSettings.barbersCount,

  workStart:
    data.work_start ?? defaultSettings.workStart,

  workEnd:
    data.work_end ?? defaultSettings.workEnd,


  adminPassword:
    data.adminPassword ?? defaultSettings.adminPassword,
};
};

export const saveSettings = async (settings: Settings) => {
  const { error } = await supabase.from("settings").upsert(
    {
       id: "main",

  maxPerDay: settings.maxPerDay,
  bookingOpen: settings.bookingOpen,

  queue_duration: settings.queueDuration,
  barbers_count: settings.barbersCount,
  work_start: settings.workStart,
  work_end: settings.workEnd,

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


const addMinutes = (
  time: string,
  minutes: number
) => {
  const [h, m] = time.split(":").map(Number);

  const date = new Date();

  date.setHours(h);
  date.setMinutes(m + minutes);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const addBooking = async (
  booking: Omit<Booking, "status" | "id">
) => {

  const settings = await getSettings();

  const { data: todayBookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("date", booking.date)
    .neq("status", "cancelled");

  const count = todayBookings?.length || 0;

  const queueNumber = count + 1;

  const barberNumber =
    ((queueNumber - 1) % settings.barbersCount) + 1;

  const roundIndex =
    Math.floor(
      (queueNumber - 1) / settings.barbersCount
    );

  const estimatedTime = addMinutes(
    settings.workStart,
    roundIndex * settings.queueDuration
  );

  const { error } = await supabase
    .from("bookings")
    .insert([
      {
        name: booking.name,
        phone: booking.phone,
        service: booking.service,

        date: booking.date,
        time: estimatedTime,

        queue_number: queueNumber,
        estimated_time: estimatedTime,
        barber_number: barberNumber,

        status: "waiting",
      },
    ]);

  if (error) {
    console.log(error);
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