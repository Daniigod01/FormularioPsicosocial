/**
 * Genera un PDF de prueba con datos ficticios, sin tocar Zoho:
 *   npx tsx scripts/preview.tsx   ->  out/perfil-riesgo-ejemplo.pdf
 */
import React from "react";
import fs from "node:fs";
import { renderToBuffer } from "@react-pdf/renderer";
import { PerfilRiesgoPdf } from "../lib/perfil-riesgo/PerfilRiesgoPdf";
import { DIMENSIONES, INTENSIDAD } from "../lib/perfil-riesgo/config";
import { lecturaRapida } from "../lib/perfil-riesgo/build-data";
import type { PerfilRiesgoData } from "../lib/perfil-riesgo/types";

const valores = [55, 100, 100, 50, 0, 67];
const dimensiones = DIMENSIONES.map((d, i) => ({ clave: d.clave, lineas: d.lineas, valor: valores[i] }));

const data: PerfilRiesgoData = {
  participante: "Ana María Rojas Díaz",
  documento: "C.C. 1.000.000.000",
  fechaDiagnostico: "21 de septiembre de 2026",
  motivoAtencion: "Manejo emocional y del estrés",
  profesional: "Laura Martínez",
  orientadora: "Camila Herrera",
  nivel: "Alto",
  intensidad: INTENSIDAD.Alto,
  indicadores: ["Violencia activa"],
  dimensiones,
  lecturaRapida: lecturaRapida(dimensiones),
  herramientas: ["guía de regulación emocional", "cápsula virtual de manejo del estrés", "ruta de violencias de género"],
  fichaRemisionLista: true,
};

fs.mkdirSync("out", { recursive: true });
renderToBuffer(<PerfilRiesgoPdf data={data} ejemplo />).then((buf) => {
  fs.writeFileSync("out/perfil-riesgo-ejemplo.pdf", buf);
  console.log("OK out/perfil-riesgo-ejemplo.pdf", buf.length, "bytes");
});
