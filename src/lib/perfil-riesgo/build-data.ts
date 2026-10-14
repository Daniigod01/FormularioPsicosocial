import { CAMPOS, CAMPOS_NOMBRE_ORIENTACION, EJES, ESTADO_DILIGENCIADO, INTENSIDAD, UMBRAL_ALTO } from "./config";
import type { Nivel, PerfilRiesgoData } from "./types";

export type Resultado = { ok: true; data: PerfilRiesgoData } | { ok: false; faltantes: string[] };

/** Convierte búsquedas ({name,id}), listas y números en texto. */
export function texto(v: unknown): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(texto).filter(Boolean).join(", ");
  if (typeof v === "object") return String((v as Record<string, unknown>).name ?? (v as Record<string, unknown>).display_value ?? "");
  return String(v).trim();
}

export const lista = (v: unknown): string[] => (Array.isArray(v) ? v.map(texto).filter(Boolean) : texto(v) ? [texto(v)] : []);

const sinTildes = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function normalizarNivel(v: unknown): Nivel | null {
  const s = sinTildes(texto(v));
  if (s === "alto") return "Alto";
  if (s === "moderado" || s === "medio") return "Moderado";
  if (s === "bajo") return "Bajo";
  return null;
}

export function numero(v: unknown): number | null {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const verdadero = (v: unknown) => v === true || sinTildes(texto(v)) === "si";

export function fechaLarga(v: unknown): string {
  const s = texto(v);
  if (!s) return "";
  const solo = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  const fecha = solo ? new Date(+solo[1], +solo[2] - 1, +solo[3]) : new Date(s);
  if (isNaN(fecha.getTime())) return s;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: solo ? undefined : "America/Bogota" }).format(fecha);
}

export function unir(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

/** Nombre de la participante a partir del registro de Orientación (o null si no se encuentra). */
export function nombreDeOrientacion(orientacion: Record<string, unknown> | null): string | null {
  if (!orientacion) return null;
  let claves = CAMPOS_NOMBRE_ORIENTACION;
  if (!claves.length) {
    // Detección: nombres primero y apellidos después (p. ej. Nombres/Apellidos, Primer_nombre/Primer_apellido)
    const todas = Object.keys(orientacion);
    const nombres = todas.filter((k) => /^(primer_?|segundo_?)?nombres?$|^first_name$|^full_name$/i.test(k));
    const apellidos = todas.filter((k) => /^(primer_?|segundo_?)?apellidos?$|^last_name$/i.test(k));
    claves = [...nombres, ...apellidos];
  }
  const nombre = claves.map((k) => texto(orientacion[k])).filter(Boolean).join(" ");
  return nombre || null;
}

export function lecturaRapida(ejes: { prosa: string; valor: number }[]): string {
  const orden = [...ejes].sort((a, b) => b.valor - a.valor);
  const max = orden[0].valor;
  if (max <= 0) return "Ningún eje tiene puntaje de riesgo.";
  const tops = orden.filter((e) => e.valor === max);
  let frase =
    tops.length === 1
      ? `La mayor afectación está en ${tops[0].prosa} (${max}%).`
      : `La mayor afectación está en ${unir(tops.map((e) => e.prosa))} (${max}% en ${tops.length === 2 ? "ambos" : "todos"}).`;
  const otros = orden.filter((e) => e.valor < max && e.valor >= UMBRAL_ALTO);
  if (otros.length) frase += ` También hay puntajes altos en ${unir(otros.map((e) => `${e.prosa} (${e.valor}%)`))}.`;
  return frase;
}

/**
 * Arma los datos del PDF a partir del registro de «Psicosocial RutaM v2» y, si se pudo leer,
 * del registro de Orientación al que apunta «Participante RutaM».
 */
export function construirPerfilRiesgo(registro: Record<string, unknown>, orientacion: Record<string, unknown> | null): Resultado {
  const faltantes: string[] = [];

  const estado = texto(registro[CAMPOS.estado]);
  if (estado !== ESTADO_DILIGENCIADO) {
    faltantes.push(`La participante todavía no diligencia el formulario (estado actual: ${estado || "sin estado"})`);
  }

  const nivel = normalizarNivel(registro[CAMPOS.nivel]);
  if (!nivel && estado === ESTADO_DILIGENCIADO) faltantes.push("Nivel de riesgo");

  const ejes = EJES.map((e) => {
    const n = numero(registro[e.campo]);
    if (n === null && estado === ESTADO_DILIGENCIADO) faltantes.push(`Porcentaje del eje: ${e.lineas.join(" ")}`);
    return { id: e.id, lineas: e.lineas, prosa: e.prosa, valor: Math.round(Math.min(100, Math.max(0, n ?? 0))) };
  });

  if (faltantes.length || !nivel) return { ok: false, faltantes };

  const documento = texto(registro[CAMPOS.documento]) || "No registrado";
  const motivoBase = texto(registro[CAMPOS.motivo]);
  const motivoOtro = texto(registro[CAMPOS.motivoOtro]);
  const barreras = lista(registro[CAMPOS.barreras]);
  const barreraOtra = texto(registro[CAMPOS.barreraOtra]);

  return {
    ok: true,
    data: {
      participante: texto(registro[CAMPOS.nombreCompleto]) || (nombreDeOrientacion(orientacion) ?? documento),
      documento,
      fechaDiligenciamiento: fechaLarga(registro[CAMPOS.fechaDiligenciamiento]) || "No registrada",
      motivo: (motivoBase === "Otro" && motivoOtro ? `Otro: ${motivoOtro}` : motivoBase) || "No registrado",
      telefono: texto(registro[CAMPOS.telefono]) || "No registrado",
      correo: texto(registro[CAMPOS.correo]) || "No registrado",
      nivel,
      puntajeTotal: numero(registro[CAMPOS.puntajeTotal]),
      intensidad: INTENSIDAD[nivel],
      alertaInmediata: verdadero(registro[CAMPOS.alertaInmediata]),
      alertaControlEconomico: verdadero(registro[CAMPOS.alertaNaranja]),
      banderas: lista(registro[CAMPOS.banderas]),
      ejes,
      lecturaRapida: lecturaRapida(ejes),
      barreras: barreraOtra ? [...barreras.filter((b) => b !== "Otra"), `Otra: ${barreraOtra}`] : barreras,
      fortalezas: lista(registro[CAMPOS.fortalezas]),
      aspectosFortalecer: lista(registro[CAMPOS.aspectosFortalecer]),
    },
  };
}
