import type { ReactNode } from "react";
import { nombrePermiso } from "@/lib/empleo";

/** La tarjeta tal como la verá el conductor en «Tu día» de la app. */
export function OfertaTarjeta({
  titulo,
  resumen,
  empresa,
  lugar,
  permisos,
  datos,
  vehiculos = [],
  acciones,
}: {
  titulo: string;
  resumen?: string | undefined;
  empresa?: string;
  lugar?: string;
  permisos: string[];
  datos: string[];
  vehiculos?: string[];
  /** Botones reales en lugar de los de muestra (la demostración de la portada). */
  acciones?: ReactNode;
}) {
  return (
    <article className="oferta-tarjeta" aria-label="Vista previa de la oferta en la app">
      <p className="oferta-tarjeta-aviso">
        <i aria-hidden="true" />
        Nueva oferta para ti
      </p>
      <h3 className="oferta-tarjeta-titulo">{titulo}</h3>
      <p className="oferta-tarjeta-empresa">
        {[empresa || "Tu empresa", lugar].filter(Boolean).join(" · ")}
      </p>
      {resumen ? <p className="oferta-tarjeta-resumen">{resumen}</p> : null}
      {(permisos.length > 0 || vehiculos.length > 0) && (
        <ul className="oferta-tarjeta-chips" aria-label="Requisitos">
          {vehiculos.map((v) => (
            <li key={v}>{v}</li>
          ))}
          {permisos.map((p) => (
            <li key={p}>Permiso {nombrePermiso(p)}</li>
          ))}
        </ul>
      )}
      {datos.length > 0 && (
        <ul className="oferta-tarjeta-datos">
          {datos.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
      {acciones ? (
        <div className="oferta-tarjeta-acciones">{acciones}</div>
      ) : (
        <div className="oferta-tarjeta-acciones" aria-hidden="true">
          <span>No me interesa</span>
          <span className="si">Me interesa</span>
        </div>
      )}
    </article>
  );
}

/** Markdown sencillo de las descripciones: párrafos, **negrita** y viñetas «- ». */
export function TextoOferta({ texto, className = "" }: { texto: string; className?: string }) {
  const bloques = texto.replace(/\r/g, "").split(/\n{2,}/);
  const enLinea = (t: string): ReactNode[] =>
    t
      .split(/(\*\*[^*]+\*\*)/g)
      .map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p,
      );
  return (
    <div className={`texto-oferta ${className}`}>
      {bloques.map((b, i) => {
        const lineas = b.split("\n").filter((l) => l.trim() !== "");
        const titulo =
          lineas[0] && /^\*\*[^*]+\*\*$/.test(lineas[0].trim())
            ? lineas.shift()!.trim().slice(2, -2)
            : null;
        const vinetas = lineas.length > 0 && lineas.every((l) => /^\s*[-•]\s+/.test(l));
        return (
          <section key={i}>
            {titulo ? <h3>{titulo}</h3> : null}
            {vinetas ? (
              <ul>
                {lineas.map((l, k) => (
                  <li key={k}>{enLinea(l.replace(/^\s*[-•]\s+/, ""))}</li>
                ))}
              </ul>
            ) : lineas.length > 0 ? (
              <p>
                {lineas.map((l, k) => (
                  <span key={k}>
                    {k > 0 && <br />}
                    {enLinea(l)}
                  </span>
                ))}
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
