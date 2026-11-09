// Ofertas de empleo de Breiko Jobs: catálogos del asistente y llamadas al WS
// (breiko-ws/ws/jobs_ofertas.php). Los valores coinciden con lib/empleo_ofertas.php.

export const WS =
  (import.meta.env["VITE_BREIKO_WS"] as string | undefined) ??
  "https://ws.breikobreiko.com/breiko-ws/ws";
export const ENDPOINT_OFERTAS = `${WS}/jobs_ofertas.php`;

type Opcion<V extends string = string> = { v: V; t: string; d?: string };

export const SECTORES: Opcion[] = [
  { v: "mercancias", t: "Mercancías", d: "Camión, tráiler, cisterna, frío…" },
  { v: "viajeros", t: "Viajeros", d: "Autobús urbano, autocar, discrecional…" },
  { v: "reparto", t: "Reparto", d: "Paquetería y última milla" },
  { v: "otro", t: "Otro", d: "Grúa, VTC, servicios especiales…" },
];

export const VEHICULOS: Record<string, Opcion[]> = {
  mercancias: [
    { v: "trailer", t: "Tráiler / articulado" },
    { v: "rigido", t: "Camión rígido" },
    { v: "cisterna", t: "Cisterna" },
    { v: "frigorifico", t: "Frigorífico" },
    { v: "portavehiculos", t: "Portavehículos" },
    { v: "furgoneta", t: "Furgoneta" },
  ],
  viajeros: [
    { v: "autobus", t: "Autobús urbano" },
    { v: "autocar", t: "Autocar" },
    { v: "microbus", t: "Microbús" },
    { v: "vtc", t: "Turismo / VTC" },
  ],
  reparto: [
    { v: "furgoneta", t: "Furgoneta" },
    { v: "rigido", t: "Camión rígido" },
    { v: "vtc", t: "Turismo" },
  ],
  otro: [
    { v: "grua", t: "Grúa" },
    { v: "vtc", t: "Turismo / VTC" },
    { v: "rigido", t: "Camión rígido" },
    { v: "otro", t: "Otro vehículo" },
  ],
};
export const NOMBRE_VEHICULO: Record<string, string> = Object.fromEntries(
  Object.values(VEHICULOS)
    .flat()
    .map((o) => [o.v, o.t]),
);

export const PERMISOS: Opcion[] = ["B", "C1", "C", "CE", "D1", "D", "DE"].map((v) => ({
  v,
  t: v.replace("E", "+E").replace(/^\+/, ""),
}));
export const nombrePermiso = (p: string) => (p.length === 2 && p.endsWith("E") ? `${p[0]}+E` : p);

export const EXTRAS: Opcion[] = [
  { v: "cap", t: "CAP en vigor" },
  { v: "tacografo", t: "Tarjeta de tacógrafo" },
  { v: "adr", t: "ADR" },
  { v: "frio", t: "Experiencia en frío" },
  { v: "grua", t: "Carné de grúa o carretilla" },
  { v: "idiomas", t: "Idiomas" },
];

export const AMBITOS: Opcion[] = [
  { v: "local", t: "Local", d: "En la ciudad y alrededores" },
  { v: "regional", t: "Regional", d: "Dentro de la comunidad" },
  { v: "nacional", t: "Nacional", d: "Por toda España" },
  { v: "internacional", t: "Internacional", d: "Europa y más allá" },
];

export const NOCHES: Opcion[] = [
  { v: "nunca", t: "Duerme en casa cada día" },
  { v: "alguna", t: "Alguna noche fuera" },
  { v: "semanal", t: "Fuera entre semana", d: "Fines de semana en casa" },
  { v: "larga", t: "Viajes de varias semanas" },
];

export const JORNADAS: Opcion[] = [
  { v: "completa", t: "Completa" },
  { v: "parcial", t: "Media jornada" },
  { v: "fines_semana", t: "Fines de semana" },
  { v: "noches", t: "Noches" },
  { v: "por_dias", t: "Por días o servicios" },
];
export const HORARIOS: Opcion[] = [
  { v: "manana", t: "Mañanas" },
  { v: "tarde", t: "Tardes" },
  { v: "noche", t: "Noches" },
  { v: "rotativo", t: "Turnos rotativos" },
  { v: "flexible", t: "Flexible" },
];
export const CONTRATOS: Opcion[] = [
  { v: "indefinido", t: "Indefinido" },
  { v: "temporal", t: "Temporal" },
  { v: "autonomo", t: "Autónomo o colaborador" },
  { v: "practicas", t: "Prácticas" },
];
export const PERIODOS: Opcion[] = [
  { v: "mes", t: "al mes" },
  { v: "anio", t: "al año" },
  { v: "dia", t: "al día" },
  { v: "hora", t: "la hora" },
];
export const VENTAJAS: Opcion[] = [
  { v: "dietas", t: "Dietas pagadas" },
  { v: "vuelta_casa", t: "Vuelta a casa garantizada" },
  { v: "vehiculo_asignado", t: "Vehículo asignado" },
  { v: "vehiculo_nuevo", t: "Flota nueva" },
  { v: "formacion", t: "Formación pagada" },
  { v: "plus_noche", t: "Plus de nocturnidad" },
  { v: "horario_estable", t: "Horario estable" },
  { v: "seguro", t: "Seguro médico" },
  { v: "estabilidad", t: "Posibilidad de indefinido" },
];
export const INCORPORACION: Opcion[] = [
  { v: "inmediata", t: "Inmediata" },
  { v: "quince_dias", t: "En 15 días" },
  { v: "mes", t: "En un mes" },
  { v: "flexible", t: "Flexible" },
];
export const EXPERIENCIA = [0, 1, 2, 3, 5, 10];

export type Oferta = {
  sector: string;
  vehiculo: string[];
  permisos: string[];
  extras: string[];
  localidad: string;
  provincia: string;
  ambito: string;
  noches_fuera: string;
  jornada: string;
  horario: string[];
  contrato: string;
  salario_min: string;
  salario_max: string;
  salario_periodo: string;
  sin_salario: boolean;
  ventajas: string[];
  incorporacion: string;
  plazas: number;
  experiencia_min: number;
  empresa_nombre: string;
  notas: string;
};

export const OFERTA_VACIA: Oferta = {
  sector: "",
  vehiculo: [],
  permisos: [],
  extras: [],
  localidad: "",
  provincia: "",
  ambito: "",
  noches_fuera: "",
  jornada: "",
  horario: [],
  contrato: "",
  salario_min: "",
  salario_max: "",
  salario_periodo: "mes",
  sin_salario: false,
  ventajas: [],
  incorporacion: "flexible",
  plazas: 1,
  experiencia_min: 0,
  empresa_nombre: "",
  notas: "",
};

const CARNE: Record<string, string> = {
  trailer: "CE",
  cisterna: "CE",
  frigorifico: "C", // los frigoríficos de reparto suelen ser rígidos; la empresa lo sube a C+E en el paso 3 si hace falta
  portavehiculos: "CE",
  rigido: "C",
  grua: "C",
  furgoneta: "B",
  vtc: "B",
  autobus: "D",
  autocar: "D",
  microbus: "D1",
};
// De menos a más: quien tiene C+E ya puede llevar un C, y quien tiene C o D ya lleva un B.
const ORDEN_C = ["C1", "C", "CE"];
const ORDEN_D = ["D1", "D", "DE"];

/**
 * Permisos y papeles que piden normalmente los vehículos elegidos (la empresa puede
 * cambiarlos). Con varios vehículos se pide el carné más alto de cada familia.
 */
export function requisitosDe(vehiculos: string[]): { permisos: string[]; extras: string[] } {
  const carnes = vehiculos.map((v) => CARNE[v]).filter((p): p is string => !!p);
  const mayor = (orden: string[]) =>
    carnes.filter((p) => orden.includes(p)).sort((a, b) => orden.indexOf(b) - orden.indexOf(a))[0];
  const permisos = [mayor(ORDEN_C), mayor(ORDEN_D)].filter((p): p is string => !!p);
  if (!permisos.length && carnes.includes("B")) permisos.push("B");
  const extras = permisos.some((p) => p !== "B") ? ["cap", "tacografo"] : [];
  if (vehiculos.includes("cisterna")) extras.push("adr");
  if (vehiculos.includes("frigorifico")) extras.push("frio");
  return { permisos, extras };
}

export const nombresVehiculos = (vs: string[]) =>
  vs.map((v) => NOMBRE_VEHICULO[v]).filter((n): n is string => !!n);

const nombre = (lista: Opcion[], v: string) => lista.find((o) => o.v === v)?.t ?? "";

const NBSP = String.fromCharCode(0xa0);
const MILES = new Intl.NumberFormat("es-ES", {
  useGrouping: "always",
} as unknown as Intl.NumberFormatOptions);

export function salarioTexto(
  o: Pick<Oferta, "salario_min" | "salario_max" | "salario_periodo" | "sin_salario">,
): string {
  if (o.sin_salario) return "";
  // useGrouping "always": en es-ES, por defecto, los miles de 4 cifras no se separan («2200»).
  const f = (s: string) => `${MILES.format(Math.round(Number(s)))}${NBSP}€`;
  const min = Number(o.salario_min) > 0 ? o.salario_min : "",
    max = Number(o.salario_max) > 0 ? o.salario_max : "";
  if (!min && !max) return "";
  const cifra = min && max && min !== max ? `${f(min)} – ${f(max)}` : f(min || max);
  return `${cifra} ${nombre(PERIODOS, o.salario_periodo)}`;
}

/** Título provisional mientras se responde (el definitivo lo redacta el WS). */
export function tituloProvisional(o: Oferta): string {
  const carne = o.permisos.map(nombrePermiso).join(" / ");
  const vehiculos = nombresVehiculos(o.vehiculo).join(" o ");
  if (!vehiculos && !carne) return "Tu oferta de conductor";
  const partes = [`Conductor${carne ? " " + carne : ""}`];
  if (vehiculos) partes.push(vehiculos.toLowerCase());
  return partes.join(" · ") + (o.localidad ? ` en ${o.localidad}` : "");
}

const RUTAS: Record<string, string> = {
  local: "Rutas locales",
  regional: "Rutas regionales",
  nacional: "Rutas nacionales",
  internacional: "Rutas internacionales",
};

/** Datos sueltos de la tarjeta, en el orden en que los mira un conductor. */
export function datosTarjeta(o: Oferta): string[] {
  return [
    RUTAS[o.ambito] ?? "",
    nombre(NOCHES, o.noches_fuera),
    salarioTexto(o),
    o.jornada ? `Jornada ${nombre(JORNADAS, o.jornada).toLowerCase()}` : "",
    nombre(CONTRATOS, o.contrato),
    ...o.ventajas.slice(0, 2).map((v) => nombre(VENTAJAS, v)),
  ].filter(Boolean);
}

/** Lo que se manda al WS (los números como número, sin salario si no se quiere poner). */
export function ofertaParaWs(o: Oferta) {
  const n = (s: string) => (Number(s) > 0 ? Math.round(Number(s)) : null);
  return {
    ...o,
    noches_fuera: o.noches_fuera || null,
    salario_min: o.sin_salario ? null : n(o.salario_min),
    salario_max: o.sin_salario ? null : n(o.salario_max),
    salario_periodo: o.sin_salario ? null : o.salario_periodo,
  };
}

export type Redaccion = {
  titulo: string;
  resumen: string;
  descripcion: string;
  redactado_ia: boolean;
};
type Respuesta<T> =
  ({ ok: true } & T) | { ok: false; error?: string; campos?: Record<string, string> };

async function llamar<T>(cuerpo: unknown): Promise<Respuesta<T>> {
  try {
    const r = await fetch(ENDPOINT_OFERTAS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
    const j = await r.json().catch(() => null);
    if (j && typeof j === "object") return j as Respuesta<T>;
    return { ok: false, error: "No hemos podido conectar. Inténtalo de nuevo." };
  } catch {
    return {
      ok: false,
      error: "No hemos podido conectar. Revisa tu conexión e inténtalo de nuevo.",
    };
  }
}

export const redactar = (o: Oferta) =>
  llamar<Redaccion>({ accion: "redactar", oferta: ofertaParaWs(o) });

export const publicar = (
  o: Oferta,
  r: Redaccion,
  c: { correo: string; contacto_nombre: string; telefono: string; web: string },
  origen: string | null,
) =>
  llamar<{ slug: string; empresa_registrada: boolean }>({
    accion: "publicar",
    oferta: ofertaParaWs(o),
    ...r,
    ...c,
    acepta_condiciones: true,
    origen,
  });

export type OfertaPublica = {
  slug: string;
  estado: string;
  abierta: boolean;
  empresa_nombre: string;
  sector: string;
  vehiculo: string[];
  permisos: string[];
  extras: string[];
  ambito: string;
  localidad: string;
  provincia: string;
  jornada: string;
  contrato: string;
  horario: string[];
  noches_fuera: string | null;
  experiencia_min: number;
  salario_min: number | null;
  salario_max: number | null;
  salario_periodo: string | null;
  ventajas: string[];
  incorporacion: string;
  plazas: number;
  titulo: string;
  resumen: string;
  descripcion: string;
  publicada: string | null;
  caduca: string | null;
};

export async function verOferta(slug: string): Promise<OfertaPublica | null> {
  try {
    const r = await fetch(`${ENDPOINT_OFERTAS}?accion=ver&slug=${encodeURIComponent(slug)}`);
    const j = await r.json();
    return j?.ok ? (j.oferta as OfertaPublica) : null;
  } catch {
    return null;
  }
}

export function datosPublicos(o: OfertaPublica): string[] {
  return datosTarjeta({
    ...OFERTA_VACIA,
    ambito: o.ambito,
    noches_fuera: o.noches_fuera ?? "",
    jornada: o.jornada,
    contrato: o.contrato,
    ventajas: o.ventajas,
    salario_min: String(o.salario_min ?? ""),
    salario_max: String(o.salario_max ?? ""),
    salario_periodo: o.salario_periodo ?? "mes",
    sin_salario: !o.salario_min && !o.salario_max,
  });
}
