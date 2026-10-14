/**
 * Prueba del armado de datos del Perfil de riesgo (PDF), sin Zoho y sin dibujar el PDF.
 * Parte de respuestas de ejemplo -> motor de puntaje -> registro con los nombres de campo de Zoho
 * (la misma forma que devuelve el CRM) -> datos del PDF.
 *   npm run test:pdf
 */
import { calcularDiagnostico } from "../src/lib/puntaje";
import { construirRegistro } from "../src/lib/zoho";
import { CAMPO_RESULTADO } from "../src/lib/zoho-campos";
import { construirPerfilRiesgo, lecturaRapida, nombreDeOrientacion, normalizarNivel } from "../src/lib/perfil-riesgo/build-data";
import { CAMPOS } from "../src/lib/perfil-riesgo/config";

let ok = 0, fail = 0;
const t = (n: string, c: boolean, d?: unknown) => (c ? (ok++, console.log("  ✔", n)) : (fail++, console.log("  ✘", n, d ?? "")));

const resp = {
  p01_motivo: "tristeza", p04_pareja: ["golpes", "insulto"], p05_familiar: "si", p05_tipo: ["fisica"],
  p09_personas: "ninguna", p11_cuidado: "no", p14_emociones: ["tristeza", "miedo"], p17_alertas: ["pensamientos_dano"],
  p19_dinero: "otra_persona", p22_control: "si", p26_barreras: ["internet", "miedo_entrevistas"],
  p28_fortalezas: ["responsabilidad", "equipo"], p29_fortalecer: ["motivacion"],
};
const dx = calcularDiagnostico(resp);
const registro: Record<string, unknown> = {
  ...construirRegistro(resp, dx, new Date("2026-10-05T15:30:00Z")),
  Name: "1000000000",
  Nombre_completo: "Ana María Rojas Díaz",
  Participante_RutaM: { name: "1000000000", id: "6174744000107001007" },
  N_mero_de_tel_fono: "3000000000",
  Email: "ana@ejemplo.com",
};

console.log("Registro diligenciado -> datos del PDF");
const r = construirPerfilRiesgo(registro, { Name: "1000000000", Nombres: "Otro", Apellidos: "Nombre" });
t("se arma sin faltantes", r.ok, !r.ok && r.faltantes);
if (r.ok) {
  const d = r.data;
  t("nivel Alto (las banderas rojas prevalecen)", d.nivel === "Alto");
  t("5 ejes, todos entre 0 y 100", d.ejes.length === 5 && d.ejes.every((e) => e.valor >= 0 && e.valor <= 100), d.ejes);
  t("los ejes coinciden con el motor de puntaje", d.ejes.every((e, i) => e.valor === Math.round(dx.ejes[i].porcentaje)));
  t("puntaje total", d.puntajeTotal === dx.puntajeTotal, d.puntajeTotal);
  t("alerta prioritaria y alerta naranja", d.alertaInmediata && d.alertaControlEconomico);
  t("banderas rojas con el texto del CRM", d.banderas.length === dx.banderasRojas.length && d.banderas.every((b) => /^P\d+ /.test(b)), d.banderas);
  t("intensidad según el nivel", d.intensidad === "2 llamadas y canal abierto");
  t("nombre: el del registro («Nombre completo») tiene prioridad", d.participante === "Ana María Rojas Díaz", d.participante);
  t("documento = nombre del registro", d.documento === "1000000000");
  t("fecha legible", d.fechaDiligenciamiento === "5 de octubre de 2026", d.fechaDiligenciamiento);
  t("contacto copiado al registro", d.telefono === "3000000000" && d.correo === "ana@ejemplo.com");
  t("barreras y fortalezas llegan como listas", d.barreras.length === 2 && d.fortalezas.length === 2 && d.aspectosFortalecer.length === 1);
}

console.log("Casos que no deben generar PDF");
const enviado = { ...registro, [CAMPOS.estado]: "Enlace enviado" };
const r1 = construirPerfilRiesgo(enviado, null);
t("registro sin diligenciar: no se genera", !r1.ok && r1.faltantes.length === 1 && /todavía no diligencia/.test(r1.faltantes[0]), r1);
const sinEje = { ...registro, [CAMPO_RESULTADO.porcentajeEje["3"]]: null };
const r2 = construirPerfilRiesgo(sinEje, null);
t("falta un eje: lo dice", !r2.ok && r2.faltantes.some((f) => /Bienestar/.test(f)), r2);
const sinNivel = { ...registro, [CAMPOS.nivel]: null };
const r3 = construirPerfilRiesgo(sinNivel, null);
t("falta el nivel: lo dice", !r3.ok && r3.faltantes.includes("Nivel de riesgo"), r3);

console.log("Sin datos de Orientación");
const { Nombre_completo: _n, ...sinNombre } = registro;
const r4 = construirPerfilRiesgo(sinNombre, null);
t("sin nombre ni Orientación, el PDF muestra el documento como participante", r4.ok && r4.data.participante === "1000000000");
const r5 = construirPerfilRiesgo(sinNombre, { Primer_nombre: "Ana", Segundo_nombre: "María", Primer_apellido: "Rojas", Segundo_apellido: "Díaz" });
t("registros anteriores (sin «Nombre completo»): se arma desde Orientación", r5.ok && r5.data.participante === "Ana María Rojas Díaz", r5.ok && r5.data.participante);
t("nombre: no detecta campos que no son de nombre", nombreDeOrientacion({ Name: "1", Nombre_de_la_empresa: "X" }) === null);
t("nombre: Primer_nombre/Primer_apellido", nombreDeOrientacion({ Primer_nombre: "Ana", Primer_apellido: "Rojas" }) === "Ana Rojas");

console.log("Detalles");
t("nivel en distintas escrituras", normalizarNivel("ALTO") === "Alto" && normalizarNivel("moderado") === "Moderado" && normalizarNivel("Bajo") === "Bajo" && normalizarNivel("x") === null);
t("lectura rápida: empate entre dos ejes", /ambos/.test(lecturaRapida([{ prosa: "a", valor: 80 }, { prosa: "b", valor: 80 }, { prosa: "c", valor: 10 }])));
t("lectura rápida: menciona otros ejes altos", /También hay puntajes altos en c \(70%\)/.test(lecturaRapida([{ prosa: "a", valor: 90 }, { prosa: "c", valor: 70 }])));
t("motivo «Otro» muestra el texto libre", (() => { const x = construirPerfilRiesgo({ ...registro, [CAMPOS.motivo]: "Otro", [CAMPOS.motivoOtro]: "Un tema puntual" }, null); return x.ok && x.data.motivo === "Otro: Un tema puntual"; })());

console.log(`\n${ok} pruebas OK, ${fail} con fallo`);
process.exit(fail ? 1 : 0);
