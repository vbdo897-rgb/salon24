"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useAdminRole() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user?.email) {
        setRole("");
        setLoading(false);
        return;
      }

      const { data: adminData } = await supabase
        .from("admins")
        .select("role")
        .eq("email", data.user.email)
        .single();

      setRole(adminData?.role || "staff");

      setLoading(false);
    };

    loadRole();
  }, []);

  return {
    role,
    loading,
  };
}