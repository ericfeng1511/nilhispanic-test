-- Fix: alumni table was created without city_id, but AlumniDashboard.tsx's
-- hometown autocomplete (mirrored from FamilyFriendDashboard.tsx) writes a
-- city_id FK on every save, causing every insert/update to fail with a
-- PostgREST 400 ("column alumni.city_id does not exist").

alter table public.alumni add column city_id integer references public.cities(id);
