/**
 * «Mi plan de acompañamiento psicosocial» (PDF para la participante): de dónde sale cada dato.
 * Lo que viene del diagnóstico ya tiene sus campos en `zoho-campos.ts`. Lo que escribe la profesional en la llamada 1 está
 * en el módulo «Psicosocial RutaM v2», sección «Plan de trabajo y acompañamiento» (ver docs/pdf-plan-acompanamiento.md).
 * Verificado contra los campos reales del módulo el 14-oct-2026: todos los nombres de abajo existen.
 */
import { EJES as EJES_PERFIL } from "../perfil-riesgo/config";

/** Metas y barreras: 3 juegos de campos numerados, creados en Zoho el 14-oct-2026 (sección «Plan de trabajo y acompañamiento»). */
const juegos = [1, 2, 3];

export const CAMPOS_PLAN = {
  // ---- Lo escribe la profesional (creados en Zoho el 14-oct-2026) ----
  revision: "Revisi_n_profesional", // ✔ texto largo, «Revisión profesional»
  recomendaciones: "Recomendaciones_del_plan", // ✔ texto largo, «Recomendaciones del plan»

  // ---- Ya existían en Zoho ----
  /** Fecha de la llamada 1: se toma de «L1 Hora de inico» (fecha y hora de inicio; el nombre de API conserva la errata «inico»). */
  fechaLlamada1: "L1_Hora_de_inico", // ✔ fecha y hora; en el PDF solo se muestra la fecha
  herramientas: "L1_Herramientas_y_recursos_entregados", // ✔ lista de selección múltiple
  herramientaOtra: "L1_Otro_recurso_cu_l", // ✔ texto de una línea (opcional)
  fechaProximaLlamada: "L1_Fecha_agendada_Llamada_2", // ✔ fecha
  canalContacto: "L1_Canal_de_contacto_preferido", // ✔ lista
  estadoCaso: "Estado_del_caso_Llamada_1", // ✔ lista

  /** Quién acompaña: lista «Psicosocial encargada» (sección Llamada 1; opciones Angelica Posada y Johana Diaz). */
  profesional: "Psicosocial_encargada", // ✔ creado en Zoho el 14-oct-2026

  // ---- Metas (hasta 3) y barreras (hasta 3) ----
  metas: juegos.map((n) => ({ meta: `Meta_${n}`, primerPaso: `Primer_paso_meta_${n}`, fecha: `Fecha_l_mite_meta_${n}` })),
  barreras: juegos.map((n) => ({ barrera: `Barrera_${n}`, estrategia: `Estrategia_barrera_${n}`, apoyo: `Qui_n_apoya_barrera_${n}` })),
} as const;

/**
 * Contacto de cada psicosocial encargada, tal como aparece en la lista (por ejemplo "Angelica Posada": "correo o teléfono").
 * Lo que se ponga aquí sale en «Contacto de la profesional». Si una no está aquí, el plan dice que el contacto es el canal del programa.
 */
export const CONTACTOS_PROFESIONALES: Record<string, string> = {};

/** Los 5 ejes con los nombres que lee la participante (el orden es el mismo del radar del perfil). */
const NOMBRES_PARTICIPANTE: Record<string, readonly string[]> = {
  "1": ["Seguridad en mis", "relaciones"],
  "2": ["Redes de apoyo", "y entorno", "familiar"],
  "3": ["Bienestar", "emocional"],
  "4": ["Autonomía", "personal y", "económica"],
  "5": ["Barreras de", "empleabilidad"],
};
export const EJES_PLAN = EJES_PERFIL.map((e) => ({ ...e, lineas: NOMBRES_PARTICIPANTE[e.id] }));

/** Textos fijos del documento. */
export const TEXTOS = {
  introMapa:
    "Así se ve, de un vistazo, lo que compartiste en tu diagnóstico. No es una calificación: es un mapa para saber en qué áreas vamos a enfocar el acompañamiento contigo.",
  introRevision:
    "Tu profesional revisó con calma la información de tu diagnóstico antes de esta llamada, y estas son las áreas en las que acordamos enfocar tu acompañamiento:",
  introHerramientas: "Estos son los recursos que conversamos en la llamada. Puedes usarlos las veces que quieras.",
  introRecomendaciones: "Además de las herramientas, tu profesional te deja estas recomendaciones puntuales:",
  lineasApoyo:
    "Si en cualquier momento antes de esa fecha necesitas hablar con alguien, puedes escribirnos al canal de contacto del programa. También recuerda que la Línea 106 te acompaña las 24 horas para hablar sobre tu bienestar emocional, Línea 123 está disponible para cualquier emergencia. Línea 155 para casos relacionados con violencias.",
  cierre: "Estás construyendo tu camino con tus propias fortalezas. Un paso a la vez.",
  contactoPorDefecto: "A través del canal del programa",
} as const;

/** Los campos que se piden a Zoho para este documento. */
export const CAMPOS_PLAN_A_LEER: string[] = [
  CAMPOS_PLAN.revision, CAMPOS_PLAN.recomendaciones, CAMPOS_PLAN.herramientas, CAMPOS_PLAN.herramientaOtra,
  CAMPOS_PLAN.fechaLlamada1, CAMPOS_PLAN.fechaProximaLlamada, CAMPOS_PLAN.canalContacto, CAMPOS_PLAN.estadoCaso, CAMPOS_PLAN.profesional,
  ...CAMPOS_PLAN.metas.flatMap((m) => [m.meta, m.primerPaso, m.fecha]),
  ...CAMPOS_PLAN.barreras.flatMap((b) => [b.barrera, b.estrategia, b.apoyo]),
];
