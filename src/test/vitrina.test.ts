import { afterEach, describe, expect, it, vi } from "vitest";
import { actividadTexto, elegirProvincia, enlaceContacto, obtenerConductores, obtenerProvincias, validarBusquedaVitrina, vitrinaQueryOptions } from "@/lib/vitrina";
import { QueryClient } from "@tanstack/react-query";

const provincias = [
  { codigo: 27, provincia: "Lugo", slug: "lugo", conductores: 2, abierta: false },
  { codigo: 15, provincia: "A Coruña", slug: "a-coruna", conductores: 12, abierta: true },
];
afterEach(() => vi.unstubAllGlobals());

describe("Bolsa pública de conductores", () => {
  it("elige la primera provincia abierta, no la primera cerrada", () => {
    expect(elegirProvincia(provincias)?.codigo).toBe(15);
    expect(elegirProvincia(provincias, 27)?.abierta).toBe(false);
  });
  it("conserva el código INE 15 y la página 2 compartidos en la URL", () => {
    expect(validarBusquedaVitrina({ provincia: "15", pagina: "2" })).toEqual({ provincia: 15, pagina: 2 });
    expect(validarBusquedaVitrina({ provincia: "abc", pagina: -1 })).toEqual({ provincia: undefined, pagina: undefined });
  });
  it("añade el candidato al enlace de contacto sin cambiar su fragmento", () => {
    const base = "https://ws.breikobreiko.com/breiko-ws/ws/portal/index.html#empleo?bolsa=provincia-15";
    expect(enlaceContacto(base, "a1b2c3d4e5f60718")).toBe(`${base}&candidato=a1b2c3d4e5f60718`);
    expect(enlaceContacto("javascript:alert(1)", "ref")).toBeUndefined();
  });
  it("solo muestra actividad cuando hay viajes", () => {
    expect(actividadTexto({ viajes: 0, km: 12300, pct_larga: 60, dias: 90 })).toBeUndefined();
    expect(actividadTexto({ viajes: 42, km: 12300, pct_larga: 60, dias: 90 })).toContain("12.300 km");
  });
  it("solicita la provincia 15 y la página 2 al endpoint", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false, error: "No disponible" }), { status: 503 }));
    vi.stubGlobal("fetch", fetcher);
    expect(await obtenerConductores(15, 2)).toEqual({ ok: false });
    expect(fetcher.mock.calls[0]?.[0]).toContain("accion=lista&provincia=15&pagina=2");
  });
  it("no solicita perfiles de provincias cerradas", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, minimo: 3, provincias })));
    vi.stubGlobal("fetch", fetcher);
    const data = await new QueryClient().fetchQuery(vitrinaQueryOptions({ provincia: 27 }));
    expect(data.seleccion?.codigo).toBe(27);
    expect(data.lista).toBeUndefined();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("tolera HTML 404, JSON de error y fallo de red", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response("<html>404</html>", { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: false, error: "No disponible" })))
      .mockRejectedValueOnce(new Error("Network")));
    expect(await obtenerProvincias()).toEqual({ ok: false });
    expect(await obtenerProvincias()).toEqual({ ok: false });
    expect(await obtenerProvincias()).toEqual({ ok: false });
  });
});