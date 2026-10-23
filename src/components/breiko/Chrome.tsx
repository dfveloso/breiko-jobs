import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { LINKS } from "@/lib/provincias";
import logoBlanco from "@/assets/logo_breiko_blanco.png.asset.json";
import logoOscuro from "@/assets/logo_breiko_oscuro.png.asset.json";
import { Placa, LineaCarril, type Producto } from "./Senal";

const PRODUCTS: { id: Producto; desc: string; href: string }[] = [
  { id: "app", desc: "La app de la comunidad de conductores", href: "https://app.breikobreiko.com" },
  { id: "fleet", desc: "Herramientas para flotas", href: "https://fleet.breikobreiko.com" },
  { id: "insights", desc: "Datos del sector del transporte", href: "https://insights.breikobreiko.com" },
  { id: "jobs", desc: "Empleo para conductores", href: "https://jobs.breikobreiko.com" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKey); };
  }, []);
  return (
    <header className="border-b-2 border-asfalto bg-papel">
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-6" aria-label="Principal">
        <span className="flex items-center gap-3">
          <a href={LINKS.matriz} aria-label="Breiko Breiko, inicio">
            <img src={logoOscuro.url} alt="Breiko Breiko" width={64} height={32} className="h-8 w-auto" />
          </a>
          <Placa producto="jobs" tamano="s" />
        </span>
        <div className="flex items-center gap-1 sm:gap-3">
          <div className="relative hidden sm:block" ref={ref}>
            <button type="button" aria-expanded={open} aria-controls="menu-productos" onClick={() => setOpen(!open)} className="flex items-center gap-1 rounded-[6px] px-3 py-2 text-base font-medium text-asfalto hover:underline">
              Productos <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {open && (
              <ul id="menu-productos" className="absolute right-0 top-12 z-50 w-80 rounded-[6px] border-2 border-asfalto bg-blanco">
                {PRODUCTS.map((p) => (
                  <li key={p.id} className="border-b border-linea last:border-0">
                    <a href={p.href} className="flex items-center gap-3 px-4 py-3 hover:bg-papel">
                      <Placa producto={p.id} tamano="s" />
                      <span className="text-base text-gris">{p.desc}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <a href="https://breikobreiko.com/empresa" className="hidden px-3 py-2 text-base font-medium text-asfalto hover:underline sm:block">Empresa</a>
          <a href="#apuntarme" className="rounded-[6px] bg-azul px-4 py-2 text-base font-semibold text-blanco hover:bg-asfalto">Apuntarme</a>
        </div>
      </nav>
    </header>
  );
}

export function StoreButtons({ className = "", oscuro = false }: { className?: string; oscuro?: boolean }) {
  const cls = oscuro
    ? "rounded-[6px] border-2 border-blanco px-4 py-2 text-base font-semibold text-blanco hover:bg-blanco hover:text-asfalto"
    : "rounded-[6px] border-2 border-asfalto px-4 py-2 text-base font-semibold text-asfalto hover:bg-asfalto hover:text-blanco";
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
  const h = "mb-4 font-display text-[24px] font-bold text-blanco";
  const a = "text-base text-blanco/85 underline-offset-4 hover:underline";
  return (
    <footer className="bg-asfalto text-blanco">
      <LineaCarril />
      <div className="mx-auto max-w-[1200px] px-6 pt-12">
        <a href={LINKS.matriz} aria-label="Breiko Breiko, inicio" className="inline-block">
          <img src={logoBlanco.url} alt="Breiko Breiko" width={80} height={40} className="h-10 w-auto" loading="lazy" />
        </a>
      </div>
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div><h2 className={h}>Productos</h2><ul className="space-y-3">{PRODUCTS.map((p) => <li key={p.id}><a href={p.href} className="inline-block"><Placa producto={p.id} tamano="s" /></a></li>)}</ul></div>
        <div><h2 className={h}>Empresa</h2><ul className="space-y-2"><li><a className={a} href="https://breikobreiko.com/empresa">Sobre nosotros</a></li><li><a className={a} href="https://breikobreiko.com/contacto">Contacto</a></li></ul></div>
        <div><h2 className={h}>Legal</h2><ul className="space-y-2">{LEGAL.map(([l, s]) => <li key={s}><a className={a} href={`https://breikobreiko.com/${s}`}>{l}</a></li>)}</ul></div>
        <div><h2 className={h}>Descarga la app</h2><StoreButtons oscuro /></div>
      </div>
      <p className="mx-auto max-w-[1200px] border-t border-blanco/20 px-6 py-6 text-base text-blanco/85">© 2026 Breiko Breiko Apps, S.L., CIF B02736890, Camariñas (A Coruña)</p>
    </footer>
  );
}

export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(localStorage.getItem("bb-cookies") !== "ok"); }, []);
  if (!show) return null;
  return (
    <div role="region" aria-label="Aviso de cookies" className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-xl flex-col gap-3 rounded-[6px] border-2 border-asfalto bg-blanco p-4 text-base text-asfalto sm:flex-row sm:items-center">
      <p className="flex-1">Solo usamos almacenamiento técnico necesario para que la web funcione. <a className="text-azul underline" href={LINKS.cookies}>Política de cookies</a></p>
      <button type="button" onClick={() => { localStorage.setItem("bb-cookies", "ok"); setShow(false); }} className="rounded-[6px] bg-azul px-4 py-2 font-semibold text-blanco">Entendido</button>
    </div>
  );
}
