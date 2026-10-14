/**
 * Lectura de registros de Zoho CRM para generar los PDF.
 * Usa las mismas variables y el mismo caché de token que `zoho.ts`; no modifica ese archivo.
 */
const cache = globalThis as unknown as { __zohoToken?: { valor: string; vence: number } };
const apiBase = () => process.env.ZOHO_API_DOMAIN || "https://www.zohoapis.com";

async function accessToken(): Promise<string> {
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

export class ZohoError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/** Lee un registro. Con `campos` pide solo esos campos; sin `campos` trae todos (útil para depurar). */
export async function leerRegistro(modulo: string, id: string, campos?: string[]): Promise<Record<string, unknown>> {
  const query = campos?.length ? `?fields=${campos.map(encodeURIComponent).join(",")}` : "";
  const res = await fetch(`${apiBase()}/crm/v8/${modulo}/${encodeURIComponent(id)}${query}`, {
    headers: { Authorization: `Zoho-oauthtoken ${await accessToken()}` },
    cache: "no-store",
  });
  if (res.status === 204) throw new ZohoError("Registro no encontrado", 404);
  const json = await res.json().catch(() => ({}));
  const fila = json?.data?.[0];
  if (!res.ok || !fila) {
    throw new ZohoError(`Zoho respondió ${res.status} ${json?.code ?? ""} ${json?.message ?? ""}`.trim(), res.status === 404 ? 404 : 502);
  }
  return fila;
}

/** Si las variables de Zoho no están configuradas, la ruta solo puede mostrar el ejemplo (`?demo=1`). */
export const zohoConfigurado = () => Boolean(process.env.ZOHO_REFRESH_TOKEN);
