import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader, SiteFooter, CookieNotice } from "@/components/breiko/Chrome";
import { InterestForm, type Perfil } from "@/components/breiko/InterestForm";
import fAutobus from "@/assets/jobs-fondo-autobus.webp.asset.json";
import fCamionero from "@/assets/jobs-fondo-camionero.webp.asset.json";
import fFlota from "@/assets/jobs-fondo-flota.webp.asset.json";

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
  { t: "Tu perfil, bajo tu control", d: "Tu perfil no será público: tú decidirás qué compartes." },
];

const FOTOS = [
  { src: fCamionero.url, pos: "20% 35%" },
  { src: fAutobus.url, pos: "40% 40%" },
  { src: fFlota.url, pos: "60% 55%" },
];

function Index() {
  const [perfil, setPerfil] = useState<Perfil>("conductor");
  const fondos = useRef<HTMLDivElement>(null);
  const vIzqRef = useRef<HTMLDivElement>(null);
  const vDerRef = useRef<HTMLDivElement>(null);
  const portada = useRef<HTMLDivElement>(null);
  const lateral = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = lateral.current;
    const card = container?.querySelector<HTMLElement>(".tarjeta-form");
    if (!container || !card) return;
    const update = () => {
      container.classList.toggle("lateral-static", card.getBoundingClientRect().height > window.innerHeight - 112 - 24);
    };
    const observer = new ResizeObserver(update);
    observer.observe(card);
    window.addEventListener("resize", update);
    update();
    return () => { observer.disconnect(); window.removeEventListener("resize", update); };
  }, []);

  useEffect(() => {
    const sceneRoot = portada.current, imageRoot = fondos.current;
    const vIzq = vIzqRef.current, vDer = vDerRef.current;
    if (!sceneRoot || !imageRoot || !vIzq || !vDer) return;
    const secs = Array.from(sceneRoot.querySelectorAll<HTMLElement>("section.escena"));
    const imgs = Array.from(imageRoot.querySelectorAll<HTMLImageElement>("img"));
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      const y = scrollY + innerHeight * 0.5;
      let p = 0;
      secs.forEach((s, i) => { const a = s.offsetTop, b = a + s.offsetHeight; if (y >= a) p = i + Math.max(0, Math.min(1, ((y - a) / (b - a) - 0.55) / 0.45)); });
      imgs.forEach((img, k) => {
        img.style.opacity = String(k === 0 ? 1 : Math.max(0, Math.min(1, p - (k - 1))));
        if (!reducido) img.style.transform = `scale(${1.1 - 0.1 * Math.max(0, Math.min(1, (p - k + 1) / 2))})`;
      });
      const der = Math.min(1, secs.reduce((t, s, i) => t + (s.classList.contains("derecha") ? Math.max(0, 1 - Math.abs(p - i)) : 0), 0));
      vDer.style.opacity = String(der);
      vIzq.style.opacity = String(1 - der);
    };
    let raf = 0;
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, []);

  return (
    <div className="min-h-screen bg-noche">
      <SiteHeader />
      <div className="fondos" ref={fondos} aria-hidden="true">
        {FOTOS.map((f, i) => <img key={f.src} src={f.src} alt="" style={{ objectPosition: f.pos }} loading={i === 0 ? "eager" : "lazy"} decoding="async" />)}
      </div>
      <div className="velo velo-izq" ref={vIzqRef} aria-hidden="true" />
      <div className="velo velo-der" ref={vDerRef} aria-hidden="true" />
      <main id="contenido" className="portada" ref={portada}>
        <section className="escena">
          <div className="copia">
            <p className="prod"><i aria-hidden="true" />Breiko Jobs</p>
            <h1>Empleo para conductores profesionales</h1>
            <p className="text-lg">Estamos preparando ofertas de trabajo de conducción dentro de la app Breiko Breiko. Apúntate y te avisamos el primer día.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-base">
              <span className="rounded-full border-[1.5px] border-jobs px-3 py-1 font-medium text-blanco">Próximamente</span>
              <span className="text-nota">Gratis para conductores</span>
            </div>
          </div>
           <div id="apuntarme" ref={lateral} className="lateral scroll-mt-28">
            <div className="tarjeta-form">
              <h2 className="sr-only">Apúntate</h2>
              <InterestForm perfil={perfil} onPerfil={setPerfil} idPrefix="page" />
            </div>
          </div>
        </section>

        <section className="escena derecha">
          <div className="copia">
            <h2>Lo que estamos preparando</h2>
            <ul className="lista-escena">
              {PUNTOS.map(({ t, d }) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}
            </ul>
          </div>
        </section>

        <section className="escena">
          <div className="copia">
            <h2>¿Buscas conductores?</h2>
            <p className="text-lg">Si tu empresa necesita conductores, apúntate también y te contaremos las novedades.</p>
            <a href="#apuntarme" onClick={() => setPerfil("empresa")} className="pill pill-primary mt-8">Apuntar mi empresa</a>
          </div>
        </section>
      </main>
      <SiteFooter />
      <CookieNotice />
    </div>
  );
}
