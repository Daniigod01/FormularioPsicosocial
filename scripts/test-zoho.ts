import { PREGUNTAS } from "../src/lib/preguntas";
import { calcularDiagnostico } from "../src/lib/puntaje";
import { construirRegistro, firmarToken, verificarToken } from "../src/lib/zoho";
import { CAMPO_PREGUNTA, VALOR_OPCION } from "../src/lib/zoho-campos";

let ok = 0, fail = 0;
const t = (n: string, c: boolean, d?: unknown) => (c ? (ok++, console.log("  ✔", n)) : (fail++, console.log("  ✘", n, d ?? "")));

console.log("Cobertura del mapeo");
t("todas las preguntas tienen campo Zoho", PREGUNTAS.every((p) => CAMPO_PREGUNTA[p.id]));
t("no hay dos preguntas en el mismo campo", new Set(Object.values(CAMPO_PREGUNTA)).size === PREGUNTAS.length);
t("toda opción de lista tiene valor Zoho", PREGUNTAS.every((p) => (p.opciones ?? []).every((o) => VALOR_OPCION[p.id]?.[o.valor])));

console.log("Registro de ejemplo (caso con banderas rojas)");
const resp = {
  p01_motivo: "violencia_pareja", p04_pareja: ["golpes", "insulto"], p05_familiar: "si", p05_tipo: ["fisica", "psicologica"],
  p09_personas: "ninguna", p11_cuidado: "no", p17_alertas: ["pensamientos_dano"], p19_dinero: "otra_persona", p22_control: "si",
  p26_barreras: ["internet", "miedo_entrevistas"], p30_algo_mas: "  Gracias  ",
};
const dx = calcularDiagnostico(resp);
const r = construirRegistro(resp, dx, "6174744000089423755", new Date("2026-10-05T15:30:00Z"));
t("lista simple va como texto", typeof r[CAMPO_PREGUNTA.p01_motivo] === "string");
t("selección múltiple va como arreglo", Array.isArray(r[CAMPO_PREGUNTA.p04_pareja]) && (r[CAMPO_PREGUNTA.p04_pareja] as string[]).length === 2);
t("P5 tipo múltiple", (r[CAMPO_PREGUNTA.p05_tipo] as string[]).length === 2);
t("texto se recorta", r[CAMPO_PREGUNTA.p30_algo_mas] === "Gracias");
t("no envía preguntas ocultas (P12/P13)", !(CAMPO_PREGUNTA.p12_barrera in r) );
t("nivel Alto y bandera", r["Nivel_de_riesgo_autom_tico"] === "Alto" && (r["Banderas_rojas_activas"] as string[]).length >= 2, r);
t("alertas booleanas", r["Alerta_prioritaria_inmediata"] === true && r["Alerta_de_revisi_n_posible_control_econ_mico"] === true);
t("participante como lookup", JSON.stringify(r["Participante"]) === '{"id":"6174744000089423755"}');
t("Name presente", typeof r["Name"] === "string" && (r["Name"] as string).startsWith("Diagnóstico psicosocial 2026-10-05"));
t("puntaje total entero", Number.isInteger(r["Puntaje_total_0_100"]));
console.log(JSON.stringify(r, null, 1).slice(0, 900) + " …");

console.log("Token del enlace único");
const tok = firmarToken("6174744000089423755", "secreto-de-prueba");
t("token válido", verificarToken(tok, "secreto-de-prueba") === "6174744000089423755");
t("secreto distinto → rechazado", verificarToken(tok, "otro") === null);
t("token alterado → rechazado", verificarToken("6174744000089423756." + tok.split(".")[1], "secreto-de-prueba") === null);
t("sin token → null", verificarToken(null, "x") === null);

console.log(`\n${ok} correctas, ${fail} fallidas`);
process.exit(fail ? 1 : 0);
