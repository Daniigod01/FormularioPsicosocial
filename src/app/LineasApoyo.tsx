export default function LineasApoyo({ destacado = false }: { destacado?: boolean }) {
  const linea = "flex items-center justify-between rounded-lg bg-white px-4 py-3 text-base font-semibold text-[var(--color-azul)] shadow-sm";
  return (
    <div className={"rounded-xl border-2 p-5 " + (destacado ? "border-[var(--color-azul)] bg-[var(--color-amarillo-20)]" : "border-[var(--color-azul-20)] bg-[var(--color-azul-20)]/40")}>
      <p className="mb-3 text-base leading-relaxed text-[var(--color-grafito)]">
        Si marcaste alguna de estas opciones, una profesional se pondrá en contacto contigo el mismo día hábil. Si en este
        momento sientes que estás en riesgo, comunícate directamente con estas líneas:
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <a href="tel:106" className={linea}><span>Línea 106</span><span className="text-sm font-normal">Salud mental</span></a>
        <a href="tel:155" className={linea}><span>Línea 155</span><span className="text-sm font-normal">Violencias contra la mujer</span></a>
        <a href="tel:123" className={linea}><span>Línea 123</span><span className="text-sm font-normal">Emergencias</span></a>
      </div>
    </div>
  );
}
