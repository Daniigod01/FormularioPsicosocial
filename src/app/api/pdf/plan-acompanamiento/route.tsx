import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { leerRegistro, ZohoError, zohoConfigurado } from "@/lib/zoho-lectura";
import { CAMPOS, CAMPOS_A_LEER, CAMPOS_NOMBRE_ORIENTACION, MODULO_ORIENTACION, MODULO_ZOHO } from "@/lib/perfil-riesgo/config";
import { CAMPOS_PLAN_A_LEER } from "@/lib/plan-acompanamiento/config";
import { construirPlanAcompanamiento } from "@/lib/plan-acompanamiento/build-data";
import { texto } from "@/lib/perfil-riesgo/build-data";
import { datosDemoPlan } from "@/lib/plan-acompanamiento/demo";
import { PlanAcompanamientoPdf } from "@/lib/plan-acompanamiento/PlanAcompanamientoPdf";
import { nombreArchivo, pagina, respuestaPdf, validarSolicitud } from "@/lib/pdf-comun/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const TITULO = "Mi plan de acompañamiento psicosocial";

/**
 * GET /api/pdf/plan-acompanamiento?id=<ID del registro psicosocial>&key=<PDF_ACCESS_KEY>
 *   &demo=1   -> PDF de ejemplo con datos ficticios (no usa Zoho; no necesita id)
 *   &debug=1  -> JSON con los registros tal como llegan de Zoho (sirve para revisar nombres de campos)
 * Es el documento que recibe la participante: no incluye nivel de riesgo, puntajes ni alertas.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const demo = url.searchParams.get("demo") === "1";

  const solicitud = validarSolicitud(req, TITULO, { exigirId: !demo });
  if (!solicitud.ok) return solicitud.respuesta;

  try {
    if (demo) {
      const buffer = await renderToBuffer(<PlanAcompanamientoPdf data={datosDemoPlan()} ejemplo />);
      return respuestaPdf(buffer, "Plan-de-acompanamiento-EJEMPLO.pdf");
    }

    if (!zohoConfigurado()) return pagina(TITULO, 503, "Faltan las variables de Zoho en el servidor (ZOHO_REFRESH_TOKEN y las demás).");
    const { id } = solicitud;
    const depurar = url.searchParams.get("debug") === "1";

    // Primero se piden solo los campos necesarios. Si alguno todavía no existe en Zoho, se lee el registro
    // completo para poder decir exactamente cuál falta.
    let registro: Record<string, unknown>;
    let completo = depurar;
    if (depurar) {
      registro = await leerRegistro(MODULO_ZOHO, id);
    } else {
      try {
        registro = await leerRegistro(MODULO_ZOHO, id, [...CAMPOS_A_LEER, ...CAMPOS_PLAN_A_LEER]);
      } catch (e) {
        if (!(e instanceof ZohoError) || e.status === 404) throw e;
        console.warn("plan-acompanamiento: lectura con lista de campos falló, se lee el registro completo:", e.message);
        registro = await leerRegistro(MODULO_ZOHO, id);
        completo = true;
      }
    }

    let orientacion: Record<string, unknown> | null = null;
    const lookup = registro[CAMPOS.participante] as { id?: string } | null;
    if (lookup?.id && !texto(registro[CAMPOS.nombreCompleto])) {
      try {
        orientacion = await leerRegistro(MODULO_ORIENTACION, String(lookup.id), CAMPOS_NOMBRE_ORIENTACION.length ? ["Name", ...CAMPOS_NOMBRE_ORIENTACION] : undefined);
      } catch (e) {
        console.warn("plan-acompanamiento: no se pudo leer Orientación RutaM:", e instanceof Error ? e.message : e);
      }
    }

    if (depurar) return Response.json({ psicosocial: registro, orientacion }, { headers: { "Cache-Control": "no-store" } });

    // Este documento lo recibe la participante: no se genera si falta algo importante
    const resultado = construirPlanAcompanamiento(registro, orientacion, completo);
    if (!resultado.ok) {
      return pagina(TITULO, 422, "Todavía no se puede generar el plan de acompañamiento:", resultado.faltantes);
    }

    const buffer = await renderToBuffer(<PlanAcompanamientoPdf data={resultado.data} />);
    return respuestaPdf(buffer, nombreArchivo("Plan-de-acompanamiento", resultado.data.documento));
  } catch (e) {
    if (e instanceof ZohoError && e.status === 404) return pagina(TITULO, 404, "No se encontró el registro en el CRM.");
    console.error("plan-acompanamiento:", e instanceof Error ? e.message : e);
    return pagina(TITULO, 502, "No se pudo generar el documento. Intenta de nuevo en un momento.");
  }
}
