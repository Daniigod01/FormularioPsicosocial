"use client";

import { useState } from "react";
import { EJES, esVisible, preguntasDeEje, preguntasFaltantes, type Respuestas } from "@/lib/preguntas";
import PreguntaRenderer from "./PreguntaRenderer";
import LineasApoyo from "./LineasApoyo";

type Paso = "intro" | "A" | "1" | "2" | "3" | "4" | "5" | "F" | "enviado";
const ORDEN: Paso[] = ["intro", "A", "1", "2", "3", "4", "5", "F", "enviado"];

// Página neutra a la que se redirige con el botón "Salir"
const URL_SALIDA = process.env.NEXT_PUBLIC_URL_SALIDA || "https://www.google.com";

const OPCIONES_ALERTA_P17 = ["pensamientos_dano", "dormir", "consumo_descontrol", "perdida_control"];

export default function Home() {
  const [paso, setPaso] = useState<Paso>("intro");
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [acepta, setAcepta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faltantes, setFaltantes] = useState<string[]>([]);
  const [verLineasFinal, setVerLineasFinal] = useState(false);

  function salir() {
    // Nada se guarda en el navegador (solo estado en memoria); replace() evita dejar esta página en el historial
    setRespuestas({});
    window.location.replace(URL_SALIDA);
  }

  function setRespuesta(id: string, valor: string | string[]) {
    setRespuestas((prev) => ({ ...prev, [id]: valor }));
    setFaltantes([]);
  }

  function irA(dir: 1 | -1) {
    setFaltantes([]);
    const i = ORDEN.indexOf(paso) + dir;
    if (i >= 0 && i < ORDEN.length) {
      setPaso(ORDEN[i]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function siguiente() {
    if (paso !== "intro" && paso !== "enviado") {
      const faltan = preguntasFaltantes(paso, respuestas);
      if (faltan.length > 0) {
        setFaltantes(faltan.map((p) => `${p.numero}. ${p.texto}`));
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    irA(1);
  }

  async function enviar() {
    const faltan = preguntasFaltantes("F", respuestas);
    if (faltan.length > 0) {
      setFaltantes(faltan.map((p) => `${p.numero}. ${p.texto}`));
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      // Enlace único enviado por la orientadora: ?t=<token firmado> (prellenado, paso 5)
      const token = new URLSearchParams(window.location.search).get("t");
      const res = await fetch("/api/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respuestas, token }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const base = data.error || "No se pudo enviar. Intenta de nuevo.";
        throw new Error(data.detalle ? `${base} [${data.detalle}]` : base);
      }
      setVerLineasFinal(Boolean(data.mostrarLineasEmergencia));
      setPaso("enviado");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setEnviando(false);
    }
  }

  const esPasoEje = paso !== "intro" && paso !== "enviado";
  const ejeActual = EJES.find((e) => e.id === paso);
  const indice = EJES.findIndex((e) => e.id === paso);
  const pct = esPasoEje ? Math.round(((indice + 1) / EJES.length) * 100) : 0;
  const preguntas = esPasoEje ? preguntasDeEje(paso).filter((p) => esVisible(p, respuestas)) : [];
  const alertaP17 = ((respuestas.p17_alertas as string[]) || []).some((v) => OPCIONES_ALERTA_P17.includes(v));

  const btnPrim =
    "rounded-full bg-[var(--color-amarillo)] px-9 py-3.5 text-base font-bold text-[var(--color-azul)] transition-colors hover:bg-[var(--color-azul)] hover:text-[var(--color-amarillo)] disabled:opacity-50";
  const btnSec =
    "rounded-full border-2 border-[var(--color-azul)] px-8 py-3 text-base font-semibold text-[var(--color-azul)] transition-colors hover:bg-[var(--color-azul-20)]";

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 border-b-4 border-[var(--color-amarillo)] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fci-logo.png" alt="Fundación Colombia Incluyente" className="h-9 w-auto sm:h-12" />
            <div className="h-9 w-px bg-[var(--color-grafito-20)]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-colsubsidio.png" alt="Colsubsidio" className="h-8 w-auto sm:h-11" />
          </div>
          {paso !== "enviado" && (
            <button
              onClick={salir}
              className="rounded-full border-2 border-[var(--color-grafito)] px-5 py-2 text-sm font-bold text-[var(--color-grafito)] hover:bg-[var(--color-grafito)] hover:text-white"
              aria-label="Salir del formulario de inmediato"
            >
              Salir
            </button>
          )}
        </div>
        {esPasoEje && (
          <div className="h-2 bg-[var(--color-azul-20)]">
            <div className="h-full bg-[var(--color-azul)] transition-all" style={{ width: `${pct}%` }} />
          </div>
        )}
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {paso === "intro" && (
          <div className="space-y-6">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-[var(--color-azul)]">
              Diagnóstico psicosocial
            </h1>
            <p className="text-[17px] leading-relaxed">
              Este formulario nos ayuda a conocerte mejor para acompañarte en tu proceso de empleabilidad. No es una
              evaluación clínica ni un examen: no hay respuestas correctas o incorrectas. Tus respuestas son confidenciales y
              serán revisadas por una profesional del programa antes de tu llamada. Te tomará entre 8 y 10 minutos. Si en
              algún momento no deseas responder una pregunta, puedes marcar &quot;prefiero no responder&quot;.
            </p>
            <div className="rounded-xl border-2 border-[var(--color-amarillo)] bg-[var(--color-amarillo-20)] p-5">
              <h2 className="mb-2 text-lg font-bold text-[var(--color-azul)]">Antes de comenzar</h2>
              <p className="text-[17px] leading-relaxed">
                Si en este momento no estás en un lugar donde puedas responder con tranquilidad y privacidad, puedes cerrar
                esta página y volver a hacerlo más adelante, cuando te sea posible. Responder este formulario es
                completamente voluntario: si prefieres no hacerlo, tu profesional puede construir este mismo diagnóstico
                contigo, de forma verbal, en tu primera llamada. El botón <strong>Salir</strong> está siempre visible arriba
                a la derecha.
              </p>
            </div>
            <label className="flex cursor-pointer items-start gap-3 text-base leading-relaxed">
              <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-1 shrink-0" />
              <span>
                {/* TEXTO PROVISIONAL: validar redacción de autorización de tratamiento de datos (Ley 1581 de 2012) con Colsubsidio y la Fundación */}
                Autorizo el tratamiento de mis datos personales y sensibles para fines del acompañamiento psicosocial de Ruta
                Mujer.
              </span>
            </label>
            <button onClick={siguiente} disabled={!acepta} className={btnPrim}>
              Iniciar →
            </button>
          </div>
        )}

        {esPasoEje && (
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--color-azul)]/70">
              Sección {indice + 1} de {EJES.length}
            </p>
            <h2 className="mb-6 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-azul)]">
              {ejeActual?.nombre}
            </h2>

            {faltantes.length > 0 && (
              <div role="alert" className="mb-6 rounded-lg border-2 border-[var(--color-azul)] bg-[var(--color-amarillo-20)] p-4 text-base">
                <p className="mb-1 font-semibold text-[var(--color-azul)]">Faltan por responder:</p>
                <ul className="list-disc space-y-0.5 pl-5">
                  {faltantes.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            )}

            {preguntas.map((p) => (
              <div key={p.id}>
                <PreguntaRenderer pregunta={p} valor={respuestas[p.id]} onChange={(v) => setRespuesta(p.id, v)} />
                {p.id === "p17_alertas" && alertaP17 && (
                  <div className="-mt-2 mb-6"><LineasApoyo destacado /></div>
                )}
              </div>
            ))}

            {error && <p className="mb-4 text-base font-semibold text-red-700">{error}</p>}

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => irA(-1)} className={btnSec}>Volver</button>
              {paso === "F" ? (
                <button onClick={enviar} disabled={enviando} className={btnPrim}>{enviando ? "Enviando…" : "Enviar"}</button>
              ) : (
                <button onClick={siguiente} className={btnPrim}>Siguiente</button>
              )}
            </div>
          </div>
        )}

        {paso === "enviado" && (
          <div className="space-y-6">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-azul)]">Gracias por compartir esta información</h2>
            <p className="text-[17px] leading-relaxed">
              Una profesional la revisará y te llamará en los próximos días para construir juntas tu plan de trabajo.
            </p>
            {verLineasFinal && <LineasApoyo destacado />}
            <p className="text-sm text-[var(--color-grafito)]/70">Ya puedes cerrar esta página.</p>
          </div>
        )}
      </main>
    </div>
  );
}
