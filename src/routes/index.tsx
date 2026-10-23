import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter, CookieNotice } from "@/components/breiko/Chrome";
import { InterestForm, type Perfil } from "@/components/breiko/InterestForm";
import { Placa } from "@/components/breiko/Senal";

const TITLE = "Breiko Jobs · Empleo para conductores profesionales";
const DESC = "Estamos preparando ofertas de trabajo de conducción dentro de la app Breiko Breiko. Apúntate y te avisamos el primer día. Gratis para conductores.";

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

const PUNTOS = [
  { t: "Ofertas cerca de tu ruta", d: "Según tu zona, tu tipo de vehículo y tus permisos." },
  { t: "Dentro de la app que ya usas", d: "Sin portales genéricos ni formularios eternos." },
  { t: "Tú decides quién te ve", d: "Tu perfil solo lo ven las empresas si tú quieres." },
];

function Index() {
  const [perfil, setPerfil] = useState<Perfil>("conductor");

  return (
    <div className="min-h-screen overflow-x-hidden bg-papel">
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-[1200px] gap-12 px-6 py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-20">
          <div>
            <Placa producto="jobs" tamano="l" />
            <h1 className="mt-8 text-[56px] leading-[0.95] text-asfalto lg:text-[100px]">Empleo para conductores profesionales</h1>
            <p className="mt-6 max-w-[34rem] text-lg text-asfalto">Estamos preparando ofertas de trabajo de conducción dentro de la app Breiko Breiko. Apúntate y te avisamos el primer día.</p>
            <p className="mt-6 flex flex-wrap items-center gap-3 text-base">
              <span className="rounded-[4px] bg-amarillo px-2 py-0.5 font-semibold text-asfalto">Próximamente</span>
              <span className="text-gris">Gratis para conductores</span>
            </p>
          </div>
          <div id="apuntarme" className="scroll-mt-4 self-start rounded-[6px] border-2 border-asfalto bg-blanco">
            <h2 className="sr-only">Apúntate</h2>
            <InterestForm perfil={perfil} onPerfil={setPerfil} idPrefix="page" />
          </div>
        </section>

        <section aria-label="Qué será Breiko Jobs" className="mx-auto max-w-[1200px] px-6 pb-16">
          <ul className="border-t-2 border-asfalto">
            {PUNTOS.map(({ t, d }) => (
              <li key={t} className="grid gap-2 border-b border-linea py-7 md:grid-cols-[1fr_1fr] md:gap-10">
                <h2 className="text-[32px] text-asfalto">{t}</h2>
                <p className="text-lg text-asfalto md:pt-1">{d}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y-2 border-asfalto bg-blanco">
          <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-6 px-6 py-14 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[42px] text-asfalto">¿Buscas conductores?</h2>
              <p className="mt-3 max-w-[38rem] text-lg text-asfalto">Si tu empresa necesita conductores, apúntate también y te contaremos las novedades.</p>
            </div>
            <a href="#apuntarme" onClick={() => setPerfil("empresa")} className="shrink-0 rounded-[6px] border-2 border-asfalto px-5 py-3 text-lg font-semibold text-asfalto hover:bg-asfalto hover:text-blanco">Apuntar mi empresa</a>
          </div>
        </section>
        <div className="h-16" />
      </main>
      <SiteFooter />
      <CookieNotice />
    </div>
  );
}
