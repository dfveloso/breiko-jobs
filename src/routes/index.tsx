import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Smartphone, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SiteHeader, SiteFooter, CookieNotice } from "@/components/breiko/Chrome";
import { InterestForm, type Perfil } from "@/components/breiko/InterestForm";

const TITLE = "Breiko Jobs · Empleo para conductores profesionales";
const DESC = "Muy pronto, ofertas de trabajo de conducción dentro de Breiko Breiko. Apúntate y sé de los primeros en enterarte. Gratis para conductores.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const CARDS = [
  { icon: MapPin, t: "Ofertas pensadas para ti", d: "Según tu zona, tu tipo de vehículo y tus permisos." },
  { icon: Smartphone, t: "Dentro de la app que ya usas", d: "Sin portales genéricos ni formularios eternos." },
  { icon: ShieldCheck, t: "Tú decides", d: "Tu perfil solo lo ven las empresas si tú quieres." },
];

function Index() {
  const [perfil, setPerfil] = useState<Perfil>("conductor");
  const [modal, setModal] = useState(false);
  const [modalPerfil, setModalPerfil] = useState<Perfil>("conductor");
  const open = (p: Perfil) => { setModalPerfil(p); setModal(true); };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-ink pt-40 pb-28 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-halo-jobs" />
          <div className="relative mx-auto max-w-3xl px-5">
            <span className="inline-block rounded-full border border-jobs/40 bg-jobs/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-jobs">Próximamente</span>
            <h1 className="mt-6 text-display text-ink-foreground">Empleo para conductores <span className="text-jobs">profesionales</span></h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-muted">Muy pronto, ofertas de trabajo de conducción dentro de Breiko Breiko, la app que ya usan miles de camioneros en España. Apúntate y serás de los primeros en enterarte.</p>
            <button type="button" onClick={() => open("conductor")} className="mt-10 rounded-[12px] bg-gradient-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-elegant transition-transform duration-150 hover:-translate-y-0.5">Me interesa</button>
            <p className="mt-3 text-sm text-ink-muted">Gratis para conductores</p>
          </div>
        </section>

        <section className="bg-background py-24">
          <div className="mx-auto grid max-w-6xl gap-5 px-5 md:grid-cols-3">
            {CARDS.map(({ icon: Icon, t, d }) => (
              <article key={t} className="rounded-[20px] border border-border bg-card p-7">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-jobs/15"><Icon className="h-5 w-5 text-foreground" /></span>
                <h2 className="mt-5 text-[22px] text-foreground">{t}</h2>
                <p className="mt-2 text-muted-foreground">{d}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-background pb-24">
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-5 rounded-[20px] border border-ink-border bg-ink p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[22px] text-ink-foreground">¿Buscas conductores?</h2>
              <p className="mt-2 max-w-xl text-ink-muted">Si eres una empresa y necesitas conductores, apúntate también y te contaremos las novedades.</p>
            </div>
            <button type="button" onClick={() => open("empresa")} className="shrink-0 rounded-[12px] border border-jobs/50 px-5 py-3 font-semibold text-ink-foreground transition-colors duration-150 hover:bg-jobs/10">Apuntarme como empresa</button>
          </div>
        </section>

        <section id="me-interesa" className="scroll-mt-16 bg-ink py-24">
          <div className="mx-auto max-w-xl px-5">
            <h2 className="text-center text-[32px] text-ink-foreground sm:text-5xl">Me interesa</h2>
            <p className="mt-3 text-center text-ink-muted">Déjanos tu correo y te avisamos del lanzamiento.</p>
            <div className="mt-10 rounded-[20px] border border-ink-border bg-ink-surface p-6 sm:p-8">
              <InterestForm perfil={perfil} onPerfil={setPerfil} idPrefix="page" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <CookieNotice />

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[20px] border-ink-border bg-ink-surface text-ink-foreground">
          <DialogTitle className="text-[22px] font-extrabold tracking-tight">Me interesa</DialogTitle>
          <DialogDescription className="text-ink-muted">Te avisaremos en cuanto Breiko Jobs esté disponible.</DialogDescription>
          <InterestForm key={String(modal)} perfil={modalPerfil} onPerfil={setModalPerfil} idPrefix="modal" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
