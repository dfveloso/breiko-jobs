import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, RefreshCw, UsersRound } from "lucide-react";
import { type ReactNode } from "react";
import { SiteHeader, SiteFooter, CookieNotice } from "@/components/breiko/Chrome";
import { ConductorTarjeta } from "@/components/breiko/ConductorTarjeta";
import { Button } from "@/components/ui/button";
import { validarBusquedaVitrina, vitrinaQueryOptions } from "@/lib/vitrina";

const TITLE = "Conductores disponibles por provincia · Breiko Jobs";
const DESC = "Encuentra conductores de camión y autobús disponibles por provincia. Consulta su experiencia y lo que buscan y hazles tu propuesta con Breiko Fleet.";

export const Route = createFileRoute("/conductores")({
  validateSearch: validarBusquedaVitrina,
  loaderDeps: ({ search }) => ({ provincia: search.provincia, pagina: search.pagina }),
  loader: async ({ context, deps }) => {
    const data = await context.queryClient.ensureQueryData(vitrinaQueryOptions(deps));
    if (deps.provincia === undefined && data.seleccion) {
      throw redirect({ to: "/conductores", search: { provincia: data.seleccion.codigo, pagina: deps.pagina }, replace: true });
    }
  },
  pendingMs: 150,
  pendingComponent: BolsaPendiente,
  errorComponent: BolsaError,
  notFoundComponent: BolsaError,
  head: () => ({
    meta: [
      { title: TITLE }, { name: "description", content: DESC },
      { property: "og:title", content: TITLE }, { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://jobs.breikobreiko.com/conductores" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://jobs.breikobreiko.com/conductores" }],
  }),
  component: Conductores,
});

function BolsaShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-noche">
    <SiteHeader />
    <main id="contenido" className="mx-auto max-w-[1440px] px-[clamp(16px,4vw,56px)] pb-[calc(64px+var(--cookie-reserve))] pt-[112px] md:pb-[calc(96px+var(--cookie-reserve))]">
      <header className="max-w-3xl">
        <h1 className="text-[36px] leading-tight md:text-[56px]">Conductores que buscan trabajo</h1>
        <p className="mt-6 text-lg text-secundario">Perfiles de conductores de camión y autobús que usan la app de Breiko. Ves su experiencia y lo que buscan; su nombre y su foto, cuando acepten tu propuesta</p>
      </header>
      {children}
    </main>
    <SiteFooter /><CookieNotice />
  </div>;
}

function ErrorCarga() {
  const router = useRouter();
  const { queryClient } = Route.useRouteContext();
  return <div role="alert" className="mt-10 border-y border-border py-12">
    <UsersRound className="mb-4 h-8 w-8 text-nota" aria-hidden="true" />
    <h2 className="text-2xl leading-tight">No hemos podido cargar los conductores</h2>
    <Button className="pill pill-primary mt-6" onClick={async () => {
      await queryClient.invalidateQueries({ queryKey: ["vitrina"] });
      await router.invalidate();
    }}><RefreshCw aria-hidden="true" />Reintentar</Button>
  </div>;
}

function BolsaError() { return <BolsaShell><ErrorCarga /></BolsaShell>; }

function BolsaPendiente() {
  return <BolsaShell><div role="status" aria-label="Cargando conductores" className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    {[0, 1, 2].map((i) => <div key={i} aria-hidden="true" className="min-h-[520px] rounded-2xl border border-border bg-panel p-6 motion-safe:animate-pulse">
      <div className="h-16 w-16 rounded-full bg-gris" /><div className="mt-6 h-6 w-3/4 rounded bg-gris" />
      <div className="mt-6 space-y-4">{[0, 1, 2, 3, 4].map((n) => <div key={n} className="h-8 rounded bg-gris" />)}</div>
    </div>)}
    <span className="sr-only">Cargando conductores</span>
  </div></BolsaShell>;
}

function Conductores() {
  const search = Route.useSearch();
  const { data } = useSuspenseQuery(vitrinaQueryOptions(search));
  const { seleccion, lista } = data;
  const cerrada = seleccion && (!seleccion.abierta || lista?.abierta === false);
  return <BolsaShell>
    {data.provincias.length > 0 && <nav aria-label="Provincias" className="mt-10 flex flex-wrap gap-3">
      {data.provincias.map((p) => p.abierta ?
        <Button key={p.codigo} asChild className={`pill ${seleccion?.codigo === p.codigo ? "pill-primary" : "pill-secondary"}`}>
          <Link to="/conductores" search={{ provincia: p.codigo }} aria-current={seleccion?.codigo === p.codigo ? "page" : undefined}>{p.provincia} <span className="tabular-nums">{p.conductores}</span></Link>
        </Button> :
        <Button key={p.codigo} disabled className="pill pill-secondary flex-wrap whitespace-normal text-left">{p.provincia} <span>{p.conductores} · Muy pronto</span></Button>)}
    </nav>}
    {data.error ? <ErrorCarga /> : cerrada ?
      <p role="status" className="mt-10 border-y border-border py-10 text-secundario">Todavía hay pocos conductores en {seleccion.provincia}. Vuelve pronto</p> : !seleccion ?
      <p role="status" className="mt-10 py-10 text-secundario">{search.provincia ? "Esta provincia no está disponible. Elige otra provincia." : "Todavía no hay provincias abiertas. Vuelve pronto."}</p> : lista && <section aria-label={`Conductores en ${lista.provincia}`} className="mt-10">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-display text-2xl font-semibold">{lista.provincia}</p>
          <p className="text-base text-nota">{lista.total} {lista.total === 1 ? "conductor disponible" : "conductores disponibles"}</p>
        </div>
        {lista.conductores.length > 0 ? <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
          {lista.conductores.map((c) => <ConductorTarjeta key={c.ref} conductor={c} contactar={lista.contactar} />)}
        </div> : <p role="status" className="py-10 text-secundario">No hay conductores disponibles en esta página.</p>}
        {lista.paginas > 1 && <nav aria-label="Páginas de conductores" className="mt-8 flex flex-wrap items-center justify-between gap-3">
          {lista.pagina > 1 ? <Button asChild className="pill pill-secondary"><Link to="/conductores" search={{ provincia: lista.codigo, pagina: lista.pagina - 1 }}><ChevronLeft aria-hidden="true" />Anterior</Link></Button> : <Button disabled className="pill pill-secondary"><ChevronLeft aria-hidden="true" />Anterior</Button>}
          <span className="text-base text-nota" aria-live="polite">Página {lista.pagina} de {lista.paginas}</span>
          {lista.pagina < lista.paginas ? <Button asChild className="pill pill-secondary"><Link to="/conductores" search={{ provincia: lista.codigo, pagina: lista.pagina + 1 }}>Siguiente<ChevronRight aria-hidden="true" /></Link></Button> : <Button disabled className="pill pill-secondary">Siguiente<ChevronRight aria-hidden="true" /></Button>}
        </nav>}
      </section>}
    <section className="mt-16 border-t border-border pt-10" aria-labelledby="contacto-titulo">
      <h2 id="contacto-titulo" className="text-[28px] leading-tight">Cómo contactar</h2>
      <ol className="mt-6 grid gap-6 text-base text-secundario md:grid-cols-3">
        <li><span className="mb-3 block font-display text-2xl text-blanco" aria-hidden="true">1.</span>Entra o regístrate gratis en Breiko Fleet: tienes 2 contactos gratis.</li>
        <li><span className="mb-3 block font-display text-2xl text-blanco" aria-hidden="true">2.</span>Le haces tu propuesta con el sueldo y las condiciones. Él decide si acepta.</li>
        <li><span className="mb-3 block font-display text-2xl text-blanco" aria-hidden="true">3.</span>Solo cuenta como contacto si acepta. Si no responde en 72 horas, te lo devolvemos. Después, con Breiko PRO tienes contactos cada mes.</li>
      </ol>
    </section>
  </BolsaShell>;
}