import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function MaintenancePage() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100 px-6 text-center">
      <div className="max-w-md">
        <h1 className="font-serif text-4xl md:text-5xl text-pink-900 mb-4">
          We'll be right back
        </h1>
        <p className="text-pink-700/80 text-base md:text-lg leading-relaxed">
          Our site is temporarily down for maintenance. Please check back shortly.
        </p>
        <a
          href="https://wa.me/917857905819"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block text-xs uppercase tracking-[0.2em] text-pink-400 hover:text-pink-600 transition-colors underline-offset-4 hover:underline"
        >
          Solura Cosmetics
        </a>
      </div>
    </div>
  );
}

export function useMaintenanceMode() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();
      if (!active) return;
      setEnabled(Boolean((data?.value as any)?.enabled));
    };
    load();
    const id = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return enabled;
}
