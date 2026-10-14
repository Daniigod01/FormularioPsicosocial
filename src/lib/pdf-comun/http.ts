import { timingSafeEqual } from "node:crypto";

function clavesIguales(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Página sencilla en español para cuando algo no se puede generar (se abre desde Zoho). */
export function pagina(titulo: string, status: number, mensaje: string, lista: string[] = []) {
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titulo)}</title>
<body style="font-family:Calibri,Arial,sans-serif;color:#2B2B2B;max-width:560px;margin:12vh auto;padding:0 20px">
<h1 style="color:#001F5B;font-size:22px;margin:0 0 6px">${esc(titulo)}</h1>
<div style="width:44px;height:4px;background:#FFD30F;margin-bottom:18px"></div>
<p style="font-size:16px;line-height:1.5">${esc(mensaje)}</p>
${lista.length ? `<ul style="font-size:16px;line-height:1.7">${lista.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}
</body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export type Solicitud = { ok: true; id: string; url: URL } | { ok: false; respuesta: Response };

/** Revisa la clave y el ID. Falla cerrado si PDF_ACCESS_KEY no está configurada. */
export function validarSolicitud(req: Request, titulo: string, opciones: { exigirId?: boolean } = {}): Solicitud {
  const exigirId = opciones.exigirId ?? true;
  const url = new URL(req.url);
  const esperada = process.env.PDF_ACCESS_KEY;
  if (!esperada) return { ok: false, respuesta: pagina(titulo, 500, "Falta configurar PDF_ACCESS_KEY en el servidor.") };
  if (!clavesIguales(url.searchParams.get("key") ?? "", esperada)) {
    return { ok: false, respuesta: pagina(titulo, 401, "No tienes acceso a este documento.") };
  }
  const id = (url.searchParams.get("id") ?? "").trim();
  if (id.includes(",")) {
    return { ok: false, respuesta: pagina(titulo, 400, "Selecciona un solo registro para generar el documento.") };
  }
  if (exigirId && !/^\d{10,25}$/.test(id)) {
    return { ok: false, respuesta: pagina(titulo, 400, "Falta el identificador del registro.") };
  }
  return { ok: true, id, url };
}

export function nombreArchivo(prefijo: string, documento: string) {
  const fecha = new Date().toISOString().slice(0, 10);
  return `${prefijo}-${documento.replace(/[^\w.-]+/g, "") || "sin-documento"}-${fecha}.pdf`;
}

export function respuestaPdf(buffer: Buffer, archivo: string) {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${archivo}"`,
      "Cache-Control": "no-store",
    },
  });
}
