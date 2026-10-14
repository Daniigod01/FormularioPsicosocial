/**
 * Configuración del Perfil de riesgo psicosocial.
 *
 * Todo lo que depende de TU Zoho está aquí. Los nombres de API de abajo son
 * suposiciones: ábrelos en Zoho (Configuración > Personalización > Módulos y
 * campos > Psicosocial RutaM v2) o usa `?debug=1` en la ruta para ver los reales,
 * y reemplaza lo que marque "AJUSTAR".
 */

export const MODULO_PSICOSOCIAL =
  process.env.ZOHO_MODULE_PSICOSOCIAL ?? "Psicosocial_RutaM_v2"; // AJUSTAR (nombre de API del módulo)

export const MODULO_ORIENTACION =
  process.env.ZOHO_MODULE_ORIENTACION ?? "Orientacion_RutaM"; // AJUSTAR (módulo al que apunta "Participante")

export const CAMPOS = {
  // Búsqueda (lookup) hacia Orientación RutaM
  participante: "Participante_RutaM", // AJUSTAR
  // Del registro de Orientación: nombre completo y, si hace falta, documento
  participanteNombre: "Name", // AJUSTAR (campo con el nombre en el módulo Orientación)
  // El nombre del registro psicosocial es el número de documento
  documento: "Name",
  fechaDiagnostico: "Fecha_del_diagnostico", // AJUSTAR (si no existe usa Created_Time)
  motivoAtencion: "Motivo_de_atencion", // AJUSTAR
  profesional: "Owner", // propietario del registro; AJUSTAR si hay un campo propio
  orientadora: "Orientadora", // AJUSTAR (opcional)

  nivelRiesgo: "Nivel_de_riesgo", // lista: Bajo / Moderado / Alto

  // Casillas que suben a Alto de forma automática (opcionales)
  indicadoresCriticos: [
    { campo: "Ideacion_suicida", etiqueta: "Ideación suicida" }, // AJUSTAR
    { campo: "Violencia_activa", etiqueta: "Violencia activa" }, // AJUSTAR
    { campo: "Consumo_problematico", etiqueta: "Consumo problemático" }, // AJUSTAR
  ],

  herramientas: "Herramientas_preseleccionadas", // selección múltiple (opcional)
  fichaRemision: "Ficha_de_remision_preparada", // casilla (opcional)
} as const;

/** Las 6 dimensiones de la gráfica, en el orden en que se dibujan (desde arriba, en sentido horario). */
export const DIMENSIONES = [
  { clave: "bienestar", campo: "Puntaje_bienestar_emocional", lineas: ["Bienestar", "emocional"] }, // AJUSTAR campo
  { clave: "violencia", campo: "Puntaje_violencia_tensiones", lineas: ["Violencia y", "tensiones", "familiares"] },
  { clave: "redes", campo: "Puntaje_redes_apoyo", lineas: ["Redes de", "apoyo (déficit)"] },
  { clave: "consumo", campo: "Puntaje_consumo_sustancias", lineas: ["Consumo de", "sustancias"] },
  { clave: "vivienda", campo: "Puntaje_condiciones_vivienda", lineas: ["Condiciones", "de vivienda"] },
  { clave: "barreras", campo: "Puntaje_barreras_empleabilidad", lineas: ["Barreras de", "empleabilidad"] },
] as const;

/** Texto de intensidad según el modelo escalonado de la ruta. */
export const INTENSIDAD: Record<"Bajo" | "Moderado" | "Alto", string> = {
  Bajo: "1 llamada única",
  Moderado: "2 llamadas",
  Alto: "2 llamadas y canal abierto",
};
