import { CAMPOS, DIMENSIONES, INTENSIDAD } from "./config";
import type { Nivel, PerfilRiesgoData } from "./types";

/** Desde este puntaje una dimensión se menciona como "alta" en la lectura rápida. */
export const UMBRAL_ALTO = 67;

const NOMBRES_PROSA: Record<string, string> = {
  bienestar: "bienestar emocional",
  violencia: "violencia y tensiones familiares",
  redes: "redes de apoyo",
  consumo: "consumo de sustancias",
  vivienda: "condiciones de vivienda",
  barreras: "barreras de empleabilidad",
};

export type Resultado =
  | { ok: true; data: PerfilRiesgoData }
  | { ok: false; faltantes: string[] };

/** Convierte lookups ({name,id}), listas y números en texto. */
export function texto(v: unknown): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(texto).filter(Boolean).join(", ");
  if (typeof v === "object") return String((v as any).name ?? (v as any).display_value ?? "");
  return String(v).trim();
}

function sinTildes(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function normalizarNivel(v: unknown): Nivel | null {
  const s = sinTildes(texto(v));
  if (s === "alto") return "Alto";
  if (s === "moderado" || s === "medio") return "Moderado";
  if (s === "bajo") return "Bajo";
  return null;
}

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

export function lecturaRapida(dims: { clave: string; valor: number }[]): string {
  const orden = [...dims].sort((a, b) => b.valor - a.valor);
  const max = orden[0].valor;
  if (max <= 0) return "No hay dimensiones con puntaje de riesgo registrado.";
  const tops = orden.filter((d) => d.valor === max);
  const nombres = tops.map((d) => NOMBRES_PROSA[d.clave]);
  let frase =
    tops.length === 1
      ? `La mayor afectación está en ${nombres[0]} (${max}%).`
      : `La mayor afectación está en ${unir(nombres)} (${max}% en ${tops.length === 2 ? "ambas" : "todas"}).`;
  const otras = orden.filter((d) => d.valor < max && d.valor >= UMBRAL_ALTO);
  if (otras.length) {
    frase += ` También hay puntajes altos en ${unir(otras.map((d) => `${NOMBRES_PROSA[d.clave]} (${d.valor}%)`))}.`;
  }
  return frase;
}

/**
 * Arma los datos del PDF a partir del registro psicosocial y del registro de
 * Orientación al que apunta la búsqueda "Participante".
 */
export function construirPerfilRiesgo(
  registro: Record<string, any>,
  orientacion: Record<string, any> | null,
): Resultado {
  const faltantes: string[] = [];

  const participante = texto(orientacion?.[CAMPOS.participanteNombre]) || texto(registro[CAMPOS.participante]);
  if (!participante) faltantes.push("Participante");

  const nivel = normalizarNivel(registro[CAMPOS.nivelRiesgo]);
  if (!nivel) faltantes.push("Nivel de riesgo");

  const dimensiones = DIMENSIONES.map((d) => {
    const crudo = registro[d.campo];
    const n = typeof crudo === "number" ? crudo : parseFloat(String(crudo ?? "").replace(",", "."));
    if (!Number.isFinite(n)) {
      faltantes.push(`Puntaje: ${d.lineas.join(" ")}`);
      return { clave: d.clave, lineas: d.lineas, valor: 0 };
    }
    return { clave: d.clave, lineas: d.lineas, valor: Math.round(Math.min(100, Math.max(0, n))) };
  });

  if (faltantes.length || !nivel) return { ok: false, faltantes };

  const indicadores = CAMPOS.indicadoresCriticos
    .filter((i) => registro[i.campo] === true || sinTildes(texto(registro[i.campo])) === "si")
    .map((i) => i.etiqueta);

  const herr = registro[CAMPOS.herramientas];
  const herramientas = Array.isArray(herr) ? herr.map(texto).filter(Boolean) : texto(herr) ? [texto(herr)] : [];

  return {
    ok: true,
    data: {
      participante,
      documento: texto(registro[CAMPOS.documento]) || "No registrado",
      fechaDiagnostico: fechaLarga(registro[CAMPOS.fechaDiagnostico] ?? registro.Created_Time) || "No registrada",
      motivoAtencion: texto(registro[CAMPOS.motivoAtencion]) || "No registrado",
      profesional: texto(registro[CAMPOS.profesional]) || "No registrada",
      orientadora: texto(registro[CAMPOS.orientadora]) || "No registrada",
      nivel,
      intensidad: INTENSIDAD[nivel],
      indicadores,
      dimensiones,
      lecturaRapida: lecturaRapida(dimensiones),
      herramientas,
      fichaRemisionLista: registro[CAMPOS.fichaRemision] === true || sinTildes(texto(registro[CAMPOS.fichaRemision])) === "si",
    },
  };
}
