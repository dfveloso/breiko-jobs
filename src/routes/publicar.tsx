import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SiteHeader, CookieNotice } from "@/components/breiko/Chrome";
import { OfertaTarjeta, TextoOferta } from "@/components/breiko/OfertaTarjeta";
import { PROVINCIAS, LINKS } from "@/lib/provincias";
import {
  AMBITOS,
  CONTRATOS,
  EXPERIENCIA,
  EXTRAS,
  HORARIOS,
  INCORPORACION,
  JORNADAS,
  NOCHES,
  nombresVehiculos,
  OFERTA_VACIA,
  PERIODOS,
  PERMISOS,
  SECTORES,
  VEHICULOS,
  VENTAJAS,
  WS,
  datosTarjeta,
  publicar,
  redactar,
  requisitosDe,
  tituloProvisional,
  type Oferta,
  type Redaccion,
} from "@/lib/empleo";

const TITLE = "Publica una oferta de conductor · Breiko Jobs";
const DESC =
  "Publica gratis tu oferta de empleo para conductores profesionales. Responde unas preguntas, la redactamos por ti y llega a los conductores que encajan.";

export const Route = createFileRoute("/publicar")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: "https://jobs.breikobreiko.com/publicar" },
    ],
    links: [{ rel: "canonical", href: "https://jobs.breikobreiko.com/publicar" }],
  }),
  component: Publicar,
});

const PASOS = [
  "sector",
  "vehiculo",
  "requisitos",
  "lugar",
  "horario",
  "salario",
  "ventajas",
  "empresa",
  "texto",
  "contacto",
] as const;
type Paso = (typeof PASOS)[number];
const BORRADOR = "bb-jobs-borrador";
const REGISTRO_FLEET = `${WS}/portal/index.html#registro?origen=jobs`;
const CORREO_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Errores = Partial<
  Record<
    | "sector"
    | "vehiculo"
    | "permisos"
    | "localidad"
    | "provincia"
    | "ambito"
    | "jornada"
    | "contrato"
    | "salario"
    | "empresa_nombre"
    | "titulo"
    | "descripcion"
    | "correo"
    | "acepta",
    string
  >
>;
type Contacto = {
  correo: string;
  contacto_nombre: string;
  telefono: string;
  acepta: boolean;
  web: string;
};

function errorDe(paso: Paso, o: Oferta, r: Redaccion | null, c: Contacto): Errores {
  const e: Errores = {};
  if (paso === "sector" && !o.sector) e.sector = "Elige el tipo de transporte.";
  if (paso === "vehiculo" && !o.vehiculo.length) e.vehiculo = "Elige al menos un vehículo.";
  if (paso === "requisitos" && !o.permisos.length)
    e.permisos = "Marca al menos un permiso de conducir.";
  if (paso === "lugar") {
    if (!o.localidad.trim()) e.localidad = "Escribe la localidad.";
    if (!o.provincia) e.provincia = "Elige la provincia.";
    if (!o.ambito) e.ambito = "Elige por dónde se mueve.";
  }
  if (paso === "horario") {
    if (!o.jornada) e.jornada = "Elige la jornada.";
    if (!o.contrato) e.contrato = "Elige el tipo de contrato.";
  }
  if (
    paso === "salario" &&
    !o.sin_salario &&
    !(Number(o.salario_min) > 0 || Number(o.salario_max) > 0)
  ) {
    e.salario = "Escribe una cifra o marca que prefieres no ponerla.";
  }
  if (paso === "empresa" && !o.empresa_nombre.trim())
    e.empresa_nombre = "Escribe el nombre de la empresa.";
  if (paso === "texto" && r) {
    if (r.titulo.trim().length < 8) e.titulo = "El título es demasiado corto.";
    if (r.descripcion.trim().length < 40) e.descripcion = "La descripción es demasiado corta.";
  }
  if (paso === "contacto") {
    if (!CORREO_OK.test(c.correo.trim())) e.correo = "Escribe un correo válido.";
    if (!c.acepta) e.acepta = "Necesitamos que aceptes las condiciones para publicar.";
  }
  return e;
}

function Publicar() {
  const [oferta, setOferta] = useState<Oferta>(OFERTA_VACIA);
  const [i, setI] = useState(0);
  const [redaccion, setRedaccion] = useState<Redaccion | null>(null);
  const [redactadaCon, setRedactadaCon] = useState("");
  const [contacto, setContacto] = useState<Contacto>({
    correo: "",
    contacto_nombre: "",
    telefono: "",
    acepta: false,
    web: "",
  });
  const [errores, setErrores] = useState<Errores>({});
  const [ocupado, setOcupado] = useState<"" | "redactando" | "publicando">("");
  const [aviso, setAviso] = useState("");
  const [enviada, setEnviada] = useState<{ correo: string; registrada: boolean } | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const puntero = useRef(false);
  const primera = useRef(true);
  const paso = PASOS[i] ?? "sector";

  // Borrador en este navegador, por si se cierra la pestaña a medias.
  useEffect(() => {
    try {
      const b = JSON.parse(localStorage.getItem(BORRADOR) || "null");
      if (b?.oferta) {
        // Los borradores de antes del 04/11/2026 guardaban un solo vehículo como texto.
        const v = b.oferta.vehiculo;
        setOferta({ ...OFERTA_VACIA, ...b.oferta, vehiculo: Array.isArray(v) ? v : v ? [v] : [] });
        setI(Math.min(Number(b.i) || 0, PASOS.indexOf("empresa")));
      }
    } catch {
      /* sin almacenamiento */
    }
  }, []);
  useEffect(() => {
    if (enviada) return;
    try {
      localStorage.setItem(BORRADOR, JSON.stringify({ oferta, i }));
    } catch {
      /* sin almacenamiento */
    }
  }, [oferta, i, enviada]);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    titulo.current?.focus({ preventScroll: true });
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [i, enviada]);

  const cambiar = (c: Partial<Oferta>) => {
    setOferta((o) => ({ ...o, ...c }));
    setErrores({});
  };
  const huella = useMemo(() => JSON.stringify(oferta), [oferta]);

  async function pedirRedaccion() {
    setOcupado("redactando");
    setAviso("");
    const r = await redactar(oferta);
    setOcupado("");
    if (r.ok) {
      setRedaccion({
        titulo: r.titulo,
        resumen: r.resumen,
        descripcion: r.descripcion,
        redactado_ia: r.redactado_ia,
      });
      setRedactadaCon(huella);
      return true;
    }
    setAviso(r.error || "No hemos podido redactar la oferta. Inténtalo de nuevo.");
    return false;
  }

  // Tras validar, el foco va al primer campo con error (o al primer control de su grupo).
  function enfocarError() {
    requestAnimationFrame(() => {
      const raiz = document.querySelector(".asistente-pregunta");
      const campo = raiz?.querySelector<HTMLElement>('[aria-invalid="true"]');
      const grupo = raiz?.querySelector(".campo-error")?.previousElementSibling;
      (campo ?? grupo?.querySelector<HTMLElement>("input, select, textarea"))?.focus();
    });
  }

  async function siguiente() {
    const e = errorDe(paso, oferta, redaccion, contacto);
    setErrores(e);
    if (Object.keys(e).length) return enfocarError();
    if (paso === "empresa" && (!redaccion || redactadaCon !== huella)) {
      setI(i + 1);
      await pedirRedaccion();
      return;
    }
    if (paso === "contacto") return enviar();
    setI(i + 1);
  }

  async function enviar() {
    if (!redaccion) return;
    setOcupado("publicando");
    setAviso("");
    const origen =
      new URLSearchParams(window.location.search).get("utm_source")?.slice(0, 100) ?? null;
    const r = await publicar(
      oferta,
      redaccion,
      {
        correo: contacto.correo.trim().toLowerCase(),
        contacto_nombre: contacto.contacto_nombre,
        telefono: contacto.telefono,
        web: contacto.web,
      },
      origen,
    );
    setOcupado("");
    if (!r.ok) {
      if (r.campos) setErrores(r.campos as Errores);
      setAviso(r.error || "No hemos podido publicar la oferta. Inténtalo de nuevo.");
      return;
    }
    try {
      localStorage.removeItem(BORRADOR);
    } catch {
      /* sin almacenamiento */
    }
    setEnviada({ correo: contacto.correo.trim().toLowerCase(), registrada: r.empresa_registrada });
  }

  const elegir = (c: Partial<Oferta>) => {
    cambiar(c);
    if (puntero.current) {
      puntero.current = false;
      setTimeout(() => setI((n) => n + 1), 220);
    }
  };

  const vista = {
    titulo: redaccion?.titulo ?? tituloProvisional(oferta),
    resumen: redaccion?.resumen,
    empresa: oferta.empresa_nombre,
    lugar: [oferta.localidad, oferta.provincia].filter(Boolean).join(", "),
    permisos: oferta.permisos,
    vehiculos: nombresVehiculos(oferta.vehiculo),
    datos: datosTarjeta(oferta),
  };

  if (enviada) {
    return (
      <Marco>
        <section className="asistente-pregunta">
          <h1 ref={titulo} tabIndex={-1} className="asistente-h1">
            Mira tu correo para publicarla
          </h1>
          <p className="asistente-sub">
            Te hemos mandado un enlace a <strong className="text-blanco">{enviada.correo}</strong>.
            Pulsa «Publicar mi oferta» y empezará a llegar a los conductores que encajan.
          </p>
          <ul className="asistente-pasos-fin">
            <li>
              <strong>Hoy.</strong> Confirmas el correo y la oferta sale en la pantalla de inicio de
              la app durante 30 días.
            </li>
            <li>
              <strong>Cuando alguien se interese,</strong> te escribimos a este mismo correo con su
              porcentaje de afinidad.
            </li>
            <li>
              <strong>Solo pagas si quieres ver su perfil completo</strong> y escribirle por el
              chat.
            </li>
          </ul>
          {enviada.registrada ? (
            <p className="asistente-nota">
              Este correo ya tiene cuenta de empresa en Breiko: verás la oferta y sus candidatos en
              tu panel.
            </p>
          ) : (
            <div className="asistente-registro">
              <h2>Síguela desde tu cuenta</h2>
              <p>
                Con una cuenta de empresa gratuita verás los candidatos, podrás editar o pausar la
                oferta y hablar con los conductores. Regístrate con este mismo correo y la oferta
                aparecerá en tu cuenta.
              </p>
              <a className="pill pill-primary mt-6" href={REGISTRO_FLEET}>
                Crear mi cuenta de empresa
              </a>
            </div>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              className="pill pill-secondary"
              onClick={() => {
                setEnviada(null);
                setOferta(OFERTA_VACIA);
                setRedaccion(null);
                setI(0);
                setContacto((c) => ({ ...c, acepta: false }));
              }}
            >
              Publicar otra oferta
            </button>
            <Link to="/" className="pill pill-secondary">
              Volver a Breiko Jobs
            </Link>
          </div>
        </section>
        <Vista {...vista} />
      </Marco>
    );
  }

  const quedan = PASOS.length - i - 1;
  const progreso =
    quedan === 0
      ? "Último paso"
      : quedan === 1
        ? "Te queda 1 pregunta"
        : `Te quedan ${quedan} preguntas`;
  const err = (k: keyof Errores) =>
    errores[k] ? (
      <p id={`e-${k}`} className="campo-error" role="alert">
        {errores[k]}
      </p>
    ) : null;

  return (
    <Marco>
      <section className="asistente-pregunta" aria-busy={ocupado !== ""}>
        <div className="asistente-progreso">
          <div
            className="barra"
            role="progressbar"
            aria-label="Progreso de la oferta"
            aria-valuemin={0}
            aria-valuemax={PASOS.length}
            aria-valuenow={i + 1}
          >
            <span style={{ width: `${((i + 1) / PASOS.length) * 100}%` }} />
          </div>
          <p>{progreso}</p>
        </div>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void siguiente();
          }}
          onPointerDown={() => {
            puntero.current = true;
          }}
          onKeyDown={() => {
            puntero.current = false;
          }}
        >
          {paso === "sector" && (
            <Pregunta
              refH={titulo}
              h="¿Qué conductor buscas?"
              sub="Publicar es gratis y no hace falta cuenta. Responde unas preguntas y redactamos la oferta por ti."
            >
              <Opciones
                nombre="sector"
                etiqueta="Tipo de transporte"
                opciones={SECTORES}
                valor={oferta.sector}
                grande
                onCambio={(v) =>
                  elegir({ sector: v, vehiculo: oferta.sector === v ? oferta.vehiculo : [] })
                }
              />
              {err("sector")}
            </Pregunta>
          )}

          {paso === "vehiculo" && (
            <Pregunta
              refH={titulo}
              h="¿Qué va a conducir?"
              sub="Marca todos los que pueda llevar. Con esto preparamos los permisos que suelen pedir; los podrás cambiar."
            >
              <Opciones
                nombre="vehiculo"
                etiqueta="Vehículos (puedes marcar varios)"
                opciones={VEHICULOS[oferta.sector] ?? VEHICULOS["otro"] ?? []}
                valores={oferta.vehiculo}
                onCambios={(v) => cambiar({ vehiculo: v, ...requisitosDe(v) })}
              />
              {err("vehiculo")}
            </Pregunta>
          )}

          {paso === "requisitos" && (
            <Pregunta
              refH={titulo}
              h="¿Qué carné y papeles necesita?"
              sub="Hemos marcado lo habitual para este vehículo."
            >
              <Opciones
                nombre="permisos"
                etiqueta="Permiso de conducir"
                opciones={PERMISOS}
                valores={oferta.permisos}
                compacto
                onCambios={(v) => cambiar({ permisos: v })}
              />
              {err("permisos")}
              <Opciones
                nombre="extras"
                etiqueta="Además, necesita"
                opciones={EXTRAS}
                valores={oferta.extras}
                onCambios={(v) => cambiar({ extras: v })}
              />
            </Pregunta>
          )}

          {paso === "lugar" && (
            <Pregunta
              refH={titulo}
              h="¿Desde dónde sale y hasta dónde llega?"
              sub="Se la enseñamos primero a los conductores que se mueven por esa zona."
            >
              <div className="campos-2">
                <Campo
                  id="localidad"
                  etiqueta="Localidad de trabajo o de salida"
                  error={errores.localidad}
                >
                  <input
                    id="localidad"
                    name="localidad"
                    className="campo"
                    value={oferta.localidad}
                    autoComplete="address-level2"
                    maxLength={100}
                    placeholder="Ej.: Alcalá de Henares…"
                    aria-invalid={!!errores.localidad}
                    aria-describedby={errores.localidad ? "e-localidad" : undefined}
                    onChange={(e) => cambiar({ localidad: e.target.value })}
                  />
                </Campo>
                <Campo id="provincia" etiqueta="Provincia" error={errores.provincia}>
                  <select
                    id="provincia"
                    className="campo"
                    value={oferta.provincia}
                    aria-invalid={!!errores.provincia}
                    aria-describedby={errores.provincia ? "e-provincia" : undefined}
                    onChange={(e) => cambiar({ provincia: e.target.value })}
                  >
                    <option value="">Elige…</option>
                    {PROVINCIAS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </Campo>
              </div>
              <Opciones
                nombre="ambito"
                etiqueta="¿Por dónde se mueve?"
                opciones={AMBITOS}
                valor={oferta.ambito}
                onCambio={(v) => cambiar({ ambito: v })}
              />
              {err("ambito")}
              <Opciones
                nombre="noches"
                etiqueta="¿Duerme en casa?"
                opciones={NOCHES}
                valor={oferta.noches_fuera}
                onCambio={(v) => cambiar({ noches_fuera: v })}
              />
            </Pregunta>
          )}

          {paso === "horario" && (
            <Pregunta refH={titulo} h="¿Cómo es el horario y el contrato?">
              <Opciones
                nombre="jornada"
                etiqueta="Jornada"
                opciones={JORNADAS}
                valor={oferta.jornada}
                compacto
                onCambio={(v) => cambiar({ jornada: v })}
              />
              {err("jornada")}
              <Opciones
                nombre="horario"
                etiqueta="Horario (puedes marcar varios)"
                opciones={HORARIOS}
                valores={oferta.horario}
                compacto
                onCambios={(v) => cambiar({ horario: v })}
              />
              <Opciones
                nombre="contrato"
                etiqueta="Contrato"
                opciones={CONTRATOS}
                valor={oferta.contrato}
                compacto
                onCambio={(v) => cambiar({ contrato: v })}
              />
              {err("contrato")}
            </Pregunta>
          )}

          {paso === "salario" && (
            <Pregunta
              refH={titulo}
              h="¿Cuánto pagas?"
              sub="Es lo primero que mira un conductor. Puedes poner una cifra o una horquilla, en bruto."
            >
              <fieldset className="grupo" disabled={oferta.sin_salario}>
                <legend className="grupo-etiqueta">Salario bruto</legend>
                <div className="salario">
                  <Campo id="salario_min" etiqueta="Desde">
                    <input
                      id="salario_min"
                      className="campo"
                      inputMode="numeric"
                      value={oferta.salario_min}
                      placeholder="1.900"
                      onChange={(e) =>
                        cambiar({ salario_min: e.target.value.replace(/\D/g, "").slice(0, 6) })
                      }
                      aria-describedby={errores.salario ? "e-salario" : undefined}
                    />
                  </Campo>
                  <Campo id="salario_max" etiqueta="Hasta (opcional)">
                    <input
                      id="salario_max"
                      className="campo"
                      inputMode="numeric"
                      value={oferta.salario_max}
                      placeholder="2.400"
                      onChange={(e) =>
                        cambiar({ salario_max: e.target.value.replace(/\D/g, "").slice(0, 6) })
                      }
                    />
                  </Campo>
                  <Campo id="salario_periodo" etiqueta="Euros">
                    <select
                      id="salario_periodo"
                      className="campo"
                      value={oferta.salario_periodo}
                      onChange={(e) => cambiar({ salario_periodo: e.target.value })}
                    >
                      {PERIODOS.map((p) => (
                        <option key={p.v} value={p.v}>
                          {p.t}
                        </option>
                      ))}
                    </select>
                  </Campo>
                </div>
              </fieldset>
              <label className="casilla mt-6">
                <input
                  type="checkbox"
                  checked={oferta.sin_salario}
                  onChange={(e) => cambiar({ sin_salario: e.target.checked })}
                />
                <span>Prefiero no poner el salario en la oferta</span>
              </label>
              {err("salario")}
            </Pregunta>
          )}

          {paso === "ventajas" && (
            <Pregunta
              refH={titulo}
              h="¿Qué ofreces además del sueldo?"
              sub="Marca todo lo que sea verdad. Nada más: la oferta solo dirá lo que marques aquí."
            >
              <Opciones
                nombre="ventajas"
                etiqueta="Ventajas"
                opciones={VENTAJAS}
                valores={oferta.ventajas}
                compacto
                onCambios={(v) => cambiar({ ventajas: v })}
              />
              <Opciones
                nombre="incorporacion"
                etiqueta="¿Para cuándo?"
                opciones={INCORPORACION}
                valor={oferta.incorporacion}
                compacto
                onCambio={(v) => cambiar({ incorporacion: v })}
              />
              <fieldset className="grupo">
                <legend className="grupo-etiqueta">¿Cuántos conductores necesitas?</legend>
                <div className="contador">
                  <button
                    type="button"
                    className="contador-btn"
                    aria-label="Uno menos"
                    disabled={oferta.plazas <= 1}
                    onClick={() => cambiar({ plazas: oferta.plazas - 1 })}
                  >
                    −
                  </button>
                  <output aria-live="polite">
                    {oferta.plazas} {oferta.plazas === 1 ? "plaza" : "plazas"}
                  </output>
                  <button
                    type="button"
                    className="contador-btn"
                    aria-label="Uno más"
                    disabled={oferta.plazas >= 99}
                    onClick={() => cambiar({ plazas: oferta.plazas + 1 })}
                  >
                    +
                  </button>
                </div>
              </fieldset>
            </Pregunta>
          )}

          {paso === "empresa" && (
            <Pregunta
              refH={titulo}
              h="Lo último: tu empresa"
              sub="Con esto ya tenemos todo para redactarla."
            >
              <Campo
                id="empresa_nombre"
                etiqueta="Nombre de la empresa"
                error={errores.empresa_nombre}
              >
                <input
                  id="empresa_nombre"
                  name="empresa_nombre"
                  className="campo"
                  value={oferta.empresa_nombre}
                  autoComplete="organization"
                  maxLength={150}
                  aria-invalid={!!errores.empresa_nombre}
                  aria-describedby={errores.empresa_nombre ? "e-empresa_nombre" : undefined}
                  onChange={(e) => cambiar({ empresa_nombre: e.target.value })}
                />
              </Campo>
              <Opciones
                nombre="experiencia"
                etiqueta="Experiencia mínima"
                compacto
                opciones={EXPERIENCIA.map((n) => ({
                  v: String(n),
                  t: n === 0 ? "Sin experiencia" : n === 1 ? "1 año" : `${n} años`,
                }))}
                valor={String(oferta.experiencia_min)}
                onCambio={(v) => cambiar({ experiencia_min: Number(v) })}
              />
              <Campo id="notas" etiqueta="¿Algo más que deba saber un conductor? (opcional)">
                <textarea
                  id="notas"
                  className="campo campo-area"
                  rows={4}
                  maxLength={1500}
                  value={oferta.notas}
                  placeholder="Ej.: rutas fijas a Valencia y Barcelona, carga y descarga por cuenta del cliente…"
                  onChange={(e) => cambiar({ notas: e.target.value })}
                />
              </Campo>
            </Pregunta>
          )}

          {paso === "texto" && (
            <Pregunta
              refH={titulo}
              h={ocupado === "redactando" ? "Redactando tu oferta…" : "Así queda tu oferta"}
              sub={
                ocupado === "redactando"
                  ? "Tarda unos segundos."
                  : "La hemos escrito con tus respuestas. Cambia lo que quieras."
              }
            >
              {ocupado === "redactando" || !redaccion ? (
                <div className="redactando" aria-live="polite">
                  {aviso ? (
                    <>
                      <p className="campo-error" role="alert">
                        {aviso}
                      </p>
                      <button
                        type="button"
                        className="pill pill-primary mt-4"
                        onClick={() => void pedirRedaccion()}
                      >
                        Volver a intentarlo
                      </button>
                    </>
                  ) : (
                    <>
                      <span />
                      <span />
                      <span />
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Campo id="titulo" etiqueta="Título" error={errores.titulo}>
                    <input
                      id="titulo"
                      className="campo"
                      value={redaccion.titulo}
                      maxLength={120}
                      aria-invalid={!!errores.titulo}
                      aria-describedby={errores.titulo ? "e-titulo" : undefined}
                      onChange={(e) => {
                        setRedaccion({ ...redaccion, titulo: e.target.value });
                        setErrores({});
                      }}
                    />
                  </Campo>
                  <Campo id="resumen" etiqueta="Frase de la tarjeta">
                    <input
                      id="resumen"
                      className="campo"
                      value={redaccion.resumen}
                      maxLength={160}
                      onChange={(e) => setRedaccion({ ...redaccion, resumen: e.target.value })}
                    />
                  </Campo>
                  <Campo id="descripcion" etiqueta="Descripción" error={errores.descripcion}>
                    <textarea
                      id="descripcion"
                      className="campo campo-area"
                      rows={12}
                      maxLength={4000}
                      value={redaccion.descripcion}
                      aria-invalid={!!errores.descripcion}
                      aria-describedby={errores.descripcion ? "e-descripcion" : undefined}
                      onChange={(e) => {
                        setRedaccion({ ...redaccion, descripcion: e.target.value });
                        setErrores({});
                      }}
                    />
                  </Campo>
                  <details className="texto-previa">
                    <summary>Ver cómo se lee</summary>
                    <TextoOferta texto={redaccion.descripcion} />
                  </details>
                  <button
                    type="button"
                    className="enlace mt-4"
                    onClick={() => void pedirRedaccion()}
                  >
                    Redactarla otra vez
                  </button>
                </>
              )}
            </Pregunta>
          )}

          {paso === "contacto" && (
            <Pregunta
              refH={titulo}
              h="¿Dónde te avisamos?"
              sub="Te mandaremos un correo para confirmar la oferta y otro cada vez que un conductor se interese."
            >
              <Campo id="correo" etiqueta="Correo electrónico" error={errores.correo}>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  className="campo"
                  value={contacto.correo}
                  autoComplete="email"
                  maxLength={255}
                  spellCheck={false}
                  aria-invalid={!!errores.correo}
                  aria-describedby={errores.correo ? "e-correo" : undefined}
                  onChange={(e) => {
                    setContacto({ ...contacto, correo: e.target.value });
                    setErrores({});
                  }}
                />
              </Campo>
              <div className="campos-2">
                <Campo id="contacto_nombre" etiqueta="Tu nombre (opcional)">
                  <input
                    id="contacto_nombre"
                    name="contacto_nombre"
                    className="campo"
                    value={contacto.contacto_nombre}
                    autoComplete="name"
                    maxLength={100}
                    onChange={(e) => setContacto({ ...contacto, contacto_nombre: e.target.value })}
                  />
                </Campo>
                <Campo id="telefono" etiqueta="Teléfono (opcional)">
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    className="campo"
                    value={contacto.telefono}
                    autoComplete="tel"
                    maxLength={30}
                    onChange={(e) => setContacto({ ...contacto, telefono: e.target.value })}
                  />
                </Campo>
              </div>
              <div className="hidden" aria-hidden="true">
                <label htmlFor="web">No rellenar</label>
                <input
                  id="web"
                  tabIndex={-1}
                  autoComplete="off"
                  value={contacto.web}
                  onChange={(e) => setContacto({ ...contacto, web: e.target.value })}
                />
              </div>
              <label className="casilla mt-6">
                <input
                  type="checkbox"
                  checked={contacto.acepta}
                  aria-describedby={errores.acepta ? "e-acepta" : undefined}
                  onChange={(e) => {
                    setContacto({ ...contacto, acepta: e.target.checked });
                    setErrores({});
                  }}
                />
                <span>
                  Confirmo que la oferta es real y acepto la{" "}
                  <a href={LINKS.privacidad} target="_blank" rel="noopener noreferrer">
                    política de privacidad
                  </a>
                  .
                </span>
              </label>
              {err("acepta")}
              <p className="asistente-nota">
                Publicar es gratis. Cuando un conductor se interese verás su afinidad con la oferta;
                para ver su perfil completo y escribirle, podrás desbloquearlo.
              </p>
            </Pregunta>
          )}

          {aviso && paso !== "texto" ? (
            <p className="campo-error mt-6" role="alert">
              {aviso}
            </p>
          ) : null}

          <div className="asistente-nav">
            {i > 0 ? (
              <button
                type="button"
                className="pill pill-secondary"
                onClick={() => {
                  setErrores({});
                  setAviso("");
                  setI(i - 1);
                }}
              >
                Atrás
              </button>
            ) : null}
            <button type="submit" className="pill pill-primary ml-auto" disabled={ocupado !== ""}>
              {ocupado === "publicando"
                ? "Publicando…"
                : paso === "contacto"
                  ? "Publicar oferta"
                  : paso === "empresa"
                    ? "Redactar mi oferta"
                    : "Siguiente"}
            </button>
          </div>
        </form>
      </section>
      <Vista {...vista} cargando={ocupado === "redactando"} />
    </Marco>
  );
}

function Marco({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-noche">
      <SiteHeader />
      <main id="contenido" className="asistente">
        {children}
      </main>
      <CookieNotice />
    </div>
  );
}

function Vista(p: Parameters<typeof OfertaTarjeta>[0] & { cargando?: boolean }) {
  const { cargando, ...tarjeta } = p;
  return (
    <aside className="asistente-vista" aria-labelledby="vista-h">
      <h2 id="vista-h">Así la verá el conductor</h2>
      <div className={`telefono${cargando ? " cargando" : ""}`} data-ui>
        <p className="telefono-cabecera">Tu día</p>
        <OfertaTarjeta {...tarjeta} />
      </div>
      <p className="asistente-vista-nota">
        Le sale en la pantalla de inicio de la app a los conductores que encajan por zona, carné y
        experiencia.
      </p>
    </aside>
  );
}

function Pregunta({
  h,
  sub,
  refH,
  children,
}: {
  h: string;
  sub?: string;
  refH: React.RefObject<HTMLHeadingElement | null>;
  children: ReactNode;
}) {
  return (
    <div className="asistente-cuerpo">
      <h1 ref={refH} tabIndex={-1} className="asistente-h1">
        {h}
      </h1>
      {sub ? <p className="asistente-sub">{sub}</p> : null}
      <div className="asistente-controles">{children}</div>
    </div>
  );
}

function Campo({
  id,
  etiqueta,
  error,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="campo-bloque">
      <label htmlFor={id} className="campo-etiqueta">
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p id={`e-${id}`} className="campo-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type OpcionesProps = {
  nombre: string;
  etiqueta: string;
  opciones: { v: string; t: string; d?: string }[];
  grande?: boolean;
  compacto?: boolean;
} & (
  | { valor: string; onCambio: (v: string) => void; valores?: never; onCambios?: never }
  | { valores: string[]; onCambios: (v: string[]) => void; valor?: never; onCambio?: never }
);

function Opciones(p: OpcionesProps) {
  const multiple = Array.isArray(p.valores);
  return (
    <fieldset className="grupo">
      <legend className="grupo-etiqueta">{p.etiqueta}</legend>
      <div
        className={`opciones${p.grande ? " opciones-grandes" : ""}${p.compacto ? " opciones-compactas" : ""}`}
      >
        {p.opciones.map((o) => {
          const marcada = multiple ? p.valores!.includes(o.v) : p.valor === o.v;
          return (
            <label key={o.v} className="opcion">
              <input
                type={multiple ? "checkbox" : "radio"}
                name={p.nombre}
                value={o.v}
                checked={marcada}
                onChange={() => {
                  if (multiple)
                    p.onCambios!(
                      marcada ? p.valores!.filter((x) => x !== o.v) : [...p.valores!, o.v],
                    );
                  else p.onCambio!(o.v);
                }}
              />
              <span className="opcion-t">{o.t}</span>
              {o.d ? <span className="opcion-d">{o.d}</span> : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
