CREATE TABLE public.interes_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creado timestamptz NOT NULL DEFAULT now(),
  perfil text NOT NULL CHECK (perfil IN ('conductor','empresa')),
  correo text NOT NULL CHECK (char_length(correo) BETWEEN 5 AND 255 AND correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  nombre text CHECK (nombre IS NULL OR char_length(nombre) <= 100),
  provincia text CHECK (provincia IS NULL OR char_length(provincia) <= 60),
  empresa text CHECK (empresa IS NULL OR char_length(empresa) <= 150),
  acepta_privacidad boolean NOT NULL CHECK (acepta_privacidad = true),
  acepta_novedades boolean NOT NULL DEFAULT false,
  origen text CHECK (origen IS NULL OR char_length(origen) <= 100)
);
CREATE UNIQUE INDEX interes_jobs_correo_perfil_key ON public.interes_jobs (lower(correo), perfil);
GRANT INSERT ON public.interes_jobs TO anon, authenticated;
GRANT ALL ON public.interes_jobs TO service_role;
ALTER TABLE public.interes_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publico puede apuntarse" ON public.interes_jobs FOR INSERT TO anon, authenticated WITH CHECK (acepta_privacidad = true);