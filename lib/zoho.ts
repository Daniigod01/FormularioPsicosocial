/**
 * Cliente mínimo de Zoho CRM (API v6) con refresh token.
 * Variables de entorno (ver .env.example):
 *  ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
 *  ZOHO_ACCOUNTS_URL (ej. https://accounts.zoho.com)  y  ZOHO_API_URL (ej. https://www.zohoapis.com)
 */

let cache: { token: string; expira: number } | null = null;

async function accessToken(): Promise<string> {
  if (cache && Date.now() < cache.expira) return cache.token;

  const accounts = process.env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.com";
  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN ?? "",
    client_id: process.env.ZOHO_CLIENT_ID ?? "",
    client_secret: process.env.ZOHO_CLIENT_SECRET ?? "",
    grant_type: "refresh_token",
  });
  const res = await fetch(`${accounts}/oauth/v2/token`, { method: "POST", body: params });
  const json = await res.json();
  if (!json.access_token) {
    throw new Error(`Zoho no entregó access_token: ${JSON.stringify(json)}`);
  }
  // Los tokens duran 1 hora; se renueva un poco antes.
  cache = { token: json.access_token, expira: Date.now() + (json.expires_in ?? 3600) * 1000 - 60_000 };
  return cache.token;
}

export async function getRecord(modulo: string, id: string): Promise<Record<string, any>> {
  const api = process.env.ZOHO_API_URL ?? "https://www.zohoapis.com";
  const res = await fetch(`${api}/crm/v6/${modulo}/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Zoho-oauthtoken ${await accessToken()}` },
    cache: "no-store",
  });
  if (res.status === 204) throw new ZohoError("Registro no encontrado", 404);
  const json = await res.json();
  if (!res.ok || !json.data?.[0]) {
    throw new ZohoError(json.message ?? `Zoho respondió ${res.status}`, res.status === 404 ? 404 : 502);
  }
  return json.data[0];
}

export class ZohoError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}
