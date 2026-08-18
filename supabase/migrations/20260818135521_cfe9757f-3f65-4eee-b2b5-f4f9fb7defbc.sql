CREATE TABLE public.spin_wheel_spins (
  id uuid primary key default gen_random_uuid(),
  prize_label text not null,
  discount_value numeric not null default 0,
  code text,
  created_at timestamptz not null default now()
);
GRANT SELECT ON public.spin_wheel_spins TO anon, authenticated;
GRANT ALL ON public.spin_wheel_spins TO service_role;
ALTER TABLE public.spin_wheel_spins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Spins are viewable" ON public.spin_wheel_spins FOR SELECT USING (true);
CREATE INDEX idx_spin_wheel_spins_created_at ON public.spin_wheel_spins (created_at DESC);