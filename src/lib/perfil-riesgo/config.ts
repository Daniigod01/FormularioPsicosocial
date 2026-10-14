/**
 * Perfil de riesgo psicosocial (PDF): de dónde sale cada dato.
 * Casi todo viene de `zoho-campos.ts`, que ya tiene los nombres de API reales del módulo «Psicosocial RutaM v2».
 */
import { CAMPO_PREGUNTA, CAMPO_RESULTADO, ESTADO_DILIGENCIADO, MODULO_ZOHO } from "../zoho-campos";

export { MODULO_ZOHO, ESTADO_DILIGENCIADO };

/** Módulo de las participantes (el nombre del registro es el número de documento). */
export const MODULO_ORIENTACION = "Orientaci_n_Colsubsidios";

/**
 * Campos de Orientación RutaM con el nombre de la participante, en el orden en que se unen
 * (por ejemplo ["Nombres", "Apellidos"]). Si se deja vacío, se intenta detectar solo; si no se
 * encuentra, el PDF muestra el número de documento. Los nombres reales se ven con `&debug=1`.
 */
export const CAMPOS_NOMBRE_ORIENTACION: string[] = [];

/** Contacto que la función del botón copia al registro psicosocial. */
const CAMPO_TELEFONO = "N_mero_de_tel_fono";
const CAMPO_CORREO = "Email";

export const CAMPOS = {
  documento: CAMPO_RESULTADO.nombre, // «Name» = número de documento
  participante: CAMPO_RESULTADO.participante, // búsqueda a Orientación RutaM
  estado: CAMPO_RESULTADO.estado,
  fechaDiligenciamiento: CAMPO_RESULTADO.fechaDiligenciamiento,
  nivel: CAMPO_RESULTADO.nivel,
  puntajeTotal: CAMPO_RESULTADO.puntajeTotal,
  banderas: CAMPO_RESULTADO.banderas,
  alertaInmediata: CAMPO_RESULTADO.alertaInmediata,
  alertaNaranja: CAMPO_RESULTADO.alertaNaranja,
  motivo: CAMPO_PREGUNTA.p01_motivo,
  motivoOtro: CAMPO_PREGUNTA.p01_otro,
  barreras: CAMPO_PREGUNTA.p26_barreras,
  barreraOtra: CAMPO_PREGUNTA.p26_otra,
  fortalezas: CAMPO_PREGUNTA.p28_fortalezas,
  aspectosFortalecer: CAMPO_PREGUNTA.p29_fortalecer,
  telefono: CAMPO_TELEFONO,
  correo: CAMPO_CORREO,
} as const;

/** Campos que se piden a Zoho (solo lo necesario). */
export const CAMPOS_A_LEER: string[] = [
  ...Object.values(CAMPOS),
  ...Object.values(CAMPO_RESULTADO.porcentajeEje),
  ...Object.values(CAMPO_RESULTADO.puntajeEje),
];

/** Los 5 ejes del diagnóstico, en el orden en que se dibujan (desde arriba, en sentido horario). */
export const EJES = [
  { id: "1", campo: CAMPO_RESULTADO.porcentajeEje["1"], lineas: ["Violencias"], prosa: "violencias" },
  { id: "2", campo: CAMPO_RESULTADO.porcentajeEje["2"], lineas: ["Redes de apoyo", "y entorno", "familiar"], prosa: "redes de apoyo y entorno familiar" },
  { id: "3", campo: CAMPO_RESULTADO.porcentajeEje["3"], lineas: ["Bienestar", "emocional"], prosa: "bienestar emocional" },
  { id: "4", campo: CAMPO_RESULTADO.porcentajeEje["4"], lineas: ["Autonomía", "personal y", "económica"], prosa: "autonomía personal y económica" },
  { id: "5", campo: CAMPO_RESULTADO.porcentajeEje["5"], lineas: ["Barreras de", "empleabilidad"], prosa: "barreras de empleabilidad" },
] as const;

/** Intensidad de acompañamiento según el modelo escalonado de la ruta. */
export const INTENSIDAD = {
  Bajo: "1 llamada única",
  Moderado: "2 llamadas",
  Alto: "2 llamadas y canal abierto",
} as const;

/** Desde este porcentaje un eje se menciona como «alto» en la lectura rápida. */
export const UMBRAL_ALTO = 67;
