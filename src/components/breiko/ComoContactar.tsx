import { MODELO_CONTACTOS } from "@/lib/asistente";

export function ComoContactar() {
  return <section className="mt-16 border-t border-border pt-10" aria-labelledby="contacto-titulo">
    <h2 id="contacto-titulo" className="text-[28px] leading-tight">Cómo contactar</h2>
    <ol className="mt-6 grid gap-6 text-base text-secundario md:grid-cols-3">
      <li><span className="mb-3 block font-display text-2xl text-blanco" aria-hidden="true">1.</span>Entra o regístrate gratis en Breiko Fleet: tienes {MODELO_CONTACTOS.gratis} contactos gratis.</li>
      <li><span className="mb-3 block font-display text-2xl text-blanco" aria-hidden="true">2.</span>Le haces tu propuesta con el sueldo y las condiciones. Él decide si acepta.</li>
      <li><span className="mb-3 block font-display text-2xl text-blanco" aria-hidden="true">3.</span>Solo cuenta como contacto si acepta. Si no responde en {MODELO_CONTACTOS.devolucionHoras} horas, te lo devolvemos. Después, con Breiko PRO tienes contactos cada mes.</li>
    </ol>
  </section>;
}