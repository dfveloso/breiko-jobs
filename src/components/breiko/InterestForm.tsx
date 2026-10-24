import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { LINKS, PROVINCIAS } from "@/lib/provincias";
import { StoreButtons } from "./Chrome";

export type Perfil = "conductor" | "empresa";

const schema = z.object({
  perfil: z.enum(["conductor", "empresa"]),
  correo: z.string().trim().toLowerCase().email("Introduce un correo válido").max(255),
  nombre: z.string().trim().max(100).optional(),
  provincia: z.string().max(60).optional(),
  empresa: z.string().trim().max(150).optional(),
  acepta_privacidad: z.literal(true, { errorMap: () => ({ message: "Debes aceptar la política de privacidad" }) }),
  acepta_novedades: z.boolean(),
});

export function InterestForm({ perfil, onPerfil, idPrefix = "f" }: { perfil: Perfil; onPerfil: (p: Perfil) => void; idPrefix?: string }) {
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    if (fd.get("web")) { setDone(true); return; } // honeypot
    const empty = (v: FormDataEntryValue | null) => (v && String(v).trim() ? String(v) : undefined);
    const parsed = schema.safeParse({
      perfil,
      correo: String(fd.get("correo") ?? ""),
      nombre: empty(fd.get("nombre")),
      provincia: empty(fd.get("provincia")),
      empresa: perfil === "empresa" ? empty(fd.get("empresa")) : undefined,
      acepta_privacidad: fd.get("privacidad") === "on",
      acepta_novedades: fd.get("novedades") === "on",
    });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Revisa el formulario"); return; }
    const utm = new URLSearchParams(window.location.search).get("utm_source")?.slice(0, 100) || null;
    const d = parsed.data;
    setSending(true);
    const { error: dbErr } = await supabase.from("interes_jobs").insert({
      perfil: d.perfil, correo: d.correo, nombre: d.nombre ?? null, provincia: d.provincia ?? null,
      empresa: d.empresa ?? null, acepta_privacidad: true, acepta_novedades: d.acepta_novedades, origen: utm,
    });
    setSending(false);
    if (dbErr && dbErr.code !== "23505") { setError("No hemos podido guardar tus datos. Inténtalo de nuevo."); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div role="status" className="p-6 sm:p-8">
        <p className="font-display text-[44px] font-extrabold leading-none [font-stretch:108%] !text-noche">Apuntado.</p>
        <p className="mt-3 text-lg !text-noche">Te avisaremos en cuanto Breiko Jobs esté disponible.</p>
        <p className="mt-6 text-base">Mientras tanto, descarga la app:</p>
        <StoreButtons className="mt-3" variante="oscura" />
      </div>
    );
  }

  const input = "mt-1.5 min-h-12 w-full rounded-[10px] border-[1.5px] border-campo bg-blanco px-3.5 py-2.5 text-base text-noche";
  const label = "text-base font-semibold text-noche";
  const link = "text-noche underline";
  const opt = (p: Perfil, text: string) => (
    <button type="button" role="radio" aria-checked={perfil === p} onClick={() => onPerfil(p)}
      className={`flex-1 px-3 py-5 font-display text-[22px] font-semibold leading-none [font-stretch:108%] transition-colors ${perfil === p ? "bg-noche text-blanco" : "bg-suave text-noche hover:bg-campo"}`}>
      {text}
    </button>
  );

  return (
    <form onSubmit={submit} noValidate>
      <div role="radiogroup" aria-label="Perfil" className="grid grid-cols-2">
        {opt("conductor", "Soy conductor")}
        {opt("empresa", "Soy empresa")}
      </div>
      <div className="space-y-5 p-6 sm:p-8">
      <div>
        <label htmlFor={`${idPrefix}-correo`} className={label}>Correo electrónico (obligatorio)</label>
        <input id={`${idPrefix}-correo`} name="correo" type="email" required maxLength={255} autoComplete="email" className={input} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-nombre`} className={label}>Nombre <span className="font-normal text-gris">(opcional)</span></label>
          <input id={`${idPrefix}-nombre`} name="nombre" maxLength={100} autoComplete="name" className={input} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-provincia`} className={label}>Provincia <span className="font-normal text-gris">(opcional)</span></label>
          <select id={`${idPrefix}-provincia`} name="provincia" defaultValue="" className={input}>
            <option value="">Selecciona…</option>
            {PROVINCIAS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      {perfil === "empresa" && (
        <div>
          <label htmlFor={`${idPrefix}-empresa`} className={label}>Nombre de la empresa <span className="font-normal text-gris">(opcional)</span></label>
          <input id={`${idPrefix}-empresa`} name="empresa" maxLength={150} autoComplete="organization" className={input} />
        </div>
      )}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>No rellenar<input name="web" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label className="flex items-start gap-3 text-base text-noche">
        <input type="checkbox" name="privacidad" required className="mt-1 h-5 w-5 shrink-0 accent-noche" />
        <span>He leído la <a href={LINKS.privacidad} target="_blank" rel="noopener noreferrer" className={link}>política de privacidad</a> (obligatorio)</span>
      </label>
      <label className="flex items-start gap-3 text-base text-noche">
        <input type="checkbox" name="novedades" className="mt-1 h-5 w-5 shrink-0 accent-noche" />
        <span>Quiero recibir novedades de Breiko Breiko por correo</span>
      </label>
      {error && <p role="alert" className="text-base font-semibold !text-destructive">{error}</p>}
      <button type="submit" disabled={sending} className="pill pill-oscura w-full disabled:opacity-60">
        {sending ? "Enviando…" : "Apuntarme"}
      </button>
      <p className="text-base leading-relaxed">
        Responsable: Breiko Breiko Apps, S.L. Usaremos tus datos solo para avisarte del lanzamiento de Breiko Jobs y, si lo marcas, enviarte novedades. Puedes pedir su borrado en <a className={link} href={`mailto:${LINKS.email}`}>{LINKS.email}</a>.
      </p>
      </div>
    </form>
  );
}
