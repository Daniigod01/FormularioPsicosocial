import preguntasData from "./preguntas_data.json";

export type Opcion = { valor: string; etiqueta: string };

export type TipoCampo = "texto" | "select" | "multiselect";

export type Pregunta = {
  id: string;
  /** Bloque o eje al que pertenece: A (contexto), 1-5 (ejes de puntaje), F (fortalezas y cierre) */
  eje: "A" | "1" | "2" | "3" | "4" | "5" | "F";
  numero: string | number;
  texto: string;
  tipo: TipoCampo;
  opciones?: Opcion[];
  requerido?: boolean;
  ayuda?: string;
  /** Máximo de opciones seleccionables (multiselect) */
  maxSeleccion?: number;
  /** Opciones que, al marcarse, desmarcan todas las demás ("Ninguna…", "Prefiero no responder") */
  exclusivas?: string[];
  condicion?: {
    dependeDe: string;
    /** El padre (select) debe valer alguno de estos */
    mostrarSi?: string[];
    /** El padre (multiselect) debe incluir alguno de estos */
    mostrarSiIncluye?: string[];
  };
};

export const PREGUNTAS: Pregunta[] = preguntasData as Pregunta[];

export const EJES = [
  { id: "A", nombre: "Motivo y contexto de la atención", corto: "Contexto" },
  { id: "1", nombre: "Violencias", corto: "Violencias" },
  { id: "2", nombre: "Redes de apoyo y entorno familiar", corto: "Redes de apoyo" },
  { id: "3", nombre: "Bienestar emocional y manejo de emociones", corto: "Bienestar emocional" },
  { id: "4", nombre: "Autonomía personal y económica", corto: "Autonomía" },
  { id: "5", nombre: "Barreras de empleabilidad", corto: "Barreras" },
  { id: "F", nombre: "Fortalezas y cierre", corto: "Fortalezas" },
] as const;

export function preguntasDeEje(eje: string): Pregunta[] {
  return PREGUNTAS.filter((p) => p.eje === eje);
}

// Respuestas: id de pregunta -> valor (select/texto = string, multiselect = string[])
export type Respuestas = Record<string, string | string[]>;

export function esVisible(p: Pregunta, respuestas: Respuestas): boolean {
  if (!p.condicion) return true;
  const padre = PREGUNTAS.find((x) => x.id === p.condicion!.dependeDe);
  if (padre && !esVisible(padre, respuestas)) return false; // cadena de dependencias
  const valor = respuestas[p.condicion.dependeDe];
  if (p.condicion.mostrarSi) {
    return typeof valor === "string" && p.condicion.mostrarSi.includes(valor);
  }
  if (p.condicion.mostrarSiIncluye) {
    return Array.isArray(valor) && p.condicion.mostrarSiIncluye.some((v) => valor.includes(v));
  }
  return true;
}

export function estaRespondida(p: Pregunta, respuestas: Respuestas): boolean {
  const valor = respuestas[p.id];
  if (p.tipo === "multiselect") return Array.isArray(valor) && valor.length > 0;
  return typeof valor === "string" && valor.trim().length > 0;
}

export function preguntasFaltantes(eje: string, respuestas: Respuestas): Pregunta[] {
  return preguntasDeEje(eje).filter(
    (p) => p.requerido && esVisible(p, respuestas) && !estaRespondida(p, respuestas)
  );
}

/** Deja solo las respuestas de preguntas visibles (descarta lo contestado antes de cambiar una condición). */
export function limpiarRespuestas(respuestas: Respuestas): Respuestas {
  const out: Respuestas = {};
  for (const p of PREGUNTAS) {
    if (esVisible(p, respuestas) && respuestas[p.id] !== undefined) out[p.id] = respuestas[p.id];
  }
  return out;
}
