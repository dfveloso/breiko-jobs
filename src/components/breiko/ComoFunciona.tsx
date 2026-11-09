import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { OfertaTarjeta } from "@/components/breiko/OfertaTarjeta";

// «Cómo funciona» de la portada, para empresas sin cuenta: una oferta de ejemplo que se
// puede tocar. Nada de lo que se pulsa aquí llama al servidor. Las reglas son las de
// breiko-ws (lib/empleo_app.php y lib/empleo_empresa.php): si cambian allí, cambian aquí.

const PASOS = ["Publicas", "Quién la ve", "Se apunta", "Desbloqueas", "Habláis"];

type Vehiculo = "trailer" | "rigido" | "autobus";
type Ambito = "regional" | "nacional";

const VEHICULOS: Record<Vehiculo, { t: string; chip: string; permiso: string; titulo: string }> = {
  trailer: {
    t: "Tráiler",
    chip: "Tráiler / articulado",
    permiso: "C+E",
    titulo: "Conductor C+E para tráiler",
  },
  rigido: {
    t: "Camión rígido",
    chip: "Camión rígido",
    permiso: "C",
    titulo: "Conductor C para camión rígido",
  },
  autobus: { t: "Autobús", chip: "Autobús", permiso: "D", titulo: "Conductor de autobús" },
};

const CONDUCTORES = [
  { d: "Permisos C y C+E · vive en A Coruña", p: ["C", "C+E"], prov: "A Coruña" },
  { d: "Permiso C · vive en Lugo", p: ["C"], prov: "Lugo" },
  { d: "Permisos C y C+E · vive en Madrid", p: ["C", "C+E"], prov: "Madrid" },
  { d: "Permiso D · vive en A Coruña", p: ["D"], prov: "A Coruña" },
];

// Sin IVA (EMPLEO_BONOS en lib/empleo_empresa.php).
const BONOS = [
  { n: 1, imp: 19 },
  { n: 3, imp: 49 },
  { n: 10, imp: 129 },
  { n: 25, imp: 275 },
];

const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const euros = (v: number) => eur.format(v);

/** El gasto mínimo para cubrir n desbloqueos con los bonos que hay. */
function mejorCompra(n: number) {
  const mejor: { total: number; bonos: number[] }[] = [{ total: 0, bonos: [] }];
  for (let i = 1; i <= n; i++) {
    let elegido: { total: number; bonos: number[] } | undefined;
    for (const b of BONOS) {
      const previo = mejor[Math.max(0, i - b.n)]!;
      const total = previo.total + b.imp;
      if (!elegido || total < elegido.total) elegido = { total, bonos: [...previo.bonos, b.n] };
    }
    mejor[i] = elegido!;
  }
  return mejor[n]!;
}

function Elegir<T extends string>({
  nombre,
  etiqueta,
  valor,
  opciones,
  onCambio,
}: {
  nombre: string;
  etiqueta: string;
  valor: T;
  opciones: [T, string][];
  onCambio: (v: T) => void;
}) {
  return (
    <fieldset className="grupo">
      <legend className="grupo-etiqueta">{etiqueta}</legend>
      <div className="opciones opciones-compactas">
        {opciones.map(([v, t]) => (
          <label key={v} className="opcion">
            <input type="radio" name={nombre} checked={valor === v} onChange={() => onCambio(v)} />
            <span className="opcion-t">{t}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Telefono({ children }: { children: ReactNode }) {
  return (
    <div className="telefono">
      <p className="telefono-cabecera">Tu día</p>
      {children}
    </div>
  );
}

const CUALIDADES = (viajeros: boolean) => [
  "Tiene el permiso que pides",
  viajeros ? "Conduce transporte de viajeros" : "Conduce transporte de mercancías",
  "Se mueve por tu provincia",
  "6 años de experiencia",
];

function Oculto({ viajeros }: { viajeros: boolean }) {
  return (
    <>
      <div className="cf-oculto-cab">
        <p className="cf-afinidad">
          85<span>%</span>
        </p>
        <p>
          de afinidad con tu oferta
          <strong>Perfil oculto</strong>
        </p>
      </div>
      <ul className="cf-cualidades">
        {CUALIDADES(viajeros).map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </>
  );
}

export function ComoFunciona() {
  const [paso, setPaso] = useState(0);
  const [vehiculo, setVehiculo] = useState<Vehiculo>("trailer");
  const [ambito, setAmbito] = useState<Ambito>("regional");
  const [apuntado, setApuntado] = useState(false);
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [dia, setDia] = useState(0);
  const [contesta, setContesta] = useState<"si" | "no">("si");
  const [perfiles, setPerfiles] = useState(4);

  const titulo = useRef<HTMLHeadingElement>(null);
  const riel = useRef<HTMLOListElement>(null);
  const primera = useRef(true);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    titulo.current?.focus({ preventScroll: true });
    const activo = riel.current?.querySelector<HTMLElement>("[aria-current]");
    const lista = riel.current;
    // Solo mueve el riel en horizontal: scrollIntoView arrastraría también la página.
    if (activo && lista)
      lista.scrollLeft = activo.offsetLeft - (lista.clientWidth - activo.offsetWidth) / 2;
  }, [paso]);

  const o = VEHICULOS[vehiculo];
  const viajeros = vehiculo === "autobus";

  const encaja = (c: (typeof CONDUCTORES)[number]): [boolean, string] => {
    if (!c.p.includes(o.permiso)) return [false, `No tiene el permiso ${o.permiso}`];
    if (ambito === "regional" && c.prov !== "A Coruña")
      return [false, "Las rutas son regionales y vive en otra provincia"];
    return [true, "Le sale en la pantalla de inicio de la app"];
  };

  const tarjeta = (acciones?: ReactNode) => (
    <OfertaTarjeta
      titulo={`${o.titulo} desde A Coruña`}
      empresa="Tu empresa"
      lugar="A Coruña"
      permisos={[]}
      vehiculos={[o.chip, `Permiso ${o.permiso}`]}
      datos={[
        ambito === "regional" ? "Rutas regionales" : "Rutas nacionales",
        "Jornada completa",
        "Contrato indefinido",
      ]}
      acciones={acciones}
    />
  );

  const hasta = Math.min(dia + 30, 90);
  const cobrados = Math.max(0, perfiles - 1); // el primero es gratis
  const compra = mejorCompra(cobrados);
  const cuantos = compra.bonos.reduce<Record<number, number>>(
    (t, n) => ({ ...t, [n]: (t[n] ?? 0) + 1 }),
    {},
  );
  const detalleBonos = Object.keys(cuantos)
    .map(Number)
    .sort((a, b) => b - a)
    .map((n) => `${cuantos[n] === 1 ? "un bono" : `${cuantos[n]} bonos`} de ${n}`)
    .join(" y ");
  const comprados = compra.bonos.reduce((t, n) => t + n, 0);
  const sobran = comprados - cobrados;

  let h = "";
  let texto = "";
  let control: ReactNode = null;
  let demo: ReactNode = null;

  if (paso === 0) {
    h = "Contestas unas preguntas y la oferta se escribe sola";
    texto =
      "No necesitas cuenta. Dices qué vehículo llevará, dónde y en qué condiciones, y la redactamos por ti. La revisas, confirmas con el botón del correo que te enviamos y queda publicada 30 días. Publicar es gratis.";
    control = (
      <Elegir
        nombre="cf-vehiculo"
        etiqueta="¿Qué vehículo llevará?"
        valor={vehiculo}
        opciones={Object.entries(VEHICULOS).map(([v, x]) => [v as Vehiculo, x.t])}
        onCambio={setVehiculo}
      />
    );
    demo = <Telefono>{tarjeta()}</Telefono>;
  } else if (paso === 1) {
    h = "La recibe quien puede hacer el trabajo";
    texto =
      "Sale en la app a los conductores con el permiso que pides. Si las rutas son locales o regionales, además, solo a los de esa provincia. También tendrás un enlace para compartirla por WhatsApp o en redes.";
    control = (
      <Elegir
        nombre="cf-ambito"
        etiqueta="¿Qué rutas hará?"
        valor={ambito}
        opciones={[
          ["regional", "Regionales"],
          ["nacional", "Nacionales"],
        ]}
        onCambio={setAmbito}
      />
    );
    demo = (
      <ul className="cf-conductores" aria-live="polite">
        {CONDUCTORES.map((c) => {
          const [si, porque] = encaja(c);
          return (
            <li key={c.d} className={si ? "si" : ""}>
              <strong>{c.d}</strong>
              <span>{porque}</span>
            </li>
          );
        })}
      </ul>
    );
  } else if (paso === 2) {
    h = "Te llega cuánto encaja, sin sus datos";
    texto =
      "Con un toque se apunta y te avisamos por correo. Para verlo, creas gratis tu cuenta de empresa con ese mismo correo y la oferta aparece en ella. Ves su afinidad y lo que encaja de su perfil; su nombre y su teléfono siguen ocultos.";
    control = (
      <div className="cf-panel" aria-live="polite">
        {apuntado ? (
          <div className="cf-entra">
            <Oculto viajeros={viajeros} />
          </div>
        ) : (
          <p className="cf-espera">Pulsa «Me interesa» en el móvil para ver qué te llega a ti.</p>
        )}
      </div>
    );
    demo = (
      <Telefono>
        {tarjeta(
          <>
            <span>No me interesa</span>
            <button
              type="button"
              className="si cf-interesa"
              aria-disabled={apuntado}
              onClick={() => setApuntado(true)}
            >
              {apuntado ? "Apuntado" : "Me interesa"}
            </button>
          </>,
        )}
      </Telefono>
    );
  } else if (paso === 3) {
    h = "Pagas solo por quien te interesa";
    texto =
      "Cada desbloqueo te enseña un perfil completo y abre un chat con ese conductor. El primero es gratis con tu primera oferta. Eliges tú a quién desbloquear, viendo antes cuánto encaja.";
    demo = (
      <div className="cf-panel" aria-live="polite">
        {desbloqueado ? (
          <div className="cf-entra">
            <h4 className="cf-nombre">Conductor de ejemplo</h4>
            <dl className="cf-ficha">
              <div>
                <dt>Carnés</dt>
                <dd>{viajeros ? "D" : "C y C+E"}</dd>
              </div>
              <div>
                <dt>Experiencia</dt>
                <dd>6 años</dd>
              </div>
              <div>
                <dt>Trabajos</dt>
                <dd>Dónde ha trabajado y cuándo</dd>
              </div>
              <div>
                <dt>Certificados</dt>
                <dd>CAP, tacógrafo y ADR, con su caducidad</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>El suyo, mientras el chat esté abierto</dd>
              </div>
            </dl>
          </div>
        ) : (
          <>
            <Oculto viajeros={viajeros} />
            <button
              type="button"
              className="pill pill-primary cf-boton"
              onClick={() => {
                setDesbloqueado(true);
                titulo.current?.focus({ preventScroll: true });
              }}
            >
              Desbloquear su perfil
            </button>
          </>
        )}
      </div>
    );
  } else {
    h = "Le escribes directamente";
    texto =
      "El chat dura 30 días desde que desbloqueas y cada mensaje lo alarga, hasta un máximo de 90. Cuando la conversación se cierra queda en solo lectura y dejas de ver su teléfono y su currículum.";
    control = (
      <div className="cf-garantia">
        <Elegir
          nombre="cf-contesta"
          etiqueta="Le escribes. ¿Contesta en 72 horas?"
          valor={contesta}
          opciones={[
            ["si", "Contesta"],
            ["no", "No contesta"],
          ]}
          onCambio={setContesta}
        />
        <p aria-live="polite">
          {contesta === "si"
            ? "Seguís hablando por el chat."
            : "Te devolvemos el desbloqueo para que lo uses con otro conductor."}
        </p>
      </div>
    );
    demo = (
      <div className="cf-panel">
        <label className="cf-etiqueta" htmlFor="cf-dia">
          Último mensaje: día <output>{dia}</output>
        </label>
        <input
          id="cf-dia"
          className="cf-rango"
          type="range"
          min={0}
          max={90}
          step={5}
          value={dia}
          aria-valuetext={`Día ${dia}`}
          onChange={(e) => setDia(Number(e.target.value))}
        />
        <div className="cf-plazo" aria-hidden="true">
          <span style={{ width: `${(hasta / 90) * 100}%` }} />
        </div>
        <p className="cf-nota" aria-live="polite">
          {dia === 0
            ? "Sin más mensajes, el chat se cierra el día 30."
            : `Con un mensaje el día ${dia}, sigue abierto hasta el día ${hasta}${hasta === 90 ? ", que es el máximo" : ""}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="cf" id="como-funciona">
      <section aria-labelledby="cf-h">
        <h2 id="cf-h" className="cf-h2">
          Cómo encuentras conductor
        </h2>
        <p className="cf-sub">
          Es una oferta de ejemplo: toca lo que quieras, aquí no se publica nada.
        </p>

        <ol className="cf-riel" ref={riel}>
          {PASOS.map((t, i) => (
            <li key={t}>
              <button
                type="button"
                className={i === paso ? "on" : i < paso ? "hecho" : ""}
                aria-current={i === paso ? "step" : undefined}
                onClick={() => setPaso(i)}
              >
                {t}
              </button>
            </li>
          ))}
        </ol>

        <div className="cf-escena">
          <div className="cf-texto" key={`t${paso}`}>
            <h3 ref={titulo} tabIndex={-1}>
              {h}
            </h3>
            <p className="cf-p">{texto}</p>
            {control ? (
              <div className={`cf-control${paso === 2 ? " cf-control-tras" : ""}`}>{control}</div>
            ) : null}
            <div className="cf-nav">
              {paso > 0 ? (
                <button
                  type="button"
                  className="pill pill-secondary"
                  onClick={() => setPaso(paso - 1)}
                >
                  Atrás
                </button>
              ) : null}
              {paso < PASOS.length - 1 ? (
                <button
                  type="button"
                  className="pill pill-primary"
                  onClick={() => setPaso(paso + 1)}
                >
                  Siguiente: {PASOS[paso + 1]!.toLowerCase()}
                </button>
              ) : (
                <Link to="/publicar" className="pill pill-primary">
                  Publicar una oferta
                </Link>
              )}
            </div>
          </div>
          <div className="cf-demo" key={`d${paso}`}>
            {demo}
          </div>
        </div>
      </section>

      <section className="cf-coste" aria-labelledby="cf-coste-h">
        <div>
          <h2 id="cf-coste-h" className="cf-h2">
            Cuánto te costaría
          </h2>
          <p className="cf-p">
            Publicar no cuesta nada. Los desbloqueos van en bonos, se suman entre sí y caducan a los
            12 meses. Se cobran al comprarlos y cada compra lleva su factura.
          </p>
          <ul className="cf-bonos">
            {BONOS.map((b) => (
              <li key={b.n}>
                <span>{b.n === 1 ? "1 desbloqueo" : `${b.n} desbloqueos`}</span>
                <strong>{euros(b.imp)}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div className="cf-panel">
          <label className="cf-etiqueta" htmlFor="cf-perfiles">
            ¿Cuántos perfiles quieres ver? <output>{perfiles}</output>
          </label>
          <input
            id="cf-perfiles"
            className="cf-rango"
            type="range"
            min={1}
            max={30}
            value={perfiles}
            onChange={(e) => setPerfiles(Number(e.target.value))}
          />
          <p className="cf-total" aria-live="polite">
            {euros(compra.total)}
          </p>
          <p className="cf-nota">
            {cobrados === 0
              ? "El primer desbloqueo es gratis con tu primera oferta."
              : `El primero gratis y ${detalleBonos}, sin IVA.${sobran > 0 ? ` ${sobran === 1 ? "Te sobra 1" : `Te sobran ${sobran}`} para otra oferta.` : ""}`}
          </p>
          <Link to="/publicar" className="pill pill-primary cf-boton">
            Publicar una oferta
          </Link>
        </div>
      </section>
    </div>
  );
}
