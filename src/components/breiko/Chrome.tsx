import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { LINKS } from "@/lib/provincias";
import logoBlanco from "@/assets/logo_breiko_blanco.png.asset.json";

type Producto = "app" | "fleet" | "insights" | "jobs";
const PRODUCTS: { id: Producto; nombre: string; color: string; desc: string; href: string }[] = [
  { id: "app", nombre: "APP", color: "bg-app", desc: "La app de la comunidad de conductores", href: "https://app.breikobreiko.com" },
  { id: "fleet", nombre: "Fleet", color: "bg-fleet", desc: "Herramientas para flotas", href: "https://fleet.breikobreiko.com" },
  { id: "insights", nombre: "Insights", color: "bg-insights", desc: "Datos del sector del transporte", href: "https://insights.breikobreiko.com" },
  { id: "jobs", nombre: "Jobs", color: "bg-jobs", desc: "Empleo para conductores", href: "https://jobs.breikobreiko.com" },
];

const Cuadro = ({ c }: { c: string }) => <i aria-hidden="true" className={`inline-block h-3 w-3 shrink-0 rounded-[3px] ${c}`} />;

function ListaProductos({ id }: { id: string }) {
  return (
    <ul id={id} className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-32px))] rounded-2xl border border-white/15 bg-panel p-2 shadow-2xl">
      {PRODUCTS.map((p) => (
        <li key={p.id}>
          <a href={p.href} className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-white/10">
            <Cuadro c={`${p.color} mt-2`} />
            <span><span className="block font-display font-semibold text-blanco">Breiko {p.nombre}</span><span className="block text-base text-nota">{p.desc}</span></span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState<null | "prod" | "movil">(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(null); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKey); };
  }, []);
  const lnk = "rounded-full px-3 py-2 text-base font-medium text-blanco hover:bg-white/10";
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 h-[72px] backdrop-blur-md">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-blanco focus:px-4 focus:py-2 focus:text-noche">Saltar al contenido</a>
      <nav ref={ref} className="flex h-full items-center justify-between gap-2 px-[clamp(16px,4vw,56px)]" aria-label="Principal">
        <span className="flex min-w-0 items-center gap-3">
          <a href={LINKS.matriz} aria-label="Breiko Breiko, inicio" className="shrink-0">
            <img src={logoBlanco.url} alt="Breiko Breiko" width={64} height={32} className="h-8 w-auto" />
          </a>
          <a href="/" className="flex items-center gap-2 font-display text-[20px] font-semibold [font-stretch:108%]"><Cuadro c="bg-jobs" />Jobs</a>
        </span>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative hidden md:block">
            <button type="button" aria-expanded={open === "prod"} aria-controls="menu-productos" onClick={() => setOpen(open === "prod" ? null : "prod")} className={`flex items-center gap-1 ${lnk}`}>
              Productos <ChevronDown className={`h-4 w-4 transition-transform ${open === "prod" ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {open === "prod" && <ListaProductos id="menu-productos" />}
          </div>
          <a href="https://breikobreiko.com/empresa" className={`hidden md:block ${lnk}`}>Empresa</a>
          <div className="relative md:hidden">
            <button type="button" aria-label="Menú" aria-expanded={open === "movil"} aria-controls="menu-movil" onClick={() => setOpen(open === "movil" ? null : "movil")} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            {open === "movil" && (
              <div id="menu-movil" className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-32px))] rounded-2xl border border-white/15 bg-panel p-2 shadow-2xl">
                <p className="px-3 pt-2 text-sm text-nota">Productos</p>
                {PRODUCTS.map((p) => (
                  <a key={p.id} href={p.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/10"><Cuadro c={p.color} />Breiko {p.nombre}</a>
                ))}
                <a href="https://breikobreiko.com/empresa" className="mt-1 block rounded-xl border-t border-white/10 px-3 py-2.5 hover:bg-white/10">Empresa</a>
              </div>
            )}
          </div>
          <a href="#apuntarme" className="pill pill-primary !min-h-[44px] !px-4 sm:!px-6">Apuntarme</a>
        </div>
      </nav>
    </header>
  );
}

export function StoreButtons({ className = "", variante = "secundaria" }: { className?: string; variante?: "secundaria" | "oscura" }) {
  const cls = `pill ${variante === "oscura" ? "pill-oscura" : "pill-secondary"}`;
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
  const h = "mb-4 font-display text-[18px] font-semibold [font-stretch:108%] text-blanco";
  const a = "text-base text-blanco underline-offset-4 hover:underline";
  return (
    <footer className="relative z-10 border-t border-white/10 bg-noche text-nota">
      <div className="grid gap-10 px-[clamp(16px,4vw,56px)] pb-10 pt-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr_1.2fr]">
        <div>
          <a href={LINKS.matriz} aria-label="Breiko Breiko, inicio" className="inline-block">
            <img src={logoBlanco.url} alt="Breiko Breiko" width={80} height={40} className="h-10 w-auto" />
          </a>
          <p className="mt-4 text-base">Tecnología para el transporte por carretera.</p>
          <a className={`${a} mt-2 inline-block underline`} href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
        </div>
        <div><h2 className={h}>Productos</h2><ul className="space-y-2">{PRODUCTS.map((p) => <li key={p.id}><a href={p.href} className={`${a} inline-flex items-center gap-2`}><Cuadro c={p.color} />Breiko {p.nombre}</a></li>)}</ul></div>
        <div><h2 className={h}>Empresa</h2><ul className="space-y-2"><li><a className={a} href="https://breikobreiko.com/empresa">Sobre nosotros</a></li><li><a className={a} href="https://breikobreiko.com/contacto">Contacto</a></li></ul></div>
        <div><h2 className={h}>Legal</h2><ul className="space-y-2">{LEGAL.map(([l, s]) => <li key={s}><a className={a} href={`https://breikobreiko.com/${s}`}>{l}</a></li>)}
          <li><button type="button" className={`${a} text-left`} onClick={() => { localStorage.removeItem("bb-cookies"); window.dispatchEvent(new Event("bb-cookies-open")); }}>Configurar cookies</button></li></ul></div>
        <div><h2 className={h}>Descarga la app</h2><StoreButtons /></div>
      </div>
      <div className="px-[clamp(16px,4vw,56px)]">
        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-base sm:flex-row sm:justify-between">
          <p>© 2026 Breiko Breiko Apps, S.L., CIF B02736890, Camariñas (A Coruña)</p>
          <p>Fotos: Pexels</p>
        </div>
      </div>
    </footer>
  );
}

export function CookieNotice() {
  const [show, setShow] = useState(false);
  const noticeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setShow(localStorage.getItem("bb-cookies") !== "ok");
    const open = () => setShow(true);
    window.addEventListener("bb-cookies-open", open);
    return () => window.removeEventListener("bb-cookies-open", open);
  }, []);
  useEffect(() => {
    const notice = noticeRef.current;
    const root = document.documentElement;
    if (!show || !notice) {
      root.style.setProperty("--cookie-reserve", "0px");
      return;
    }
    const measure = () => {
      const bottom = Number.parseFloat(getComputedStyle(notice).bottom) || 0;
      root.style.setProperty("--cookie-reserve", `${Math.ceil(notice.getBoundingClientRect().height + bottom + 12)}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(notice);
    measure();
    return () => {
      observer.disconnect();
      root.style.setProperty("--cookie-reserve", "0px");
    };
  }, [show]);
  if (!show) return null;
  return (
    <div ref={noticeRef} role="region" aria-label="Aviso de cookies" className="cookie-notice fixed bottom-3 left-3 right-3 z-50 flex items-center gap-3 rounded-2xl border border-border bg-panel p-3 text-sm text-secundario shadow-2xl sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-md sm:p-4 sm:text-base">
      <p className="flex-1">Solo usamos almacenamiento técnico necesario. <a className="text-blanco underline" href={LINKS.cookies}>Política de cookies</a></p>
      <button type="button" onClick={() => { localStorage.setItem("bb-cookies", "ok"); setShow(false); }} className="pill pill-primary cookie-action">Entendido</button>
    </div>
  );
}
