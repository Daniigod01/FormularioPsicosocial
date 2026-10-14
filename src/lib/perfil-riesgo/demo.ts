import { EJES, INTENSIDAD } from "./config";
import { lecturaRapida } from "./build-data";
import type { PerfilRiesgoData } from "./types";

/** Datos ficticios para probar el diseño sin tocar Zoho (`?demo=1`). */
export function datosDemo(): PerfilRiesgoData {
  const valores = [53, 75, 60, 33, 67];
  const ejes = EJES.map((e, i) => ({ id: e.id, lineas: e.lineas, prosa: e.prosa, valor: valores[i] }));
  return {
    participante: "Ana María Rojas Díaz",
    documento: "1000000000",
    fechaDiligenciamiento: "21 de septiembre de 2026",
    motivo: "Tristeza, frustración o desánimo",
    telefono: "300 000 0000",
    correo: "ana.rojas@ejemplo.com",
    nivel: "Alto",
    puntajeTotal: 58,
    intensidad: INTENSIDAD.Alto,
    alertaInmediata: false,
    alertaControlEconomico: true,
    banderas: ["P17 Consumo fuera de control"],
    ejes,
    lecturaRapida: lecturaRapida(ejes),
    barreras: ["Falta de apoyo para el cuidado de hijos/as u otras personas a cargo", "Acceso limitado a internet o herramientas tecnológicas"],
    fortalezas: ["Responsabilidad y cumplimiento", "Comunicación asertiva y escucha"],
    aspectosFortalecer: ["Sostener mi motivación en el tiempo"],
  };
}
