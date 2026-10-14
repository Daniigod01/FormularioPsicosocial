import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { leerRegistro, ZohoError, zohoConfigurado } from "@/lib/zoho-lectura";
import { CAMPOS, CAMPOS_A_LEER, CAMPOS_NOMBRE_ORIENTACION, MODULO_ORIENTACION, MODULO_ZOHO } from "@/lib/perfil-riesgo/config";
import { construirPerfilRiesgo } from "@/lib/perfil-riesgo/build-data";
import { datosDemo } from "@/lib/perfil-riesgo/demo";
import { PerfilRiesgoPdf } from "@/lib/perfil-riesgo/PerfilRiesgoPdf";
import { nombreArchivo, pagina, respuestaPdf, validarSolicitud } from "@/lib/pdf-comun/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const TITULO = "Perfil de riesgo psicosocial";

/**
 * GET /api/pdf/perfil-riesgo?id=<ID del registro psicosocial>&key=<PDF_ACCESS_KEY>
 *   &demo=1   -> PDF de ejemplo con datos ficticios (no usa Zoho; no necesita id)
 *   &debug=1  -> JSON con los registros tal como llegan de Zoho (sirve para revisar nombres de campos)
 * Se llama desde un botón del módulo «Psicosocial RutaM v2».
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const demo = url.searchParams.get("demo") === "1";

  const solicitud = validarSolicitud(req, TITULO, { exigirId: !demo });
  if (!solicitud.ok) return solicitud.respuesta;

  try {
    if (demo) {
      const buffer = await renderToBuffer(<PerfilRiesgoPdf data={datosDemo()} ejemplo />);
      return respuestaPdf(buffer, "Perfil-de-riesgo-EJEMPLO.pdf");
    }

    if (!zohoConfigurado()) return pagina(TITULO, 503, "Faltan las variables de Zoho en el servidor (ZOHO_REFRESH_TOKEN y las demás).");
    const { id } = solicitud;

    const depurar = url.searchParams.get("debug") === "1";
    const registro = await leerRegistro(MODULO_ZOHO, id, depurar ? undefined : CAMPOS_A_LEER);

    // El nombre de la participante vive en Orientación RutaM; si no se puede leer, el PDF sigue con el documento.
    let orientacion: Record<string, unknown> | null = null;
    const lookup = registro[CAMPOS.participante] as { id?: string } | null;
    if (lookup?.id) {
      try {
        orientacion = await leerRegistro(MODULO_ORIENTACION, String(lookup.id), CAMPOS_NOMBRE_ORIENTACION.length ? ["Name", ...CAMPOS_NOMBRE_ORIENTACION] : undefined);
      } catch (e) {
        console.warn("perfil-riesgo: no se pudo leer Orientación RutaM:", e instanceof Error ? e.message : e);
      }
    }

    if (depurar) return Response.json({ psicosocial: registro, orientacion }, { headers: { "Cache-Control": "no-store" } });

    // Si falta algo no se genera un PDF incompleto
    const resultado = construirPerfilRiesgo(registro, orientacion);
    if (!resultado.ok) {
      return pagina(TITULO, 422, "Todavía no se puede generar el perfil de riesgo:", resultado.faltantes);
    }

    const buffer = await renderToBuffer(<PerfilRiesgoPdf data={resultado.data} />);
    return respuestaPdf(buffer, nombreArchivo("Perfil-de-riesgo", resultado.data.documento));
  } catch (e) {
    if (e instanceof ZohoError && e.status === 404) return pagina(TITULO, 404, "No se encontró el registro en el CRM.");
    console.error("perfil-riesgo:", e instanceof Error ? e.message : e); // el detalle queda en los logs, no en la pantalla
    return pagina(TITULO, 502, "No se pudo generar el documento. Intenta de nuevo en un momento.");
  }
}
