/**
 * Prueba del armado de datos de «Mi plan de acompañamiento psicosocial» (PDF para la participante),
 * sin Zoho y sin dibujar el PDF. Parte de respuestas de ejemplo -> motor de puntaje -> registro con los
 * nombres de campo de Zoho -> campos que escribe la profesional -> datos del PDF.
 *   npm run test:plan
 */
import { calcularDiagnostico } from "../src/lib/puntaje";
import { construirRegistro } from "../src/lib/zoho";
import { construirPlanAcompanamiento, estadoParaParticipante, fechaCorta } from "../src/lib/plan-acompanamiento/build-data";
import { CAMPOS_PLAN, CONTACTOS_PROFESIONALES } from "../src/lib/plan-acompanamiento/config";

let ok = 0, fail = 0;
const t = (n: string, c: boolean, d?: unknown) => (c ? (ok++, console.log("  ✔", n)) : (fail++, console.log("  ✘", n, d ?? "")));

const resp = {
  p01_motivo: "tristeza", p04_pareja: ["golpes"], p05_familiar: "no", p09_personas: "1_2", p11_cuidado: "no",
  p14_emociones: ["tristeza", "miedo"], p17_alertas: ["ninguna"], p19_dinero: "otra_persona", p22_control: "si",
  p26_barreras: ["internet", "miedo_entrevistas"], p28_fortalezas: ["responsabilidad", "equipo"], p29_fortalecer: ["motivacion"],
};
const dx = calcularDiagnostico(resp);
const P = CAMPOS_PLAN;
const base: Record<string, unknown> = {
  ...construirRegistro(resp, dx, new Date("2026-10-05T15:30:00Z")),
  Name: "1000000000",
  Participante_RutaM: { name: "1000000000", id: "6174744000107001007" },
  Nombre_completo: "Ana María Rojas Díaz",
  [P.profesional]: "Angelica Posada",
  [P.fechaLlamada1]: "2026-10-12T16:00:00-05:00",
  [P.revision]: "Vimos que estás cargando mucho al tiempo.",
  [P.recomendaciones]: "Duerme a una hora fija.",
  [P.herramientas]: ["Guía de fortalezas", "Cápsula virtual"],
  [P.herramientaOtra]: "Lista de vacantes",
  [P.fechaProximaLlamada]: "2026-10-19",
  [P.canalContacto]: "WhatsApp",
  [P.estadoCaso]: "Remitido",
  [P.metas[0].meta]: "Actualizar mi hoja de vida", [P.metas[0].primerPaso]: "Listar mis trabajos", [P.metas[0].fecha]: "2026-10-12",
  [P.metas[1].meta]: "", [P.metas[1].primerPaso]: "fila vacía", [P.metas[1].fecha]: null, // meta 2 sin escribir: se ignora
  [P.barreras[0].barrera]: "Acceso limitado a internet", [P.barreras[0].estrategia]: "Puntos del programa", [P.barreras[0].apoyo]: "Programa",
};
const orientacion = { Name: "1000000000", Primer_nombre: "Otra", Primer_apellido: "Persona" };

console.log("Registro completo -> datos del PDF");
const r = construirPlanAcompanamiento(base, orientacion);
t("se arma sin faltantes", r.ok, !r.ok && r.faltantes);
if (r.ok) {
  const d = r.data;
  t("nombre: el del registro («Nombre completo») tiene prioridad", d.nombre === "Ana María Rojas Díaz", d.nombre);
  t("profesional = «Psicosocial encargada»; sin contacto configurado, el del programa", d.profesional === "Angelica Posada" && d.contacto === "A través del canal del programa", [d.profesional, d.contacto]);
  CONTACTOS_PROFESIONALES["Angelica Posada"] = "angelica@ejemplo.com";
  const conContacto = construirPlanAcompanamiento(base, orientacion);
  t("con contacto configurado para esa profesional, sale ese", conContacto.ok && conContacto.data.contacto === "angelica@ejemplo.com");
  delete CONTACTOS_PROFESIONALES["Angelica Posada"];
  t("5 ejes", d.ejes.length === 5 && d.ejes[0].lineas.join(" ") === "Seguridad en mis relaciones", d.ejes[0]);
  t("fortalezas y aspectos a fortalecer vienen del diagnóstico", d.fortalezas.length === 2 && d.aFortalecer.length === 1, [d.fortalezas, d.aFortalecer]);
  t("fecha de la llamada 1: solo la fecha, tomada de «L1 Hora de inico»", d.fechaLlamada1 === "12 oct 2026", d.fechaLlamada1);
  t("fecha del diagnóstico en formato corto", d.fechaDiagnostico === "5 oct 2026", d.fechaDiagnostico);
  t("metas: se ignora la fila vacía y la fecha sale corta", d.metas.length === 1 && d.metas[0].fecha === "12 oct 2026", d.metas);
  t("barreras: las 2 que marcó la participante en el formulario; la profesional completó la estrategia de la primera", d.barreras.length === 2 && d.barreras[0].apoyo === "Programa" && d.barreras[1].estrategia === "", d.barreras);
  t("herramientas incluyen «otro recurso»", d.herramientas.length === 3 && d.herramientas[2] === "Lista de vacantes");
  const conOtro = construirPlanAcompanamiento({ ...base, [P.herramientas]: ["Guía de fortalezas", "Otro recurso entregado"] }, orientacion);
  t("la opción «Otro recurso entregado» se reemplaza por el recurso concreto", conOtro.ok && conOtro.data.herramientas.join("|") === "Guía de fortalezas|Lista de vacantes", conOtro.ok && conOtro.data.herramientas);
  t("próximo contacto con fecha y canal", d.proximoContacto?.canal === "WhatsApp" && d.proximoContacto.fecha === "19 de octubre de 2026", d.proximoContacto);
  const json = JSON.stringify(d).toLowerCase();
  t("NO incluye nivel de riesgo, puntajes, banderas ni alertas (es para la participante)", !/nivel|puntaje|bandera|alerta|moderado|riesgo/.test(json), json.match(/nivel|puntaje|bandera|alerta|moderado|riesgo/g));
  t("el estado interno «Remitido» no se muestra", d.estadoRuta === "En acompañamiento" && !json.includes("remitido"), d.estadoRuta);
}

console.log("Estado en la ruta, en palabras para la participante");
t("primer contacto, falta llamada 2", estadoParaParticipante("Primer contacto realizado — pendiente Llamada 2") === "Primer contacto realizado");
t("caso cerrado", estadoParaParticipante("Primer contacto realizado — riesgo Bajo, plan de salida incluido (caso cerrado)") === "Acompañamiento completado");
t("cualquier otro texto interno", estadoParaParticipante("Remitido") === "En acompañamiento" && estadoParaParticipante("") === "En acompañamiento");

console.log("Casos que no deben generar PDF");
const sinRevision = construirPlanAcompanamiento({ ...base, [P.revision]: "" }, orientacion);
t("sin revisión de la profesional", !sinRevision.ok && sinRevision.faltantes.some((f) => /Revisión/.test(f)), sinRevision);
const sinFechaLlamada = construirPlanAcompanamiento({ ...base, [P.fechaLlamada1]: null }, orientacion);
t("sin fecha de la llamada 1: no se genera y lo dice", !sinFechaLlamada.ok && sinFechaLlamada.faltantes.some((f) => /llamada 1/.test(f)), sinFechaLlamada);
const sinMetas = construirPlanAcompanamiento({ ...base, [P.metas[0].meta]: "" }, orientacion);
t("sin metas", !sinMetas.ok && sinMetas.faltantes.some((f) => /meta/.test(f)), sinMetas);
const sinDiligenciar = construirPlanAcompanamiento({ ...base, Estado_del_diagn_stico: "Enlace enviado" }, orientacion);
t("diagnóstico sin diligenciar", !sinDiligenciar.ok && /todavía no diligencia/.test(sinDiligenciar.faltantes[0]), sinDiligenciar);
const { [P.revision]: _quitado, ...sinCampo } = base;
const campoAusente = construirPlanAcompanamiento(sinCampo, orientacion, true);
t("modo completo: dice cuál campo no existe en Zoho", !campoAusente.ok && campoAusente.faltantes.some((f) => f.includes(`no se encontró el campo ${P.revision}`)), campoAusente);

console.log("Nombre de la participante");
const { Nombre_completo: _nc, ...sinNombre } = base;
const conOrient = construirPlanAcompanamiento(sinNombre, { Primer_nombre: "Ana", Segundo_nombre: "María", Primer_apellido: "Rojas", Segundo_apellido: "Díaz" });
t("registros anteriores (sin «Nombre completo»): se arma desde Orientación", conOrient.ok && conOrient.data.nombre === "Ana María Rojas Díaz", conOrient.ok && conOrient.data.nombre);
const soloDoc = construirPlanAcompanamiento(sinNombre, null);
t("sin nombre en ningún lado: el documento", soloDoc.ok && soloDoc.data.nombre === "1000000000");

console.log("Secciones opcionales");
const minimo = construirPlanAcompanamiento({ ...base, [P.profesional]: null, ...Object.fromEntries(P.barreras.map((b) => [b.barrera, ""])), [P.herramientas]: [], [P.herramientaOtra]: "", [P.recomendaciones]: "", [P.fechaProximaLlamada]: null }, orientacion);
t("sin barreras, herramientas, recomendaciones ni próxima llamada: igual se genera", minimo.ok);
if (minimo.ok) {
  t("las secciones vacías quedan vacías (el PDF las omite)", minimo.data.barreras.length === 0 && minimo.data.herramientas.length === 0 && minimo.data.proximoContacto === null && minimo.data.recomendaciones === "");
  t("sin psicosocial encargada: texto por defecto", minimo.data.profesional === "Tu profesional del programa" && minimo.data.contacto === "A través del canal del programa", [minimo.data.profesional, minimo.data.contacto]);
}
t("fecha corta", fechaCorta("2026-01-05") === "5 ene 2026" && fechaCorta("pronto") === "pronto");

console.log(`\n${ok} pruebas OK, ${fail} con fallo`);
process.exit(fail ? 1 : 0);
