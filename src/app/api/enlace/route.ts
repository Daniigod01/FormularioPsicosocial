import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { firmarToken } from "@/lib/zoho";

export const dynamic = "force-dynamic";

function claveValida(recibida: string | null): boolean {
  const esperada = process.env.ENLACE_API_KEY;
  if (!esperada || !recibida) return false;
  const a = Buffer.from(esperada), b = Buffer.from(recibida);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Lo llama Zoho (botón del CRM) para obtener el enlace firmado de un registro.
 * POST { id: "<id del registro psicosocial>", dias?: 7 }  +  cabecera x-api-key
 */
export async function POST(req: Request) {
  if (!claveValida(req.headers.get("x-api-key"))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const secreto = process.env.ZOHO_LINK_SECRET;
  if (!secreto) return NextResponse.json({ error: "Falta ZOHO_LINK_SECRET en el servidor." }, { status: 500 });

  let body: { id?: unknown; dias?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }

  const id = String(body.id ?? "");
  if (!/^\d{5,25}$/.test(id)) return NextResponse.json({ error: "id inválido." }, { status: 400 });
  const dias = Math.min(Math.max(Number(body.dias) || Number(process.env.ENLACE_DIAS) || 7, 1), 30);

  const { token, vence } = firmarToken(id, secreto, dias);
  const base = (process.env.URL_FORMULARIO || new URL(req.url).origin).replace(/\/$/, "");
  return NextResponse.json({ url: `${base}/?t=${token}`, vence: vence.toISOString() });
}
