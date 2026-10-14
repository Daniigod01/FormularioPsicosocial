import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { getRecord, ZohoError } from "@/lib/zoho";
import { CAMPOS, MODULO_ORIENTACION, MODULO_PSICOSOCIAL } from "@/lib/perfil-riesgo/config";
import { construirPerfilRiesgo } from "@/lib/perfil-riesgo/build-data";
import { PerfilRiesgoPdf } from "@/lib/perfil-riesgo/PerfilRiesgoPdf";
import { nombreArchivo, pagina, respuestaPdf, validarSolicitud } from "@/lib/pdf-comun/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const TITULO = "Perfil de riesgo psicosocial";

/**
 * GET /api/pdf/perfil-riesgo?id=<ID del registro psicosocial>&key=<PDF_ACCESS_KEY>
 * Se llama desde un botón del módulo Psicosocial RutaM v2 en Zoho.
 * Agrega &debug=1 para ver los nombres de API reales del registro (sirve para ajustar config.ts).
 */
export async function GET(req: Request) {
  const solicitud = validarSolicitud(req, TITULO);
  if (!solicitud.ok) return solicitud.respuesta;
  const { id, url } = solicitud;

  try {
    const registro = await getRecord(MODULO_PSICOSOCIAL, id);

    if (url.searchParams.get("debug") === "1") {
      return Response.json(registro, { headers: { "Cache-Control": "no-store" } });
    }

    const lookup = registro[CAMPOS.participante];
    const orientacion = lookup?.id ? await getRecord(MODULO_ORIENTACION, String(lookup.id)) : null;

    // Si falta algo no se genera un PDF incompleto
    const resultado = construirPerfilRiesgo(registro, orientacion);
    if (!resultado.ok) {
      return pagina(TITULO, 422, "Todavía no se puede generar el perfil de riesgo. Faltan estos datos en el registro:", resultado.faltantes);
    }

    const buffer = await renderToBuffer(<PerfilRiesgoPdf data={resultado.data} />);
    return respuestaPdf(buffer, nombreArchivo("Perfil-de-riesgo", resultado.data.documento));
  } catch (e) {
    if (e instanceof ZohoError && e.status === 404) return pagina(TITULO, 404, "No se encontró el registro en el CRM.");
    console.error("perfil-riesgo:", e); // el detalle queda en los logs, no en la pantalla
    return pagina(TITULO, 502, "No se pudo generar el documento. Intenta de nuevo en un momento.");
  }
}
