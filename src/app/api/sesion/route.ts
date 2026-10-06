import { NextResponse } from "next/server";
import { estadoDeSesion } from "@/lib/zoho";

export const dynamic = "force-dynamic";

/** El formulario consulta esto al abrirse: ¿el enlace es válido, venció o ya se usó? */
export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("t");
  const estado = await estadoDeSesion(t && t.length < 200 ? t : null);
  return NextResponse.json({ estado }, { headers: { "Cache-Control": "no-store" } });
}
