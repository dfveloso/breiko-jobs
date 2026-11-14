import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader, SiteFooter, CookieNotice, StoreButtons } from "@/components/breiko/Chrome";
import { TextoOferta } from "@/components/breiko/OfertaTarjeta";
import { datosPublicos, nombrePermiso, nombresVehiculos, verOferta } from "@/lib/empleo";

// Página pública de una oferta: la que se abre al compartirla desde la app.
// Cualquiera puede verla; para apuntarse hace falta la app de Breiko Breiko.
export const Route = createFileRoute("/oferta/$slug")({
  loader: async ({ params }) => {
    const oferta = await verOferta(params.slug);
    if (!oferta) throw notFound();
    return { oferta };
  },
  head: ({ loaderData }) => {
    const o = loaderData?.oferta;
    const t = o ? `${o.titulo} · ${o.empresa_nombre}` : "Oferta de empleo · Breiko Jobs";
    return {
      meta: [
        { title: t },
        { name: "description", content: o?.resumen ?? "" },
        { property: "og:title", content: t },
        { property: "og:description", content: o?.resumen ?? "" },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(o && !o.abierta ? [{ name: "robots", content: "noindex" }] : []),
      ],
      links: o
        ? [{ rel: "canonical", href: `https://jobs.breikobreiko.com/oferta/${o.slug}` }]
        : [],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-noche">
      <SiteHeader />
      <main id="contenido" className="asistente asistente-una">
        <section className="asistente-pregunta">
          <h1 className="asistente-h1">Esta oferta no existe</h1>
          <p className="asistente-sub">
            Puede que la empresa la haya retirado. En la app de Breiko Breiko verás las ofertas
            abiertas que encajan contigo.
          </p>
          <StoreButtons className="mt-8" />
        </section>
      </main>
    </div>
  ),
  component: OfertaPagina,
});

function OfertaPagina() {
  const { oferta: o } = Route.useLoaderData();
  const datos = datosPublicos(o);
  const requisitos = [
    ...nombresVehiculos(o.vehiculo),
    ...o.permisos.map((p) => `Permiso ${nombrePermiso(p)}`),
    o.experiencia_min
      ? `${o.experiencia_min} ${o.experiencia_min === 1 ? "año" : "años"} de experiencia`
      : "Sin experiencia mínima",
  ].filter(Boolean);
  const hasta = o.caduca
    ? new Date(o.caduca).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        timeZone: "Europe/Madrid",
      })
    : null;

  return (
    <div className="min-h-screen bg-noche">
      <SiteHeader />
      <main id="contenido" className="oferta-pagina">
        <article className="oferta-cuerpo">
          <h1 className="oferta-h1">{o.titulo}</h1>
          <p className="oferta-empresa">
            {o.empresa_nombre} · {o.localidad}, {o.provincia}
          </p>
          <p className="oferta-resumen">{o.resumen}</p>
          {datos.length > 0 && (
            <ul className="oferta-datos">
              {datos.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
          <TextoOferta texto={o.descripcion} className="mt-10" />
        </article>

        <aside className="oferta-lateral" aria-labelledby="apuntarse">
          <div className="tarjeta-form p-8">
            {o.abierta ? (
              <>
                <h2 id="apuntarse" className="text-[28px]">
                  ¿Te interesa?
                </h2>
                <p className="mt-3">
                  Apúntate desde la app de Breiko Breiko: la empresa verá cuánto encajas y, si le
                  interesa tu perfil, te escribirá por el chat.
                </p>
                <ul className="oferta-req">
                  {requisitos.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <StoreButtons className="mt-6" variante="oscura" />
                {hasta ? (
                  <p className="mt-4 text-[15px]">
                    Abierta hasta el {hasta}
                    {o.plazas > 1 ? ` · ${o.plazas} plazas` : ""}.
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <h2 id="apuntarse" className="text-[28px]">
                  Esta oferta ya está cerrada
                </h2>
                <p className="mt-3">
                  En la app de Breiko Breiko te enseñamos las ofertas abiertas que encajan con tu
                  carné y tu zona.
                </p>
                <StoreButtons className="mt-6" variante="oscura" />
              </>
            )}
          </div>
          <p className="mt-6 text-[15px] text-nota">
            ¿Buscas conductores?{" "}
            <Link to="/publicar" className="text-blanco underline">
              Publica tu oferta gratis
            </Link>
            .
          </p>
        </aside>
      </main>
      <SiteFooter />
      <CookieNotice />
    </div>
  );
}
