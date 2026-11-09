import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, CookieNotice } from "@/components/breiko/Chrome";
import { WS } from "@/lib/empleo";

// Aquí vuelve la empresa al pulsar «Publicar mi oferta» en el correo
// (breiko-ws/ws/jobs_ofertas.php?confirmar=… redirige con ?slug=…&cuenta=0|1[&ya=1] o ?error=enlace).
type Busqueda = {
  slug?: string | undefined;
  cuenta?: string | undefined;
  ya?: string | undefined;
  error?: string | undefined;
};

export const Route = createFileRoute("/oferta/publicada")({
  validateSearch: (s: Record<string, unknown>): Busqueda => ({
    slug: typeof s["slug"] === "string" ? s["slug"] : undefined,
    cuenta: s["cuenta"] === undefined ? undefined : String(s["cuenta"]),
    ya: s["ya"] === undefined ? undefined : String(s["ya"]),
    error: typeof s["error"] === "string" ? s["error"] : undefined,
  }),
  head: () => ({
    meta: [{ title: "Oferta publicada · Breiko Jobs" }, { name: "robots", content: "noindex" }],
  }),
  component: Publicada,
});

function Publicada() {
  const { slug, cuenta, ya, error } = Route.useSearch();
  const registro = `${WS}/portal/index.html#registro?origen=jobs`;
  const panel = `${WS}/portal/index.html`;

  return (
    <div className="min-h-screen bg-noche">
      <SiteHeader />
      <main id="contenido" className="asistente asistente-una">
        {error || !slug ? (
          <section className="asistente-pregunta">
            <h1 className="asistente-h1">Este enlace ya no sirve</h1>
            <p className="asistente-sub">
              Puede que esté incompleto o que la oferta se haya borrado. Si la publicaste hace poco,
              busca el último correo de Breiko Jobs o vuelve a crearla.
            </p>
            <Link to="/publicar" className="pill pill-primary mt-8">
              Publicar una oferta
            </Link>
          </section>
        ) : (
          <section className="asistente-pregunta">
            <h1 className="asistente-h1">
              {ya ? "Tu oferta ya estaba publicada" : "Tu oferta ya está publicada"}
            </h1>
            <p className="asistente-sub">
              Los conductores que encajan la verán en la pantalla de inicio de la app durante 30
              días. Cuando alguno diga que le interesa, te avisaremos por correo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/oferta/$slug" params={{ slug }} className="pill pill-primary">
                Ver la oferta
              </Link>
              <Link to="/publicar" className="pill pill-secondary">
                Publicar otra
              </Link>
            </div>
            {cuenta === "1" ? (
              <div className="asistente-registro">
                <h2>Ya está en tu cuenta</h2>
                <p>
                  Este correo tiene cuenta de empresa en Breiko. Desde tu panel verás los
                  candidatos, podrás editarla o pausarla y hablar con los conductores.
                </p>
                <a className="pill pill-primary mt-6" href={panel}>
                  Ir a mi panel
                </a>
              </div>
            ) : (
              <div className="asistente-registro">
                <h2>Síguela desde tu cuenta</h2>
                <p>
                  Crea gratis tu cuenta de empresa con el mismo correo y la oferta aparecerá en
                  ella. Desde ahí verás los candidatos, podrás editarla o pausarla y desbloquear los
                  perfiles que te interesen para hablar con ellos por el chat.
                </p>
                <a className="pill pill-primary mt-6" href={registro}>
                  Crear mi cuenta de empresa
                </a>
              </div>
            )}
          </section>
        )}
      </main>
      <CookieNotice />
    </div>
  );
}
