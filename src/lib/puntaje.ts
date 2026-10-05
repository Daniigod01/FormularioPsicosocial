/**
 * Motor de puntaje y semaforización — Diagnóstico Psicosocial Ruta Mujer.
 * Implementa la "Ficha técnica de puntaje" (Parte 2) del Formulario de Diagnóstico Psicosocial.
 * SE EJECUTA SOLO EN EL SERVIDOR: el navegador nunca envía el resultado, únicamente las respuestas.
 */
import { limpiarRespuestas, type Respuestas } from "./preguntas";

export type Nivel = "Bajo" | "Moderado" | "Alto";

export type ResultadoEje = {
  id: "1" | "2" | "3" | "4" | "5";
  nombre: string;
  puntos: number;
  maximo: number; // máximo del eje (30/20/20/15/15)
  maximoAplicable: number; // máximo descontando ítems con "prefiero no responder"
  porcentaje: number; // 0-100, para el radar
};

export type BanderaRoja =
  | "P4_violencia_fisica_o_sexual_pareja"
  | "P5_violencia_familiar_fisica_o_sexual"
  | "P17_pensamientos_dano"
  | "P17_consumo_descontrolado"
  | "P17_perdida_control_pensamientos";

export type Diagnostico = {
  ejes: ResultadoEje[];
  puntajeTotal: number;
  nivelPorPuntaje: Nivel;
  nivel: Nivel; // nivel final (las banderas rojas prevalecen)
  banderasRojas: BanderaRoja[];
  alertaPrioritariaInmediata: boolean;
  alertaNaranjaControlEconomico: boolean;
  mostrarLineasEmergencia: boolean;
  motivoPrincipal: string;
  top3Barreras: string[];
  fortalezas: string[];
  aspectosAFortalecer: string[];
};

const arr = (v: Respuestas[string] | undefined): string[] => (Array.isArray(v) ? v : []);
const str = (v: Respuestas[string] | undefined): string => (typeof v === "string" ? v : "");
const tope = (n: number, max: number) => Math.min(n, max);

export function nivelDePuntaje(total: number): Nivel {
  if (total >= 60) return "Alto";
  if (total >= 30) return "Moderado";
  return "Bajo";
}

export function calcularDiagnostico(respuestasCrudas: Respuestas): Diagnostico {
  // Solo cuentan las preguntas visibles según las condiciones del formulario
  const r = limpiarRespuestas(respuestasCrudas);

  // ---------- Eje 1 · Violencias (máx. 30) ----------
  const p4 = arr(r.p04_pareja);
  const conductasPareja = ["insulto", "amenaza", "aislamiento", "control_economico"].filter((v) => p4.includes(v)).length;
  const e1 =
    tope(conductasPareja * 5, 15) + // P4
    (str(r.p05_familiar) === "si" ? 8 : 0) + // P5
    (str(r.p06_laboral) === "si" ? 7 : 0); // P6
  // P7 (comunidad/migración) es informativa: no suma en la ficha técnica

  // ---------- Eje 2 · Redes de apoyo y entorno familiar (máx. 20) ----------
  const p9 = { ninguna: 10, "1_2": 5, "3_mas": 0 }[str(r.p09_personas)] ?? 0;
  const p12 = { si: 5, ocasiones: 3 }[str(r.p12_barrera)] ?? 0;
  const e2 =
    p9 +
    (str(r.p10_grupo) === "no" ? 3 : 0) +
    p12 +
    (str(r.p13_apoyo_cuidado) === "no" ? 2 : 0);

  // ---------- Eje 3 · Bienestar emocional (máx. 20) ----------
  const doble = ["desesperanza", "humillacion", "resentimiento"];
  const p14 = arr(r.p14_emociones)
    .filter((v) => v !== "ninguna")
    .reduce((s, v) => s + (doble.includes(v) ? 2 : 1), 0);
  const p15 = arr(r.p15_situaciones).filter((v) => v !== "ninguna").length;
  const e3 =
    tope(p14, 12) +
    tope(p15, 5) +
    (arr(r.p16_afrontamiento).includes("nada") ? 3 : 0);
  // P3 (tratamiento actual) es informativa: no suma

  // ---------- Eje 4 · Autonomía personal y económica (máx. 15) ----------
  const p18 = { casi_nunca: 4, a_veces: 2 }[str(r.p18_decisiones)] ?? 0;
  const p19 = { otra_persona: 4, conjunto: 2 }[str(r.p19_dinero)] ?? 0;
  const p21 = { no: 2, a_veces: 1 }[str(r.p21_libertad_empleo)] ?? 0;
  const p25 = str(r.p25_vivienda);
  const e4 =
    p18 + p19 +
    (str(r.p20_ahorro) === "no" ? 2 : 0) +
    p21 +
    (p25 === "si" ? 3 : 0);
  // P22 no suma: activa la alerta naranja (A.2)

  // ---------- Eje 5 · Barreras de empleabilidad (máx. 15) ----------
  const barreras = arr(r.p26_barreras);
  const e5 = tope(Math.min(barreras.length, 3) * 4, 12) + (str(r.p27_exp_formal) === "no" ? 3 : 0);

  // "Prefiero no responder" se excluye del cálculo del eje (solo afecta el %, no el puntaje bruto)
  const descuentoE4 = p25 === "prefiero_no" ? 3 : 0;

  const def = [
    { id: "1", nombre: "Violencias", puntos: e1, maximo: 30, descuento: 0 },
    { id: "2", nombre: "Redes de apoyo y entorno familiar", puntos: e2, maximo: 20, descuento: 0 },
    { id: "3", nombre: "Bienestar emocional y manejo de emociones", puntos: e3, maximo: 20, descuento: 0 },
    { id: "4", nombre: "Autonomía personal y económica", puntos: e4, maximo: 15, descuento: descuentoE4 },
    { id: "5", nombre: "Barreras de empleabilidad", puntos: e5, maximo: 15, descuento: 0 },
  ] as const;

  const ejes: ResultadoEje[] = def.map((d) => {
    const maximoAplicable = d.maximo - d.descuento;
    return {
      id: d.id,
      nombre: d.nombre,
      puntos: d.puntos,
      maximo: d.maximo,
      maximoAplicable,
      porcentaje: Math.round((d.puntos / maximoAplicable) * 1000) / 10,
    };
  });

  const puntajeTotal = e1 + e2 + e3 + e4 + e5;
  const nivelPorPuntaje = nivelDePuntaje(puntajeTotal);

  // ---------- Banderas rojas (A) ----------
  const p17 = arr(r.p17_alertas);
  const p5tipo = arr(r.p05_tipo);
  const banderasRojas: BanderaRoja[] = [];
  if (p4.includes("golpes") || p4.includes("sexual_forzado")) banderasRojas.push("P4_violencia_fisica_o_sexual_pareja");
  if (str(r.p05_familiar) === "si" && (p5tipo.includes("fisica") || p5tipo.includes("sexual")))
    banderasRojas.push("P5_violencia_familiar_fisica_o_sexual");
  if (p17.includes("pensamientos_dano")) banderasRojas.push("P17_pensamientos_dano");
  if (p17.includes("consumo_descontrol")) banderasRojas.push("P17_consumo_descontrolado");
  if (p17.includes("perdida_control")) banderasRojas.push("P17_perdida_control_pensamientos");

  // Alerta prioritaria inmediata: todas las banderas excepto el consumo descontrolado
  const alertaPrioritariaInmediata = banderasRojas.some((b) => b !== "P17_consumo_descontrolado");

  // ---------- Alerta naranja (A.2) ----------
  const alertaNaranjaControlEconomico = str(r.p19_dinero) === "otra_persona" && str(r.p22_control) === "si";

  const nivel: Nivel = banderasRojas.length > 0 ? "Alto" : nivelPorPuntaje;

  // Pantalla de líneas de emergencia: cualquiera de las 4 primeras opciones de P17
  const mostrarLineasEmergencia = ["pensamientos_dano", "dormir", "consumo_descontrol", "perdida_control"].some((v) =>
    p17.includes(v)
  );

  return {
    ejes,
    puntajeTotal,
    nivelPorPuntaje,
    nivel,
    banderasRojas,
    alertaPrioritariaInmediata,
    alertaNaranjaControlEconomico,
    mostrarLineasEmergencia,
    motivoPrincipal: str(r.p01_motivo),
    top3Barreras: barreras.slice(0, 3),
    fortalezas: arr(r.p28_fortalezas),
    aspectosAFortalecer: arr(r.p29_fortalecer),
  };
}
