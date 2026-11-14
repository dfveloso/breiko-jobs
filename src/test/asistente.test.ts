import { afterEach, describe, expect, it, vi } from "vitest";
import { buscarConductores, cambiarRespuesta, construirBusqueda, interpretarTexto, MAX_TEXTO, MODELO_CONTACTOS, obtenerPreguntas, opcionesPregunta, preguntasPendientes, preguntasVisibles, type PreguntaAsistente } from "@/lib/asistente";

const preguntas: PreguntaAsistente[] = [
  { clave: "provincia", titulo: "Provincia", tipo: "una", opciones: [{ valor: "15", texto: "A Coruña" }] },
  { clave: "puesto", titulo: "Puesto", tipo: "una", opciones: [{ valor: "camion", texto: "Camión" }, { valor: "autobus", texto: "Autobús" }] },
  { clave: "carnet", titulo: "Carné", tipo: "una", depende: "puesto", opciones_por: { camion: [{ valor: "CE", texto: "C+E" }], autobus: [{ valor: "D", texto: "D" }] } },
  { clave: "especialidad", titulo: "Trabajo", tipo: "una", solo_si: { puesto: "camion" }, opciones: [{ valor: "", texto: "Carga general" }] },
  { clave: "certificados", titulo: "Certificados", tipo: "varias", opciones: [{ valor: "cap", texto: "CAP" }] },
  { clave: "sueldo", titulo: "Sueldo", tipo: "numero", opcional: true, min: 800, max: 6000 },
];
afterEach(() => vi.unstubAllGlobals());
describe("Asistente de conductores", () => {
  it("salta solo_si cuando el puesto es autobús", () => { expect(preguntasVisibles(preguntas, { puesto: "autobus" }).map((p) => p.clave)).not.toContain("especialidad"); });
  it("salta las respuestas de IA, conservando los null pendientes", () => { expect(preguntasPendientes(preguntas, { provincia: 15, puesto: "camion", carnet: "CE", especialidad: null, certificados: ["cap"], sueldo: 2500 }).map((p) => p.clave)).toEqual(["especialidad"]); });
  it("elige opciones por depende y limpia el carné al cambiar de puesto", () => {
    const carnet = preguntas[2]; if (!carnet) throw new Error("Pregunta ausente");
    expect(opcionesPregunta(carnet, { puesto: "autobus" })).toEqual([{ valor: "D", texto: "D" }]);
    expect(cambiarRespuesta(preguntas, { puesto: "camion", carnet: "CE", especialidad: "" }, "puesto", "autobus")).toEqual({ puesto: "autobus" });
  });
  it("omite null y preguntas ocultas; conserva carga general vacía y certificados vacíos", () => {
    expect(construirBusqueda(preguntas, { provincia: "15", puesto: "camion", carnet: "CE", especialidad: "", certificados: [], sueldo: null, desconocida: "x" })).toEqual({ provincia: 15, puesto: "camion", carnet: "CE", especialidad: "", certificados: [] });
    expect(construirBusqueda(preguntas, { puesto: "autobus", especialidad: "", sueldo: 700 })).toEqual({ puesto: "autobus" });
  });
  it("permite omitir el sueldo explícitamente", () => { expect(preguntasPendientes(preguntas, { provincia: 15, puesto: "autobus", carnet: "D", certificados: [] }, ["sueldo"])).toEqual([]); });
  it("limita el texto a 600 caracteres sin enviar una petición", async () => { const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher); expect(MAX_TEXTO).toBe(600); await expect(interpretarTexto("x".repeat(601))).rejects.toThrow("600"); expect(fetcher).not.toHaveBeenCalled(); });
  it("tolera HTML 404", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>404</html>", { status: 404 }))); await expect(obtenerPreguntas()).rejects.toThrow("No hemos podido cargar el asistente"); });
  it("muestra el error JSON 422 y 429", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ ok: false, error: "No se entiende el puesto" }), { status: 422 })).mockResolvedValueOnce(new Response(JSON.stringify({ ok: false, error: "Sin cupo hoy" }), { status: 429 }))); await expect(interpretarTexto("texto")).rejects.toThrow("No se entiende el puesto"); await expect(interpretarTexto("texto")).rejects.toThrow("Sin cupo hoy"); });
  it("maneja fallo de red", async () => { vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network"))); await expect(buscarConductores({})).rejects.toThrow("No hemos podido buscar los conductores"); });
  it("conserva pocos y provincia en errores 404", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false, pocos: true, provincia: "A Coruña" }), { status: 404 }))); await expect(buscarConductores({ provincia: 15 })).rejects.toMatchObject({ pocos: true, provincia: "A Coruña" }); });
  it("envía el JSON de búsqueda sin reordenar perfiles", async () => { const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, provincia: "A Coruña", total: 0, conductores: [] }))); vi.stubGlobal("fetch", fetcher); await buscarConductores({ provincia: 15, puesto: "camion" }); expect(fetcher.mock.calls[0]?.[1]?.body).toBe('{"provincia":15,"puesto":"camion"}'); });
});
describe("Modelo de contactos", () => {
  it("da 2 contactos al crear la cuenta", () => expect(MODELO_CONTACTOS.gratis).toBe(2));
  it("no vende contactos sueltos", () => expect(MODELO_CONTACTOS.ventaSuelta).toBe(false));
  it("incluye de 1 a 10 contactos mensuales con PRO desde 9 euros", () => expect([MODELO_CONTACTOS.proMin, MODELO_CONTACTOS.proMax, MODELO_CONTACTOS.proDesde]).toEqual([1, 10, 9]));
  it("devuelve el contacto si no responde en 72 horas", () => expect(MODELO_CONTACTOS.devolucionHoras).toBe(72));
});