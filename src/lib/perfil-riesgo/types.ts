export type Nivel = "Bajo" | "Moderado" | "Alto";

export interface EjePerfil {
  id: string;
  lineas: readonly string[];
  prosa: string;
  /** Porcentaje 0 a 100 */
  valor: number;
}

export interface PerfilRiesgoData {
  participante: string;
  documento: string;
  fechaDiligenciamiento: string;
  motivo: string;
  telefono: string;
  correo: string;
  nivel: Nivel;
  /** Puntaje total 0 a 100 (null si no está registrado) */
  puntajeTotal: number | null;
  intensidad: string;
  alertaInmediata: boolean;
  alertaControlEconomico: boolean;
  /** Banderas rojas activas, tal como están en el CRM */
  banderas: string[];
  ejes: EjePerfil[];
  lecturaRapida: string;
  barreras: string[];
  fortalezas: string[];
  aspectosFortalecer: string[];
}
