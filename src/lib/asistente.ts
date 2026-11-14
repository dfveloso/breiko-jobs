import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { ENDPOINT_VITRINA, conductorSchema } from "@/lib/vitrina";

const opcionSchema = z.object({ valor: z.string(), texto: z.string(), detalle: z.string().optional() });
const preguntaSchema = z.object({
  clave: z.string(), titulo: z.string(), tipo: z.enum(["una", "varias", "numero"]),
  opciones: z.array(opcionSchema).optional(), depende: z.string().optional(),
  opciones_por: z.record(z.array(opcionSchema)).optional(), solo_si: z.record(z.string()).optional(),
  opcional: z.boolean().optional(), ayuda: z.string().optional(), min: z.number().optional(), max: z.number().optional(),
});
export const respuestasSchema = z.record(z.union([z.string(), z.number(), z.array(z.string()), z.null()]));
const preguntasSchema = z.object({ ok: z.literal(true), preguntas: z.array(preguntaSchema) });
const interpretacionSchema = z.object({ ok: z.literal(true), respuestas: respuestasSchema });
const resultadosSchema = z.object({
  ok: z.literal(true), provincia: z.string(), total: z.number(), contactar: z.string().optional(),
  conductores: z.array(conductorSchema.extend({ afinidad: z.number(), encaja: z.array(z.string()), no_encaja: z.array(z.string()) })),
});
export type PreguntaAsistente = z.infer<typeof preguntaSchema>;
export type RespuestasAsistente = z.infer<typeof respuestasSchema>;
export type ResultadosAsistente = z.infer<typeof resultadosSchema>;
export const MAX_TEXTO = 600;
export const SESSION_ASISTENTE = "bb-jobs-asistente";

export class ErrorAsistente extends Error {
  constructor(message: string, public pocos = false, public provincia?: string) { super(message); }
}

export function preguntasVisibles(preguntas: PreguntaAsistente[], respuestas: RespuestasAsistente) {
  return preguntas.filter((p) => !p.solo_si || Object.entries(p.solo_si).every(([clave, valor]) => String(respuestas[clave]) === valor));
}
export function opcionesPregunta(p: PreguntaAsistente, respuestas: RespuestasAsistente) {
  return p.depende ? p.opciones_por?.[String(respuestas[p.depende])] ?? [] : p.opciones ?? [];
}
export function contestada(p: PreguntaAsistente, respuestas: RespuestasAsistente) {
  const valor = respuestas[p.clave];
  if (valor === undefined || valor === null) return false;
  if (p.tipo === "varias") return Array.isArray(valor) && valor.every((v) => opcionesPregunta(p, respuestas).some((o) => o.valor === v));
  if (p.tipo === "numero") return valor !== "" && Number.isFinite(Number(valor)) && (p.min === undefined || Number(valor) >= p.min) && (p.max === undefined || Number(valor) <= p.max);
  return opcionesPregunta(p, respuestas).some((o) => o.valor === String(valor));
}
export function preguntasPendientes(preguntas: PreguntaAsistente[], respuestas: RespuestasAsistente, omitidas: string[] = []) {
  return preguntasVisibles(preguntas, respuestas).filter((p) => !contestada(p, respuestas) && !omitidas.includes(p.clave));
}
export function construirBusqueda(preguntas: PreguntaAsistente[], respuestas: RespuestasAsistente) {
  const datos: RespuestasAsistente = {};
  for (const p of preguntasVisibles(preguntas, respuestas)) {
    if (!contestada(p, respuestas)) continue;
    const valor = respuestas[p.clave];
    if (valor === undefined || valor === null) continue;
    datos[p.clave] = p.tipo === "numero" || p.clave === "provincia" || p.clave === "experiencia" ? Number(valor) : valor;
  }
  return datos;
}
export function cambiarRespuesta(preguntas: PreguntaAsistente[], respuestas: RespuestasAsistente, clave: string, valor: RespuestasAsistente[string]) {
  const nuevas = { ...respuestas, [clave]: valor };
  for (const p of preguntas) {
    if (p.depende === clave && !contestada(p, nuevas)) delete nuevas[p.clave];
    if (p.solo_si && !Object.entries(p.solo_si).every(([k, v]) => String(nuevas[k]) === v)) delete nuevas[p.clave];
  }
  return nuevas;
}
async function solicitar<S extends z.ZodTypeAny>(accion: string, schema: S, fallback: string, datos?: unknown, signal?: AbortSignal): Promise<z.output<S>> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  const timeout = setTimeout(abort, 20000);
  try {
    const response = await fetch(`${ENDPOINT_VITRINA}?accion=${accion}`, {
      method: datos === undefined ? "GET" : "POST", signal: controller.signal,
      ...(datos === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) }),
    });
    let json: unknown;
    try { json = await response.json(); } catch { throw new ErrorAsistente(fallback); }
    const fallo = z.object({ ok: z.literal(false), error: z.string().optional(), pocos: z.boolean().optional(), provincia: z.string().optional() }).safeParse(json);
    if (fallo.success) throw new ErrorAsistente(accion === "asistente" ? fallback : fallo.data.error || fallback, fallo.data.pocos, fallo.data.provincia);
    const parsed = schema.safeParse(json);
    if (!response.ok || !parsed.success) throw new ErrorAsistente(fallback);
    return parsed.data;
  } catch (e) { throw e instanceof ErrorAsistente ? e : new ErrorAsistente(fallback); }
  finally { clearTimeout(timeout); signal?.removeEventListener("abort", abort); }
}
export const obtenerPreguntas = (signal?: AbortSignal) => solicitar("asistente", preguntasSchema, "No hemos podido cargar el asistente", undefined, signal);
export function interpretarTexto(texto: string) {
  if (texto.length > MAX_TEXTO) return Promise.reject(new ErrorAsistente("Escribe como máximo 600 caracteres."));
  return solicitar("interpretar", interpretacionSchema, "No hemos podido leer lo que buscas. Inténtalo de nuevo.", { texto });
}
export const buscarConductores = (respuestas: RespuestasAsistente) => solicitar("buscar", resultadosSchema, "No hemos podido buscar los conductores. Inténtalo de nuevo.", respuestas);
export const asistenteQueryOptions = queryOptions({ queryKey: ["asistente-conductores"], queryFn: ({ signal }) => obtenerPreguntas(signal), retry: false, staleTime: 60000 });

// The commercial model has no per-contact sale; shared with the public guidance.
export const MODELO_CONTACTOS = { gratis: 2, ventaSuelta: false, proDesde: 9, proMin: 1, proMax: 10, devolucionHoras: 72 } as const;