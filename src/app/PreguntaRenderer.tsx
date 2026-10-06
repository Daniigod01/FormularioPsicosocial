"use client";

import { type Pregunta } from "@/lib/preguntas";

type Valor = string | string[] | undefined;

function Etiqueta({ p }: { p: Pregunta }) {
  return (
    <div className="mb-2.5">
      <label className="block text-[17px] font-medium leading-snug text-[var(--color-grafito)]">
        <span className="mr-1 font-bold text-[var(--color-azul)]">{p.numero}.</span> {p.texto}
        {p.requerido && <span className="ml-1 font-bold text-[var(--color-azul)]">*</span>}
      </label>
      {p.maxSeleccion && (
        <p className="mt-1 text-sm text-[var(--color-grafito)]">Puedes marcar máximo {p.maxSeleccion} opciones.</p>
      )}
    </div>
  );
}

const clsOpcion = (activa: boolean) =>
  "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-base transition-colors " +
  (activa
    ? "border-[var(--color-azul)] bg-[var(--color-azul-20)]"
    : "border-[var(--color-grafito-20)] bg-white hover:border-[var(--color-azul)]");

export default function PreguntaRenderer({
  pregunta: p,
  valor,
  onChange,
}: {
  pregunta: Pregunta;
  valor: Valor;
  onChange: (v: string | string[]) => void;
}) {
  if (p.tipo === "texto") {
    const larga = !p.texto.startsWith("Otr") && !p.texto.startsWith("¿Cuál");
    const comun =
      "w-full rounded-lg border border-[var(--color-grafito-20)] bg-white px-4 py-2.5 text-base text-[var(--color-grafito)] focus:border-[var(--color-azul)]";
    return (
      <div className="mb-6">
        <Etiqueta p={p} />
        {larga ? (
          <textarea rows={3} value={(valor as string) || ""} onChange={(e) => onChange(e.target.value)} className={comun} />
        ) : (
          <input type="text" value={(valor as string) || ""} onChange={(e) => onChange(e.target.value)} className={comun} />
        )}
      </div>
    );
  }

  if (p.tipo === "select") {
    return (
      <fieldset className="mb-6">
        <Etiqueta p={p} />
        <div className="space-y-2">
          {p.opciones?.map((op) => (
            <label key={op.valor} className={clsOpcion(valor === op.valor)}>
              <input type="radio" name={p.id} checked={valor === op.valor} onChange={() => onChange(op.valor)} className="mt-1 shrink-0" />
              <span>{op.etiqueta}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  // multiselect
  const sel = (valor as string[]) || [];
  const exclusivas = p.exclusivas || [];
  const llegoAlMax = p.maxSeleccion ? sel.length >= p.maxSeleccion : false;

  function toggle(v: string) {
    if (sel.includes(v)) return onChange(sel.filter((x) => x !== v));
    if (exclusivas.includes(v)) return onChange([v]); // "Ninguna…" desmarca todo lo demás
    const sinExclusivas = sel.filter((x) => !exclusivas.includes(x)); // marcar algo real desmarca "Ninguna…"
    if (p.maxSeleccion && sinExclusivas.length >= p.maxSeleccion) return;
    onChange([...sinExclusivas, v]);
  }

  return (
    <fieldset className="mb-6">
      <Etiqueta p={p} />
      <div className="space-y-2">
        {p.opciones?.map((op) => {
          const marcada = sel.includes(op.valor);
          const bloqueada = llegoAlMax && !marcada && !exclusivas.includes(op.valor);
          return (
            <label key={op.valor} className={clsOpcion(marcada) + (bloqueada ? " cursor-not-allowed opacity-50" : "")}>
              <input type="checkbox" checked={marcada} disabled={bloqueada} onChange={() => toggle(op.valor)} className="mt-1 shrink-0" />
              <span>{op.etiqueta}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
