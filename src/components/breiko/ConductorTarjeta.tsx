import { LockKeyhole, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { actividadTexto, enlaceContacto, type ConductorVitrina } from "@/lib/vitrina";

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return <div><dt className="text-sm text-nota">{etiqueta}</dt><dd className="mt-1 text-base text-secundario">{children}</dd></div>;
}

export function ConductorTarjeta({ conductor: c, contactar }: { conductor: ConductorVitrina; contactar?: string | undefined }) {
  const [fotoFallida, setFotoFallida] = useState(false);
  const actividad = actividadTexto(c.actividad);
  const href = enlaceContacto(contactar, c.ref);
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-border bg-panel p-6 [overflow-wrap:anywhere]">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gris text-secundario">
          {c.foto && !fotoFallida ? <img src={c.foto} alt="" width={64} height={64} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" onError={() => setFotoFallida(true)} /> : <UserRound className="h-7 w-7" aria-hidden="true" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="select-none text-base font-semibold blur-[6px]">{c.nombre}</span>
            <LockKeyhole className="h-4 w-4 shrink-0 text-nota" aria-hidden="true" />
            <span className="sr-only">Nombre oculto hasta que acepte tu propuesta</span>
          </div>
          {c.nuevo && <span className="mt-2 inline-block text-sm font-semibold text-secundario">Nuevo</span>}
        </div>
      </div>
      <h2 className="mt-6 text-[22px] leading-tight">Conductor con {c.carnes.join(", ")}</h2>
      <p className="mt-4 text-base text-secundario">{c.resumen}</p>
      <dl className="mt-6 grid gap-4">
        <Dato etiqueta="Carnés"><ul className="flex flex-wrap gap-2">{c.carnes.map((carne) => <li key={carne} className="rounded-full border border-border px-3 py-1 text-sm font-semibold">{carne}</li>)}</ul></Dato>
        <Dato etiqueta="Experiencia">{c.anios_experiencia} {c.anios_experiencia === 1 ? "año" : "años"}{c.experiencia.length ? ` · ${c.experiencia.join(", ")}` : ""}</Dato>
        <Dato etiqueta="Certificados en vigor">{c.certificados.join(", ") || "No indicado"}</Dato>
        <Dato etiqueta="Rutas que acepta">{c.rutas.join(" · ") || "No indicado"}</Dato>
        <Dato etiqueta="Noches fuera">{c.noches_fuera || "No indicado"}</Dato>
        {c.especialidades.length > 0 && <Dato etiqueta="Le interesa">{c.especialidades.join(", ")}</Dato>}
        <Dato etiqueta="Vive en">{c.provincia}{c.tambien_en.length > 0 ? `; también trabajaría en ${c.tambien_en.join(", ")}` : ""}</Dato>
        <Dato etiqueta="Puede empezar">{c.incorporacion || "No indicado"}</Dato>
      </dl>
      {actividad && <p className="mt-6 border-t border-border pt-4 text-base font-semibold">{actividad}</p>}
      <div className="mt-auto pt-6">
        {href ? <Button asChild className="pill pill-primary w-full"><a href={href}>Contactar</a></Button> : <Button disabled className="pill pill-primary w-full">Contactar</Button>}
      </div>
    </article>
  );
}