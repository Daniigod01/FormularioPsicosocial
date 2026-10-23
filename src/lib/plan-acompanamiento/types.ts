import type { EjePerfil } from "../perfil-riesgo/types";

/**
 * Datos del plan que recibe la participante.
 * A propósito NO incluye nivel de riesgo, puntajes, alertas ni banderas rojas: eso es de uso interno.
 */
export interface PlanAcompanamientoData {
  nombre: string;
  documento: string;
  profesional: string;
  contacto: string;
  fechaDiagnostico: string;
  /** Fecha en que se hizo la llamada 1 (sin hora) */
  fechaLlamada1: string;
  estadoRuta: string;
  /** Solo la forma del radar; en el PDF no se muestran los números */
  ejes: EjePerfil[];
  revision: string;
  fortalezas: string[];
  aFortalecer: string[];
  barreras: { barrera: string; estrategia: string; apoyo: string }[];
  metas: { meta: string; primerPaso: string; fecha: string }[];
  herramientas: string[];
  recomendaciones: string;
  proximoContacto: { fecha: string; canal: string } | null;
}
