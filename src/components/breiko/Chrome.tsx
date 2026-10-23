import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { LINKS } from "@/lib/provincias";
import logoBlanco from "@/assets/logo_breiko_blanco.png.asset.json";

const PRODUCTS = [
  { name: "APP", desc: "La app de los camioneros", href: "https://app.breikobreiko.com", color: "bg-app" },
  { name: "Fleet", desc: "Para flotas", href: "https://fleet.breikobreiko.com", color: "bg-fleet" },
  { name: "Insights", desc: "Datos del sector", href: "https://insights.breikobreiko.com", color: "bg-insights" },
  { name: "Jobs", desc: "Empleo para conductores", href: "/", color: "bg-jobs" },
];

export function Logo() {
  return (
    <span className="flex items-center gap-2.5 text-ink-foreground">
      <a href={LINKS.matriz} aria-label="Breiko Breiko">
        <img src={logoBlanco.url} alt="Breiko Breiko" width={67} height={32} className="h-8 w-auto" />
      </a>
      <span className="text-lg font-semibold text-jobs">/ Jobs</span>
    </span>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onClick = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("scroll", onScroll);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("scroll", onScroll); document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKey); };
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-200 ${scrolled ? "border-b border-ink-border bg-ink/80 backdrop-blur-md" : "bg-transparent"}`}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5" aria-label="Principal">
        <Logo />
        <div className="flex items-center gap-1 sm:gap-4">
          <div className="relative hidden sm:block" ref={ref}>
            <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex items-center gap-1 rounded-[12px] px-3 py-2 text-sm text-ink-muted transition-colors hover:text-ink-foreground">
              Productos <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div className="absolute right-0 top-12 grid w-[26rem] grid-cols-2 gap-2 rounded-[20px] border border-ink-border bg-ink-surface p-2 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
                {PRODUCTS.map((p) => (
                  <a key={p.name} href={p.href} className="rounded-[14px] p-3 transition-colors hover:bg-ink">
                    <span className="flex items-center gap-2 font-semibold text-ink-foreground"><span className={`h-2 w-2 rounded-full ${p.color}`} />{p.name}</span>
                    <span className="mt-1 block text-xs text-ink-muted">{p.desc}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
          <a href="https://breikobreiko.com/empresa" className="hidden px-3 py-2 text-sm text-ink-muted hover:text-ink-foreground sm:block">Empresa</a>
          <a href="#me-interesa" className="rounded-[12px] bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform duration-150 hover:-translate-y-0.5">Me interesa</a>
        </div>
      </nav>
    </header>
  );
}

export function StoreButtons({ className = "" }: { className?: string }) {
  const cls = "rounded-[12px] border border-ink-border bg-ink-surface px-4 py-2.5 text-sm font-semibold text-ink-foreground transition-colors hover:border-ink-muted";
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a className={cls} href={LINKS.play} target="_blank" rel="noopener noreferrer">Google Play</a>
      <a className={cls} href={LINKS.appStore} target="_blank" rel="noopener noreferrer">App Store</a>
    </div>
  );
}

const LEGAL = [
  ["Aviso legal", "aviso-legal"], ["Política de privacidad", "politica-privacidad"], ["Política de cookies", "politica-cookies"],
  ["Accesibilidad", "accesibilidad"], ["Términos de uso", "terminos-de-uso"], ["Solicitud de baja", "solicitud-de-baja"],
];

export function SiteFooter() {
  const h = "mb-3 text-sm font-semibold text-ink-foreground";
  const a = "text-sm text-ink-muted hover:text-ink-foreground";
  return (
    <footer className="border-t border-ink-border bg-ink">
      <div className="mx-auto max-w-6xl px-5 pt-14">
        <a href={LINKS.matriz} aria-label="Breiko Breiko"><img src={logoBlanco.url} alt="Breiko Breiko" width={84} height={40} className="h-10 w-auto" loading="lazy" /></a>
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div><h2 className={h}>Productos</h2><ul className="space-y-2">{PRODUCTS.map((p) => <li key={p.name}><a className={a} href={p.href}>{p.name}</a></li>)}</ul></div>
        <div><h2 className={h}>Empresa</h2><ul className="space-y-2"><li><a className={a} href="https://breikobreiko.com/empresa">Sobre nosotros</a></li><li><a className={a} href="https://breikobreiko.com/contacto">Contacto</a></li></ul></div>
        <div><h2 className={h}>Legal</h2><ul className="space-y-2">{LEGAL.map(([l, s]) => <li key={s}><a className={a} href={`https://breikobreiko.com/${s}`}>{l}</a></li>)}</ul></div>
        <div><h2 className={h}>Descarga la APP</h2><StoreButtons /></div>
      </div>
      <p className="border-t border-ink-border px-5 py-6 text-center text-xs text-ink-muted">© 2026 Breiko Breiko Apps, S.L. · CIF B02736890 · Camariñas (A Coruña)</p>
    </footer>
  );
}

export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(localStorage.getItem("bb-cookies") !== "ok"); }, []);
  if (!show) return null;
  return (
    <div role="region" aria-label="Aviso de cookies" className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-xl flex-col gap-3 rounded-[20px] border border-ink-border bg-ink-surface p-4 text-sm text-ink-muted shadow-2xl sm:flex-row sm:items-center">
      <p className="flex-1">Solo usamos almacenamiento técnico necesario para que la web funcione. <a className="text-ink-foreground underline" href={LINKS.cookies}>Política de cookies</a></p>
      <button type="button" onClick={() => { localStorage.setItem("bb-cookies", "ok"); setShow(false); }} className="rounded-[12px] bg-primary px-4 py-2 font-semibold text-primary-foreground">Entendido</button>
    </div>
  );
}
