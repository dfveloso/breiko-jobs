import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQueryClient, useQueryErrorResetBoundary, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { SiteHeader, SiteFooter, CookieNotice } from "@/components/breiko/Chrome";
import { ConductorTarjeta } from "@/components/breiko/ConductorTarjeta";
import { ComoContactar } from "@/components/breiko/ComoContactar";
import { Button } from "@/components/ui/button";
import { asistenteQueryOptions, buscarConductores, cambiarRespuesta, construirBusqueda, contestada, ErrorAsistente, interpretarTexto, MAX_TEXTO, opcionesPregunta, preguntasPendientes, preguntasVisibles, respuestasSchema, SESSION_ASISTENTE, type RespuestasAsistente, type ResultadosAsistente } from "@/lib/asistente";

const TITLE = "Te buscamos conductor · Breiko Jobs";
const DESC = "Cuéntanos qué conductor necesita tu empresa y encuentra perfiles de camión y autobús ordenados por afinidad con tu puesto.";
export const Route = createFileRoute("/conductores/asistente")({
  loader: ({ context }) => context.queryClient.ensureQueryData(asistenteQueryOptions),
  pendingMs: 150,
  pendingComponent: Pendiente,
  errorComponent: Fallo,
  notFoundComponent: Fallo,
  head: () => ({ meta: [
    { title: TITLE }, { name: "description", content: DESC },
    { property: "og:title", content: TITLE }, { property: "og:description", content: DESC },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex, follow" },
  ], links: [{ rel: "canonical", href: "https://jobs.breikobreiko.com/conductores/asistente" }] }),
  component: Asistente,
});

function Marco({ children, resultados = false }: { children: ReactNode; resultados?: boolean }) {
  return <div className="min-h-screen bg-noche"><SiteHeader />
    <main id="contenido" className={resultados ? "mx-auto max-w-[1440px] px-[clamp(16px,4vw,56px)] pt-[120px] pb-[calc(96px+var(--cookie-reserve))]" : "asistente asistente-una !pb-[calc(96px+var(--cookie-reserve))]"}>{children}</main>
    <SiteFooter /><CookieNotice /></div>;
}
function Pendiente() { return <Marco><section className="asistente-pregunta" role="status" aria-label="Cargando asistente"><h1 className="asistente-h1">Te buscamos conductor</h1><div className="redactando mt-10" aria-hidden="true"><span /><span /><span /></div></section></Marco>; }
function Fallo() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { reset } = useQueryErrorResetBoundary();
  return <Marco><section className="asistente-pregunta" role="alert"><h1 className="asistente-h1">No hemos podido cargar el asistente</h1><div className="mt-8 flex flex-wrap gap-3"><Button className="pill pill-primary" onClick={async () => { reset(); await queryClient.resetQueries({ queryKey: asistenteQueryOptions.queryKey }); await router.invalidate(); }}><RefreshCw aria-hidden="true" />Reintentar</Button><Button asChild className="pill pill-secondary"><Link to="/conductores">Ver conductores disponibles</Link></Button></div></section></Marco>;
}

type Vista = "inicio" | "pregunta" | "resumen" | "resultados";
function Asistente() {
  const { data } = useSuspenseQuery(asistenteQueryOptions);
  const preguntas = data.preguntas;
  const [respuestas, setRespuestas] = useState<RespuestasAsistente>({});
  const [omitidas, setOmitidas] = useState<string[]>([]);
  const [vista, setVista] = useState<Vista>("inicio");
  const [clave, setClave] = useState("");
  const [editar, setEditar] = useState(false);
  const [texto, setTexto] = useState("");
  const [ocupado, setOcupado] = useState<"" | "leyendo" | "buscando">("");
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<ResultadosAsistente>();
  const [restaurado, setRestaurado] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const visibles = preguntasVisibles(preguntas, respuestas);
  const pregunta = visibles.find((p) => p.clave === clave);
  const indice = visibles.findIndex((p) => p.clave === clave);
  const provincia = preguntas.find((p) => p.clave === "provincia");
  const sinProvincias = provincia && opcionesPregunta(provincia, respuestas).length === 0;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_ASISTENTE);
      if (raw) {
        const saved = JSON.parse(raw);
        const parsed = respuestasSchema.safeParse(saved.respuestas);
        if (parsed.success) {
          setRespuestas(parsed.data);
          setOmitidas(Array.isArray(saved.omitidas) ? saved.omitidas.filter((v: unknown) => typeof v === "string") : []);
          const primera = preguntasPendientes(preguntas, parsed.data, saved.omitidas ?? [])[0];
          if (saved.vista === "pregunta" && preguntasVisibles(preguntas, parsed.data).some((p) => p.clave === saved.clave)) { setClave(saved.clave); setVista("pregunta"); }
          else if (saved.vista !== "inicio") { setClave(primera?.clave ?? ""); setVista(primera ? "pregunta" : "resumen"); }
        }
      }
    } catch { /* Storage may be unavailable. */ }
    setRestaurado(true);
  }, [preguntas]);
  useEffect(() => {
    if (!restaurado) return;
    try { sessionStorage.setItem(SESSION_ASISTENTE, JSON.stringify({ respuestas, omitidas, vista, clave })); } catch { /* Keep the flow usable without storage. */ }
  }, [respuestas, omitidas, vista, clave, restaurado]);
  useEffect(() => {
    titulo.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [vista, clave, ocupado]);

  function empezar() { setError(""); setEditar(false); setClave(visibles[0]?.clave ?? ""); setVista(visibles.length ? "pregunta" : "resumen"); }
  function avanzar(nuevas = respuestas, saltos = omitidas) {
    setError("");
    const orden = preguntasVisibles(preguntas, nuevas);
    const pendientes = preguntasPendientes(preguntas, nuevas, saltos);
    const actual = orden.findIndex((p) => p.clave === clave);
    const siguiente = pendientes.find((p) => orden.indexOf(p) > actual) ?? pendientes[0];
    if (editar) { setEditar(false); setVista("resumen"); }
    else if (siguiente) { setClave(siguiente.clave); setVista("pregunta"); }
    else setVista("resumen");
  }
  function elegir(valor: RespuestasAsistente[string]) {
    if (!pregunta || ocupado) return;
    const nuevas = cambiarRespuesta(preguntas, respuestas, pregunta.clave, valor);
    setRespuestas(nuevas);
    const saltos = omitidas.filter((k) => k !== pregunta.clave);
    setOmitidas(saltos);
    if (pregunta.tipo === "una") avanzar(nuevas, saltos);
  }
  function siguiente() {
    if (!pregunta) return;
    if (pregunta.tipo === "varias" && respuestas[pregunta.clave] === undefined) { const nuevas = { ...respuestas, [pregunta.clave]: [] }; setRespuestas(nuevas); avanzar(nuevas); }
    else if (contestada(pregunta, respuestas)) avanzar();
    else setError(pregunta.tipo === "numero" ? `Introduce un número${pregunta.min !== undefined ? ` entre ${pregunta.min} y ${pregunta.max}` : " válido"}.` : "Elige una opción para seguir.");
  }
  function saltar() {
    if (!pregunta) return;
    const nuevas = { ...respuestas }; delete nuevas[pregunta.clave];
    const saltos = [...omitidas, pregunta.clave]; setRespuestas(nuevas); setOmitidas(saltos); avanzar(nuevas, saltos);
  }
  async function interpretar() {
    if (!texto.trim() || ocupado) return;
    setError(""); setOcupado("leyendo");
    try {
      const data = await interpretarTexto(texto.trim());
      const nuevas = construirBusqueda(preguntas, data.respuestas);
      setRespuestas(nuevas); setOmitidas([]); setEditar(false);
      const pendiente = preguntasPendientes(preguntas, nuevas)[0];
      setClave(pendiente?.clave ?? ""); setVista(pendiente ? "pregunta" : "resumen");
    } catch (e) { empezar(); setError(e instanceof Error ? e.message : "No hemos podido leer lo que buscas."); }
    finally { setOcupado(""); }
  }
  async function buscar() {
    const pendientes = preguntasPendientes(preguntas, respuestas, omitidas);
    if (pendientes[0]) { setEditar(false); setClave(pendientes[0].clave); setVista("pregunta"); setError("Completa esta respuesta antes de buscar."); return; }
    setOcupado("buscando"); setError("");
    try { setResultado(await buscarConductores(construirBusqueda(preguntas, respuestas))); setVista("resultados"); }
    catch (e) {
      const nombreProvincia = provincia ? opcionesPregunta(provincia, respuestas).find((o) => o.valor === String(respuestas["provincia"]))?.texto : undefined;
      setError(e instanceof ErrorAsistente && e.pocos ? `Todavía hay pocos conductores en ${e.provincia ?? nombreProvincia ?? "esta provincia"}. Vuelve pronto` : e instanceof Error ? e.message : "No hemos podido buscar los conductores.");
    } finally { setOcupado(""); }
  }
  const aviso = error && <p className="campo-error mt-6" role="alert">{error}</p>;
  if (sinProvincias) return <Marco><section className="asistente-pregunta"><h1 ref={titulo} tabIndex={-1} className="asistente-h1">Te buscamos conductor</h1><p className="asistente-sub" role="status">Todavía no hay provincias con conductores suficientes. Vuelve pronto</p><Button asChild className="pill pill-primary mt-8"><Link to="/conductores">Ver conductores disponibles</Link></Button></section></Marco>;
  if (vista === "resultados" && resultado) return <Marco resultados><section aria-live="polite" aria-label="Resultados de la búsqueda">
    <h1 ref={titulo} tabIndex={-1} className="asistente-h1 max-w-4xl">{resultado.total ? `${resultado.total} ${resultado.total === 1 ? "conductor" : "conductores"} para tu puesto en ${resultado.provincia}` : "Ningún conductor encaja todavía"}</h1>
    <div className="mt-8 flex flex-wrap gap-3"><Button className="pill pill-primary" onClick={() => setVista("resumen")}>Cambiar respuestas</Button><Button asChild className="pill pill-secondary"><Link to="/conductores" search={{ provincia: Number(respuestas["provincia"]), pagina: undefined }}>Ver todos los de {resultado.provincia}</Link></Button></div>
    <div className="mt-10 grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">{resultado.conductores.map((c) => <ConductorTarjeta key={c.ref} conductor={c} contactar={resultado.contactar} afinidad={c} />)}</div>
    <ComoContactar />
  </section></Marco>;
  return <Marco><section className="asistente-pregunta" aria-busy={ocupado !== ""}>
    {ocupado ? <><h1 ref={titulo} tabIndex={-1} className="asistente-h1" role="status">{ocupado === "leyendo" ? "Leyendo lo que buscas…" : "Buscando conductores…"}</h1><div className="redactando mt-10" aria-hidden="true"><span /><span /><span /></div></> : vista === "inicio" ? <>
      <h1 ref={titulo} tabIndex={-1} className="asistente-h1">Te buscamos conductor</h1>
      <p className="asistente-sub">Cuéntanos qué necesitas y te enseñamos los conductores que mejor encajan, ordenados por afinidad.</p>
      <form className="asistente-controles" onSubmit={(e) => { e.preventDefault(); void interpretar(); }}>
        <div className="campo-bloque"><label htmlFor="necesidad" className="campo-etiqueta">Descríbelo con tus palabras</label><textarea id="necesidad" className="campo campo-area" maxLength={MAX_TEXTO} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ej.: Busco conductor de tráiler para frigorífico en Vigo, fuera entre semana, con CAP, 2.400 € al mes" aria-describedby="texto-contador texto-ia" /><p id="texto-contador" className="text-right text-sm text-nota tabular-nums">{texto.length} / {MAX_TEXTO}</p></div>
        <div className="flex flex-wrap gap-3"><Button type="submit" disabled={!texto.trim()} className="pill pill-primary whitespace-normal">Buscar con estas palabras</Button><Button type="button" className="pill pill-secondary whitespace-normal" onClick={empezar}>Prefiero contestar preguntas</Button></div>
      </form><p id="texto-ia" className="asistente-nota">Lo que escribas lo lee una IA solo para rellenar las preguntas. No escribas datos personales.</p>{aviso}
    </> : vista === "resumen" ? <>
      <h1 ref={titulo} tabIndex={-1} className="asistente-h1">Esto es lo que buscas</h1>
      <div className="mt-8 flex flex-wrap gap-3">{visibles.map((p) => {
        const valor = respuestas[p.clave];
        const valores = Array.isArray(valor) ? valor : valor === undefined || valor === null ? [] : [String(valor)];
        const detalle = p.tipo === "numero" ? valor ? `${valor} €` : "Prefiero no decirlo" : valores.map((v) => opcionesPregunta(p, respuestas).find((o) => o.valor === v)?.texto ?? v).join(", ") || (p.tipo === "varias" ? "Ninguno de estos" : "Sin indicar");
        return <Button key={p.clave} className="pill pill-secondary h-auto max-w-full flex-col items-start whitespace-normal text-left" onClick={() => { setEditar(true); setClave(p.clave); setVista("pregunta"); setError(""); }}><span className="text-sm text-nota">{p.titulo}</span><span>{detalle}</span></Button>;
      })}</div>{aviso}<div className="asistente-nav"><Button className="pill pill-secondary" onClick={empezar}>Atrás</Button><Button className="pill pill-primary" onClick={() => void buscar()}>Ver conductores</Button></div>
    </> : pregunta ? <>
      <div className="asistente-progreso"><div className="barra" role="progressbar" aria-label="Progreso de las preguntas" aria-valuemin={0} aria-valuemax={visibles.length} aria-valuenow={indice + 1}><span style={{ width: `${((indice + 1) / visibles.length) * 100}%` }} /></div><p>{indice + 1} de {visibles.length}</p></div>
      <h1 ref={titulo} tabIndex={-1} className="asistente-h1">{pregunta.titulo}</h1>{pregunta.ayuda && <p className="asistente-sub" id="pregunta-ayuda">{pregunta.ayuda}</p>}
      <form onSubmit={(e) => { e.preventDefault(); siguiente(); }}>
        <div className="asistente-controles">{pregunta.tipo === "numero" ? <><label htmlFor="numero" className="sr-only">{pregunta.titulo}</label><input id="numero" className="campo" type="number" min={pregunta.min} max={pregunta.max} value={respuestas[pregunta.clave] === null ? "" : String(respuestas[pregunta.clave] ?? "")} onChange={(e) => elegir(e.target.value === "" ? null : Number(e.target.value))} aria-describedby={pregunta.ayuda ? "pregunta-ayuda" : undefined} /><Button type="button" className="pill pill-secondary justify-self-start" onClick={saltar}>Prefiero no decirlo</Button></> : <fieldset className="grupo"><legend className="sr-only">{pregunta.titulo}</legend><div className="opciones opciones-grandes">{opcionesPregunta(pregunta, respuestas).map((o) => {
          const valor = respuestas[pregunta.clave];
          const marcada = pregunta.tipo === "varias" ? Array.isArray(valor) && valor.includes(o.valor) : valor !== null && valor !== undefined && String(valor) === o.valor;
          return <label className="opcion" key={o.valor}><input name={pregunta.clave} type={pregunta.tipo === "varias" ? "checkbox" : "radio"} value={o.valor} checked={marcada} onChange={() => elegir(pregunta.tipo === "varias" ? marcada && Array.isArray(valor) ? valor.filter((v) => v !== o.valor) : [...(Array.isArray(valor) ? valor : []), o.valor] : o.valor)} /><span className="opcion-t">{o.texto}</span>{o.detalle && <span className="opcion-d">{o.detalle}</span>}</label>;
        })}</div></fieldset>}</div>{aviso}
        <div className="asistente-nav"><Button type="button" className="pill pill-secondary" onClick={() => { setError(""); if (editar) { setEditar(false); setVista("resumen"); } else if (indice > 0) setClave(visibles[indice - 1]?.clave ?? ""); else setVista("inicio"); }}>Atrás</Button><Button type="submit" className="pill pill-primary whitespace-normal">{pregunta.tipo === "varias" && (!contestada(pregunta, respuestas) || JSON.stringify(respuestas[pregunta.clave]) === "[]") ? "Ninguno de estos" : "Siguiente"}</Button></div>
      </form>
    </> : null}
  </section></Marco>;
}