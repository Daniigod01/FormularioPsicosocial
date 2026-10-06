import { PREGUNTAS } from "../src/lib/preguntas";
import { calcularDiagnostico } from "../src/lib/puntaje";
import { construirRegistro, enviarAZoho, estadoDeSesion, evaluarEstado, firmarToken, verificarToken } from "../src/lib/zoho";
import { CAMPO_PREGUNTA, VALOR_OPCION } from "../src/lib/zoho-campos";

let ok = 0, fail = 0;
const t = (n: string, c: boolean, d?: unknown) => (c ? (ok++, console.log("  ✔", n)) : (fail++, console.log("  ✘", n, d ?? "")));

console.log("Cobertura del mapeo");
t("todas las preguntas tienen campo Zoho", PREGUNTAS.every((p) => CAMPO_PREGUNTA[p.id]));
t("no hay dos preguntas en el mismo campo", new Set(Object.values(CAMPO_PREGUNTA)).size === PREGUNTAS.length);
t("toda opción de lista tiene valor Zoho", PREGUNTAS.every((p) => (p.opciones ?? []).every((o) => VALOR_OPCION[p.id]?.[o.valor])));

console.log("Registro (caso con banderas rojas)");
const resp = {
  p01_motivo: "violencia_pareja", p04_pareja: ["golpes", "insulto"], p05_familiar: "si", p05_tipo: ["fisica", "psicologica"],
  p09_personas: "ninguna", p11_cuidado: "no", p17_alertas: ["pensamientos_dano"], p19_dinero: "otra_persona", p22_control: "si",
  p26_barreras: ["internet", "miedo_entrevistas"], p30_algo_mas: "  Gracias  ",
};
const dx = calcularDiagnostico(resp);
const upd = construirRegistro(resp, dx, new Date("2026-10-05T15:30:00Z"));
const nuevo = construirRegistro(resp, dx, new Date("2026-10-05T15:30:00Z"), true);
t("lista simple va como texto", typeof upd[CAMPO_PREGUNTA.p01_motivo] === "string");
t("selección múltiple va como arreglo", (upd[CAMPO_PREGUNTA.p04_pareja] as string[]).length === 2);
t("texto se recorta", upd[CAMPO_PREGUNTA.p30_algo_mas] === "Gracias");
t("no envía preguntas ocultas (P12/P13)", !(CAMPO_PREGUNTA.p12_barrera in upd));
t("nivel Alto, banderas y alertas", upd["Nivel_de_riesgo_autom_tico"] === "Alto" && upd["Alerta_prioritaria_inmediata"] === true && upd["Alerta_de_revisi_n_posible_control_econ_mico"] === true);
t("al ACTUALIZAR no toca Name ni Participante", !("Name" in upd) && !("Participante" in upd));
t("al CREAR sí pone Name", (nuevo["Name"] as string).startsWith("Diagnóstico psicosocial 2026-10-05"));
t("estado queda Diligenciado", upd["Estado_del_diagn_stico"] === "Diligenciado");

console.log("Token del enlace único (con vencimiento)");
const ID = "6174744000107001007", SEC = "secreto-de-prueba";
const ahora = new Date("2026-10-05T12:00:00Z");
const { token, vence } = firmarToken(ID, SEC, 7, ahora);
t("vence a los 7 días", vence.toISOString() === "2026-10-12T12:00:00.000Z", vence);
const v1 = verificarToken(token, SEC, ahora);
t("token válido", v1.ok && v1.id === ID);
const v2 = verificarToken(token, SEC, new Date("2026-10-13T00:00:00Z"));
t("pasado el plazo → vencido", !v2.ok && v2.motivo === "enlace_vencido");
t("secreto distinto → inválido", !verificarToken(token, "otro", ahora).ok);
const [a, b, c] = token.split(".");
t("id alterado → inválido", !verificarToken(`6174744000107001008.${b}.${c}`, SEC, ahora).ok);
t("vencimiento alterado (alargar) → inválido", !verificarToken(`${a}.${Number(b) + 999999}.${c}`, SEC, ahora).ok);
t("basura / sin token → inválido", !verificarToken("abc", SEC, ahora).ok && !verificarToken(null, SEC, ahora).ok);
t("estado: solo «Enlace enviado» sirve", evaluarEstado("Enlace enviado") === "ok" && evaluarEstado("Diligenciado") === "enlace_usado" && evaluarEstado(null) === "enlace_usado");

async function flujo() {
console.log("Flujo completo con Zoho simulado");
type Llamada = { url: string; metodo: string; cuerpo?: string };
let llamadas: Llamada[] = [];
let estadoRegistro: string | null = "Enlace enviado";
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
  const u = String(url);
  llamadas.push({ url: u, metodo: init?.method ?? "GET", cuerpo: init?.body ? String(init.body) : undefined });
  if (u.includes("/oauth/v2/token")) return json({ access_token: "tok", expires_in: 3600 });
  if (init?.method === "PUT") { estadoRegistro = "Diligenciado"; return json({ data: [{ code: "SUCCESS", details: { id: ID } }] }); }
  if (init?.method === "POST") return json({ data: [{ code: "SUCCESS", details: { id: "999" } }] });
  return json({ data: estadoRegistro === null ? [] : [{ Estado_del_diagn_stico: estadoRegistro }] });
}) as typeof fetch;

process.env.ZOHO_REFRESH_TOKEN = "r"; process.env.ZOHO_LINK_SECRET = SEC;
const tokenVigente = firmarToken(ID, SEC, 7).token;
t("sesión: enlace vigente → ok", (await estadoDeSesion(tokenVigente)) === "ok");
t("sesión: sin enlace → inválido", (await estadoDeSesion(null)) === "enlace_invalido");
t("sesión: enlace falso → inválido", (await estadoDeSesion("1.2.3")) === "enlace_invalido");

llamadas = [];
const r1 = await enviarAZoho(tokenVigente, resp, dx);
const put = llamadas.find((l) => l.metodo === "PUT");
t("envío con enlace → ok", r1.ok === true, r1);
t("hizo PUT a /Psicosocial_RutaM_v2/<id>", !!put && put.url.endsWith(`/crm/v8/Psicosocial_RutaM_v2/${ID}`), llamadas.map((l) => l.metodo + " " + l.url));
t("no hizo POST (no crea duplicados)", !llamadas.some((l) => l.metodo === "POST" && l.url.includes("crm/v8")));
t("el PUT lleva el nivel de riesgo", !!put?.cuerpo?.includes('"Nivel_de_riesgo_autom_tico":"Alto"'));
const r2 = await enviarAZoho(tokenVigente, resp, dx);
t("segundo envío con el mismo enlace → rechazado (usado)", !r2.ok && r2.enlace === "enlace_usado", r2);
t("sesión del enlace usado → enlace_usado", (await estadoDeSesion(tokenVigente)) === "enlace_usado");
const rv = await enviarAZoho(firmarToken(ID, SEC, 7, new Date("2020-01-01")).token, resp, dx);
t("enlace vencido → rechazado", !rv.ok && rv.enlace === "enlace_vencido");
estadoRegistro = null;
const rn = await enviarAZoho(firmarToken("123456789012345", SEC, 7).token, resp, dx);
t("registro inexistente → inválido", !rn.ok && rn.enlace === "enlace_invalido");
const rs = await enviarAZoho(null, resp, dx);
t("sin enlace y sin PERMITIR_SIN_ENLACE → rechazado", !rs.ok && rs.enlace === "enlace_invalido");
process.env.PERMITIR_SIN_ENLACE = "1"; llamadas = [];
const rl = await enviarAZoho(null, resp, dx);
t("con PERMITIR_SIN_ENLACE=1 crea registro nuevo (POST)", rl.ok && llamadas.some((l) => l.metodo === "POST" && l.url.endsWith("/Psicosocial_RutaM_v2")), llamadas.map((l) => l.metodo));
delete process.env.ZOHO_REFRESH_TOKEN;
t("sin credenciales Zoho → modo prueba", (await enviarAZoho(null, resp, dx)).ok === true && (await estadoDeSesion(null)) === "libre");

}

flujo().then(() => {
  console.log(`\n${ok} correctas, ${fail} fallidas`);
  process.exit(fail ? 1 : 0);
}).catch((e) => { console.error(e); process.exit(1); });
