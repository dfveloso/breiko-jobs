import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Truck, Building2 } from "lucide-react";
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
      <div className="text-center" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-jobs" />
        <p className="mt-4 text-[22px] font-extrabold tracking-tight text-ink-foreground">¡Apuntado! Te avisaremos en cuanto Breiko Jobs esté disponible.</p>
        <p className="mt-6 text-sm text-ink-muted">Mientras tanto, descarga la APP:</p>
        <StoreButtons className="mt-3 justify-center" />
      </div>
    );
  }

  const input = "mt-1.5 w-full rounded-[12px] border border-ink-border bg-ink px-3.5 py-2.5 text-ink-foreground placeholder:text-ink-muted/60 focus:border-jobs focus:outline-none";
  const label = "text-sm font-medium text-ink-foreground";
  const opt = (p: Perfil, Icon: typeof Truck, text: string) => (
    <button type="button" role="radio" aria-checked={perfil === p} onClick={() => onPerfil(p)}
      className={`flex items-center gap-3 rounded-[16px] border p-4 text-left font-semibold transition-colors duration-150 ${perfil === p ? "border-jobs bg-jobs/10 text-ink-foreground" : "border-ink-border text-ink-muted hover:border-ink-muted"}`}>
      <Icon className={`h-6 w-6 ${perfil === p ? "text-jobs" : ""}`} /> {text}
    </button>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div role="radiogroup" aria-label="Perfil" className="grid grid-cols-2 gap-3">
        {opt("conductor", Truck, "Soy conductor")}
        {opt("empresa", Building2, "Soy empresa")}
      </div>
      <div>
        <label htmlFor={`${idPrefix}-correo`} className={label}>Correo electrónico *</label>
        <input id={`${idPrefix}-correo`} name="correo" type="email" required maxLength={255} autoComplete="email" className={input} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-nombre`} className={label}>Nombre <span className="text-ink-muted">(opcional)</span></label>
          <input id={`${idPrefix}-nombre`} name="nombre" maxLength={100} autoComplete="name" className={input} />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-provincia`} className={label}>Provincia <span className="text-ink-muted">(opcional)</span></label>
          <select id={`${idPrefix}-provincia`} name="provincia" defaultValue="" className={input}>
            <option value="">Selecciona…</option>
            {PROVINCIAS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      {perfil === "empresa" && (
        <div>
          <label htmlFor={`${idPrefix}-empresa`} className={label}>Nombre de la empresa <span className="text-ink-muted">(opcional)</span></label>
          <input id={`${idPrefix}-empresa`} name="empresa" maxLength={150} autoComplete="organization" className={input} />
        </div>
      )}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>No rellenar<input name="web" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label className="flex items-start gap-3 text-sm text-ink-muted">
        <input type="checkbox" name="privacidad" required className="mt-0.5 h-4 w-4 accent-jobs" />
        <span>He leído la <a href={LINKS.privacidad} target="_blank" rel="noopener noreferrer" className="text-ink-foreground underline">política de privacidad</a> *</span>
      </label>
      <label className="flex items-start gap-3 text-sm text-ink-muted">
        <input type="checkbox" name="novedades" className="mt-0.5 h-4 w-4 accent-jobs" />
        <span>Quiero recibir novedades de Breiko Breiko por correo</span>
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={sending} className="w-full rounded-[12px] bg-gradient-primary px-5 py-3.5 font-semibold text-primary-foreground shadow-elegant transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-60">
        {sending ? "Enviando…" : "Me interesa"}
      </button>
      <p className="text-xs leading-relaxed text-ink-muted">
        Responsable: Breiko Breiko Apps, S.L. Usaremos tus datos solo para avisarte del lanzamiento de Breiko Jobs y, si lo marcas, enviarte novedades. Puedes pedir su borrado en <a className="underline" href={`mailto:${LINKS.email}`}>{LINKS.email}</a>.
      </p>
    </form>
  );
}
