import { EJES_PLAN } from "./config";
import type { PlanAcompanamientoData } from "./types";

/** Datos ficticios para probar el diseño sin tocar Zoho (`?demo=1`). */
export function datosDemoPlan(): PlanAcompanamientoData {
  const valores = [53, 75, 60, 33, 67];
  return {
    nombre: "Ana María Rojas Díaz",
    documento: "1000000000",
    profesional: "Laura Martínez",
    contacto: "laura.martinez@ejemplo.com",
    fechaDiagnostico: "21 sep 2026",
    fechaLlamada1: "24 sep 2026",
    estadoRuta: "Primer contacto realizado",
    ejes: EJES_PLAN.map((e, i) => ({ id: e.id, lineas: e.lineas, prosa: e.prosa, valor: valores[i] })),
    revision:
      "Ana María, vimos que estás cargando mucho al tiempo: el cuidado de tu familia, la búsqueda de empleo y el cansancio de las últimas semanas. " +
      "Acordamos enfocarnos en tres cosas: recuperar tu energía con pausas pequeñas durante el día, apoyarte en tu red cercana para el cuidado " +
      "y ordenar tu hoja de vida para empezar a postularte con más seguridad.",
    fortalezas: ["Responsabilidad y cumplimiento", "Comunicación asertiva y escucha", "Compromiso con lo que haces"],
    aFortalecer: ["Sostener tu motivación en el tiempo", "Terminar lo que empiezas", "Seguridad para decidir"],
    barreras: [
      { barrera: "Falta de apoyo para el cuidado de hijos/as u otras personas a cargo", estrategia: "Acordar un horario de cuidado compartido con una persona de confianza", apoyo: "Tu hermana y tu profesional" },
      { barrera: "Acceso limitado a internet o herramientas tecnológicas", estrategia: "Usar los puntos de acceso del programa para postularte", apoyo: "Programa Ruta Mujer" },
      { barrera: "Miedo o inseguridad para presentarte a entrevistas", estrategia: "Practicar una entrevista simulada en la próxima llamada", apoyo: "Tu profesional" },
    ],
    metas: [
      { meta: "Actualizar mi hoja de vida", primerPaso: "Escribir mis tres últimos trabajos y lo que aprendí", fecha: "28 sep 2026" },
      { meta: "Postularme a 3 vacantes", primerPaso: "Elegir las vacantes que me interesan en el portal", fecha: "2 oct 2026" },
      { meta: "Hacer una pausa activa cada día", primerPaso: "Poner una alarma a media mañana", fecha: "30 sep 2026" },
    ],
    herramientas: [
      "Guía autoaplicable de reconocimiento de fortalezas y logros",
      "Cápsula virtual: «Mi valor en el mundo laboral»",
      "Guía de técnicas breves de regulación emocional",
    ],
    recomendaciones:
      "Intenta dormir a una hora fija esta semana, aunque sea un poco más temprano. Cuando sientas que todo se junta, escribe en un papel lo que más te pesa y escoge solo una cosa para hoy.",
    proximoContacto: { fecha: "5 de octubre de 2026", canal: "Llamada" },
  };
}
