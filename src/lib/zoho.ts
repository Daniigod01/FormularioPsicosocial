/**
 * Integración con Zoho CRM (módulo «Psicosocial RutaM v2»).
 *
 * Flujo con enlace único (opción B):
 *  1. Zoho crea el registro (estado «Enlace enviado») y pide un enlace a /api/enlace.
 *  2. La participante abre el enlace: /api/sesion valida firma, vencimiento y estado.
 *  3. Al enviar, /api/enviar ACTUALIZA ese mismo registro (estado «Diligenciado»).
 *
 * La parte que habla con Zoho se prueba con un fetch simulado (scripts/test-zoho.ts);
 * contra Zoho real solo se ha probado la creación del registro.
 */
import { createHmac, timingSafeEqual } from "crypto";
import { PREGUNTAS, type Respuestas } from "./preguntas";
import type { Diagnostico } from "./puntaje";
import {
  CAMPO_PREGUNTA, CAMPO_RESULTADO, ESTADO_DILIGENCIADO, ESTADO_ENLACE_ENVIADO, FUENTE_AUTOAPLICADO,
  MODULO_ZOHO, VALOR_BANDERA, VALOR_OPCION,
} from "./zoho-campos";

export type ResultadoEnvio =
  | { ok: true; modoPrueba?: boolean; id?: string }
  | { ok: false; error: string; enlace?: EstadoEnlace };

export type EstadoEnlace = "enlace_invalido" | "enlace_vencido" | "enlace_usado";
export type EstadoSesion = "ok" | "libre" | EstadoEnlace | "error";

// ---------- Enlace único: token = <idRegistro>.<vence (segundos unix)>.<hmac-sha256 hex> ----------
const firmar = (id: string, vence: number, secreto: string) =>
  createHmac("sha256", secreto).update(`${id}.${vence}`).digest("hex");

export function firmarToken(idRegistro: string, secreto: string, dias = 7, ahora: Date = new Date()): { token: string; vence: Date } {
  const venceSeg = Math.floor(ahora.getTime() / 1000) + Math.round(dias * 86400);
  return { token: `${idRegistro}.${venceSeg}.${firmar(idRegistro, venceSeg, secreto)}`, vence: new Date(venceSeg * 1000) };
}

export function verificarToken(
  token: string | null,
  secreto: string | undefined,
  ahora: Date = new Date()
): { ok: true; id: string } | { ok: false; motivo: "enlace_invalido" | "enlace_vencido" } {
  const invalido = { ok: false, motivo: "enlace_invalido" } as const;
  if (!token || !secreto) return invalido;
  const partes = token.split(".");
  if (partes.length !== 3) return invalido;
  const [id, venceTxt, sig] = partes;
  if (!/^\d{5,25}$/.test(id) || !/^\d{9,12}$/.test(venceTxt)) return invalido;
  const esperado = Buffer.from(firmar(id, Number(venceTxt), secreto));
  const recibido = Buffer.from(sig);
  if (esperado.length !== recibido.length || !timingSafeEqual(esperado, recibido)) return invalido;
  if (Number(venceTxt) * 1000 < ahora.getTime()) return { ok: false, motivo: "enlace_vencido" };
  return { ok: true, id };
}

/** El enlace solo sirve mientras el registro siga en «Enlace enviado». */
export function evaluarEstado(estado: string | null | undefined): "ok" | "enlace_usado" {
  return estado === ESTADO_ENLACE_ENVIADO ? "ok" : "enlace_usado";
}

// ---------- Armado del registro ----------
/** `crear`=true agrega el nombre (registro nuevo); al actualizar no se toca el nombre ni la participante. */
export function construirRegistro(
  respuestas: Respuestas,
  dx: Diagnostico,
  ahora: Date = new Date(),
  crear = false
): Record<string, unknown> {
  const r: Record<string, unknown> = {};

  for (const p of PREGUNTAS) {
    const valor = respuestas[p.id];
    if (valor === undefined || valor === "" || (Array.isArray(valor) && valor.length === 0)) continue;
    const campo = CAMPO_PREGUNTA[p.id];
    if (p.tipo === "texto") {
      r[campo] = String(valor).trim();
    } else if (p.tipo === "select") {
      const v = VALOR_OPCION[p.id]?.[String(valor)];
      if (v) r[campo] = v;
    } else {
      const vs = (valor as string[]).map((c) => VALOR_OPCION[p.id]?.[c]).filter((x): x is string => Boolean(x));
      if (vs.length) r[campo] = vs;
    }
  }

  const C = CAMPO_RESULTADO;
  for (const e of dx.ejes) {
    r[C.puntajeEje[e.id]] = e.puntos;
    r[C.porcentajeEje[e.id]] = e.porcentaje;
  }
  r[C.puntajeTotal] = dx.puntajeTotal;
  r[C.nivel] = dx.nivel;
  r[C.banderas] = dx.banderasRojas.map((b) => VALOR_BANDERA[b]);
  r[C.alertaInmediata] = dx.alertaPrioritariaInmediata;
  r[C.alertaNaranja] = dx.alertaNaranjaControlEconomico;
  r[C.estado] = ESTADO_DILIGENCIADO;
  r[C.fuente] = FUENTE_AUTOAPLICADO;
  if (crear) r[C.nombre] = `Diagnóstico psicosocial ${ahora.toISOString().slice(0, 16).replace("T", " ")}`;
  return r;
}

// ---------- Llamadas a la API de Zoho ----------
const cache = globalThis as unknown as { __zohoToken?: { valor: string; vence: number } };
const apiBase = () => process.env.ZOHO_API_DOMAIN || "https://www.zohoapis.com";

async function obtenerAccessToken(): Promise<string> {
  const c = cache.__zohoToken;
  if (c && c.vence > Date.now() + 60_000) return c.valor;
  const cuentas = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com";
  const res = await fetch(`${cuentas}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.ZOHO_CLIENT_ID || "",
      client_secret: process.env.ZOHO_CLIENT_SECRET || "",
      refresh_token: process.env.ZOHO_REFRESH_TOKEN || "",
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error(`No se obtuvo token de Zoho (${data.error || res.status})`);
  cache.__zohoToken = { valor: data.access_token, vence: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return data.access_token;
}

async function zoho(metodo: "GET" | "POST" | "PUT", ruta: string, cuerpo?: unknown) {
  const res = await fetch(`${apiBase()}/crm/v8/${ruta}`, {
    method: metodo,
    headers: { Authorization: `Zoho-oauthtoken ${await obtenerAccessToken()}`, "Content-Type": "application/json" },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export const modoPrueba = () => !process.env.ZOHO_REFRESH_TOKEN;
export const permitirSinEnlace = () => process.env.PERMITIR_SIN_ENLACE === "1";

/** Estado actual del registro («Enlace enviado», «Diligenciado»…). null si no existe. */
export async function leerEstadoRegistro(id: string): Promise<string | null> {
  const { res, data } = await zoho("GET", `${MODULO_ZOHO}/${id}?fields=${CAMPO_RESULTADO.estado}`);
  if (!res.ok) return null;
  return data?.data?.[0]?.[CAMPO_RESULTADO.estado] ?? null;
}

/** Qué debe mostrar el formulario al abrirse. */
export async function estadoDeSesion(token: string | null): Promise<EstadoSesion> {
  if (modoPrueba()) return "libre";
  if (!token) return permitirSinEnlace() ? "libre" : "enlace_invalido";
  const v = verificarToken(token, process.env.ZOHO_LINK_SECRET);
  if (!v.ok) return v.motivo;
  try {
    const estado = await leerEstadoRegistro(v.id);
    if (estado === null) return "enlace_invalido";
    return evaluarEstado(estado);
  } catch {
    return "error";
  }
}

export async function enviarAZoho(token: string | null, respuestas: Respuestas, dx: Diagnostico): Promise<ResultadoEnvio> {
  if (modoPrueba()) return { ok: true, modoPrueba: true }; // no se guarda nada

  try {
    // ---- Sin enlace: solo para pruebas (PERMITIR_SIN_ENLACE=1), crea un registro nuevo ----
    if (!token) {
      if (!permitirSinEnlace()) return { ok: false, error: "Falta el enlace.", enlace: "enlace_invalido" };
      const { res, data } = await zoho("POST", MODULO_ZOHO, { data: [construirRegistro(respuestas, dx, new Date(), true)] });
      const fila = data?.data?.[0];
      if (!res.ok || fila?.code !== "SUCCESS") return { ok: false, error: `Zoho rechazó el registro: ${fila?.code ?? res.status} ${fila?.details?.api_name ?? ""}`.trim() };
      return { ok: true, id: fila.details?.id };
    }

    // ---- Con enlace: se valida y se ACTUALIZA el registro que creó el botón de Zoho ----
    const v = verificarToken(token, process.env.ZOHO_LINK_SECRET);
    if (!v.ok) return { ok: false, error: v.motivo, enlace: v.motivo };
    const estado = await leerEstadoRegistro(v.id);
    if (estado === null) return { ok: false, error: "Registro no encontrado.", enlace: "enlace_invalido" };
    if (evaluarEstado(estado) !== "ok") return { ok: false, error: "Enlace ya usado.", enlace: "enlace_usado" };

    const { res, data } = await zoho("PUT", `${MODULO_ZOHO}/${v.id}`, { data: [construirRegistro(respuestas, dx)] });
    const fila = data?.data?.[0];
    // Solo código y campo: nunca se registran las respuestas
    if (!res.ok || fila?.code !== "SUCCESS") return { ok: false, error: `Zoho rechazó la actualización: ${fila?.code ?? res.status} ${fila?.details?.api_name ?? ""}`.trim() };
    return { ok: true, id: v.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
