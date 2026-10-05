/**
 * Envío del diagnóstico al CRM Zoho (módulo «Psicosocial RutaM v2»).
 * - construirRegistro(): función pura que arma el JSON (probada en scripts/test-zoho.ts).
 * - enviarAZoho(): obtiene el access token (refresh token) y crea el registro.
 *   Esta parte NO se ha probado contra Zoho real: requiere las variables ZOHO_* (ver .env.example).
 */
import { createHmac, timingSafeEqual } from "crypto";
import { PREGUNTAS, type Respuestas } from "./preguntas";
import type { Diagnostico } from "./puntaje";
import {
  CAMPO_PREGUNTA, CAMPO_RESULTADO, ESTADO_DILIGENCIADO, FUENTE_AUTOAPLICADO,
  MODULO_ZOHO, VALOR_BANDERA, VALOR_OPCION,
} from "./zoho-campos";

export type ResultadoEnvio = { ok: true; modoPrueba?: boolean; id?: string } | { ok: false; error: string };

// ---------- Enlace único: token = <idRegistroParticipante>.<hmac-sha256 hex> ----------
export function firmarToken(idParticipante: string, secreto: string): string {
  return `${idParticipante}.${createHmac("sha256", secreto).update(idParticipante).digest("hex")}`;
}

/** Devuelve el id del registro de la participante si la firma es válida; si no, null. */
export function verificarToken(token: string | null, secreto: string | undefined): string | null {
  if (!token || !secreto) return null;
  const i = token.lastIndexOf(".");
  if (i < 1) return null;
  const id = token.slice(0, i);
  if (!/^\d{5,25}$/.test(id)) return null;
  const esperado = Buffer.from(createHmac("sha256", secreto).update(id).digest("hex"));
  const recibido = Buffer.from(token.slice(i + 1));
  return esperado.length === recibido.length && timingSafeEqual(esperado, recibido) ? id : null;
}

// ---------- Armado del registro ----------
export function construirRegistro(
  respuestas: Respuestas,
  dx: Diagnostico,
  idParticipante: string | null,
  ahora: Date = new Date()
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
  r[C.nombre] = `Diagnóstico psicosocial ${ahora.toISOString().slice(0, 16).replace("T", " ")}`;
  if (idParticipante) r[C.participante] = { id: idParticipante };
  return r;
}

// ---------- Llamada a la API de Zoho ----------
const cache = globalThis as unknown as { __zohoToken?: { valor: string; vence: number } };

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

export async function enviarAZoho(
  token: string | null,
  respuestas: Respuestas,
  diagnostico: Diagnostico
): Promise<ResultadoEnvio> {
  if (!process.env.ZOHO_REFRESH_TOKEN) {
    // Modo prueba: no se guarda nada ni se escribe contenido sensible en los logs
    return { ok: true, modoPrueba: true };
  }
  try {
    const idParticipante = verificarToken(token, process.env.ZOHO_LINK_SECRET);
    const registro = construirRegistro(respuestas, diagnostico, idParticipante);
    const api = process.env.ZOHO_API_DOMAIN || "https://www.zohoapis.com";
    const res = await fetch(`${api}/crm/v8/${MODULO_ZOHO}`, {
      method: "POST",
      headers: { Authorization: `Zoho-oauthtoken ${await obtenerAccessToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ data: [registro] }),
    });
    const data = await res.json();
    const fila = data?.data?.[0];
    if (!res.ok || fila?.code !== "SUCCESS") {
      // Solo código y campo: nunca se registran las respuestas
      return { ok: false, error: `Zoho rechazó el registro: ${fila?.code ?? res.status} ${fila?.details?.api_name ?? ""}`.trim() };
    }
    return { ok: true, id: fila.details?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
