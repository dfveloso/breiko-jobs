export type Producto = "app" | "fleet" | "insights" | "jobs";

const ESTILO: Record<Producto, { label: string; cls: string }> = {
  app: { label: "APP", cls: "bg-azul text-blanco border-blanco" },
  fleet: { label: "Fleet", cls: "bg-verde text-blanco border-blanco" },
  insights: { label: "Insights", cls: "bg-amarillo text-asfalto border-asfalto" },
  jobs: { label: "Jobs", cls: "bg-naranja text-asfalto border-asfalto" },
};

const TAM = {
  s: { outer: "p-[3px] text-[18px]", inner: "px-2 py-0", },
  m: { outer: "p-[3px] text-[24px]", inner: "px-3 py-0.5" },
  l: { outer: "p-[4px] text-[42px]", inner: "px-5 py-1" },
};

export function Placa({ producto, tamano = "m", className = "" }: { producto: Producto; tamano?: "s" | "m" | "l"; className?: string }) {
  const e = ESTILO[producto];
  const t = TAM[tamano];
  return (
    <span className={`inline-flex rounded-[6px] font-display font-bold leading-none ${e.cls.split(" ").slice(0, 2).join(" ")} ${t.outer} ${className}`}>
      <span className={`rounded-[4px] border-2 ${e.cls.split(" ")[2]} ${t.inner} leading-[1.15]`}>{e.label}</span>
    </span>
  );
}

export function LineaCarril({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`h-1 w-full ${className}`}
      style={{ backgroundImage: "linear-gradient(to right, var(--blanco) 24px, transparent 24px)", backgroundSize: "40px 4px", backgroundRepeat: "repeat-x" }} />
  );
}
