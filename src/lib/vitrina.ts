import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { WS } from "@/lib/empleo";

export const ENDPOINT_VITRINA = `${WS}/jobs_vitrina.php`;

const provinciaSchema = z.object({
  codigo: z.number(), provincia: z.string(), slug: z.string(),
  conductores: z.number(), abierta: z.boolean(),
});
export const conductorSchema = z.object({
  ref: z.string(), nombre: z.string(), foto: z.string().nullable(), resumen: z.string(),
  carnes: z.array(z.string()), anios_experiencia: z.number(), experiencia: z.array(z.string()),
  certificados: z.array(z.string()), rutas: z.array(z.string()), noches_fuera: z.string().nullable(),
  especialidades: z.array(z.string()), provincia: z.string(), tambien_en: z.array(z.string()),
  incorporacion: z.string(), nuevo: z.boolean(),
  actividad: z.object({ viajes: z.number(), km: z.number(), pct_larga: z.number(), dias: z.number() }),
});
const provinciasSchema = z.object({ ok: z.literal(true), minimo: z.number(), provincias: z.array(provinciaSchema) });
const listaSchema = z.object({
  ok: z.literal(true), provincia: z.string(), codigo: z.number(), total: z.number(),
  abierta: z.boolean(), minimo: z.number(), pagina: z.number(), paginas: z.number(),
  contactar: z.string().optional(), conductores: z.array(conductorSchema).default([]),
});
export type ProvinciaVitrina = z.infer<typeof provinciaSchema>;
export type ConductorVitrina = z.infer<typeof conductorSchema>;
export type ListaVitrina = z.infer<typeof listaSchema>;
export type BusquedaVitrina = { provincia?: number | undefined; pagina?: number | undefined };
type Resultado<T> = { ok: true; datos: T } | { ok: false };

export function validarBusquedaVitrina(search: Record<string, unknown>): BusquedaVitrina {
  const provincia = Number(search["provincia"]);
  const pagina = Number(search["pagina"]);
  return {
    provincia: Number.isInteger(provincia) && provincia >= 1 && provincia <= 52 ? provincia : undefined,
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : undefined,
  };
}

export function elegirProvincia(provincias: ProvinciaVitrina[], codigo?: number) {
  return codigo === undefined ? provincias.find((p) => p.abierta) : provincias.find((p) => p.codigo === codigo);
}

async function leer<S extends z.ZodTypeAny>(params: Record<string, string>, schema: S, signal?: AbortSignal): Promise<Resultado<z.output<S>>> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  const timeout = setTimeout(abort, 12000);
  try {
    const response = await fetch(`${ENDPOINT_VITRINA}?${new URLSearchParams(params)}`, { signal: controller.signal });
    if (!response.ok) return { ok: false };
    const parsed = schema.safeParse(await response.json());
    return parsed.success ? { ok: true, datos: parsed.data } : { ok: false };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

export const obtenerProvincias = (signal?: AbortSignal) => leer({ accion: "provincias" }, provinciasSchema, signal);
export const obtenerConductores = (provincia: number, pagina = 1, signal?: AbortSignal) =>
  leer({ accion: "lista", provincia: String(provincia), pagina: String(pagina) }, listaSchema, signal);

export function enlaceContacto(base: string | undefined, ref: string): string | undefined {
  if (!base) return undefined;
  try {
    const url = new URL(base);
    if (url.origin !== new URL(WS).origin || url.protocol !== "https:") return undefined;
    return `${base}&candidato=${encodeURIComponent(ref)}`;
  } catch { return undefined; }
}

export function actividadTexto(actividad: ConductorVitrina["actividad"]): string | undefined {
  if (actividad.viajes <= 0) return undefined;
  const f = (n: number) => new Intl.NumberFormat("es-ES").format(n);
  return `${f(actividad.viajes)} viajes y ${f(actividad.km)} km con Breiko en los últimos ${actividad.dias} días`;
}

export const vitrinaQueryOptions = (search: BusquedaVitrina) => queryOptions({
  queryKey: ["vitrina", search.provincia ?? null, search.pagina ?? 1],
  staleTime: 30000,
  queryFn: async ({ signal }) => {
    const result = await obtenerProvincias(signal);
    if (!result.ok) return { provincias: [], error: true, seleccion: undefined, lista: undefined };
    const provincias = result.datos.provincias;
    const seleccion = elegirProvincia(provincias, search.provincia);
    if (!seleccion?.abierta) return { provincias, seleccion, error: false, lista: undefined };
    const lista = await obtenerConductores(seleccion.codigo, search.pagina ?? 1, signal);
    return { provincias, seleccion, error: !lista.ok, lista: lista.ok ? lista.datos : undefined };
  },
});