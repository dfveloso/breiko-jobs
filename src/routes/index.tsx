import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter, CookieNotice } from "@/components/breiko/Chrome";
import { ComoFunciona } from "@/components/breiko/ComoFunciona";
import fFlota from "@/assets/jobs-fondo-flota.webp.asset.json";

const TITLE = "Breiko Jobs · Empleo para conductores profesionales";
const DESC =
  "Estamos preparando ofertas de trabajo de conducción dentro de la app Breiko Breiko. Apúntate y te avisamos el primer día. Gratis para conductores.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://jobs.breikobreiko.com/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://jobs.breikobreiko.com/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-noche">
      <SiteHeader />
      <div className="fondos" aria-hidden="true">
        <img src={fFlota.url} alt="" style={{ objectPosition: "60% 55%" }} decoding="async" />
      </div>
      <div className="velo velo-izq" aria-hidden="true" />
      <main id="contenido" className="portada">
        <section className="escena escena-entrada">
          <div className="copia">
            <h1>¿Buscas conductores?</h1>
            <p className="text-lg">
              Publica tu oferta gratis y sin cuenta: responde unas preguntas, la redactamos por ti y
              llega a los conductores que encajan. Solo pagas si quieres ver el perfil completo de
              un candidato.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/publicar" className="pill pill-primary">
                Publicar una oferta
              </Link>
              <a href="#como-funciona" className="pill pill-secondary">
                Ver cómo funciona
              </a>
            </div>
          </div>
        </section>

        <ComoFunciona />
      </main>
      <SiteFooter />
      <CookieNotice />
    </div>
  );
}
