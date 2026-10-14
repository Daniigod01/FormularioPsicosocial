export type Nivel = "Bajo" | "Moderado" | "Alto";

export interface Dimension {
  clave: string;
  lineas: readonly string[];
  /** 0 a 100 */
  valor: number;
}

export interface PerfilRiesgoData {
  participante: string;
  documento: string;
  fechaDiagnostico: string;
  motivoAtencion: string;
  profesional: string;
  orientadora: string;
  nivel: Nivel;
  intensidad: string;
  /** Indicadores críticos marcados (por qué subió a Alto) */
  indicadores: string[];
  dimensiones: Dimension[];
  /** Frase automática para la llamada */
  lecturaRapida: string;
  herramientas: string[];
  fichaRemisionLista: boolean;
}
