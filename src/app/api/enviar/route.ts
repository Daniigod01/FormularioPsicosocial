import { NextResponse } from "next/server";
import { limpiarRespuestas, type Respuestas } from "@/lib/preguntas";
import { calcularDiagnostico } from "@/lib/puntaje";
import { enviarAZoho } from "@/lib/zoho";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const respuestas = body.respuestas as Respuestas | undefined;
    const token = typeof body.token === "string" ? body.token : null;
    if (!respuestas || typeof respuestas !== "object") {
      return NextResponse.json({ ok: false, error: "Faltan datos en la solicitud." }, { status: 400 });
    }

    // El puntaje y el nivel de riesgo se calculan SIEMPRE aquí, nunca en el navegador.
    const limpias = limpiarRespuestas(respuestas);
    const diagnostico = calcularDiagnostico(limpias);

    const envio = await enviarAZoho(token, limpias, diagnostico);
    if (!envio.ok) {
      console.error("enviarAZoho falló:", envio.error);
      // Solo para diagnóstico: con MOSTRAR_DETALLE_ERROR=1 se devuelve el código de Zoho (nunca respuestas).
      const detalle = process.env.MOSTRAR_DETALLE_ERROR === "1" ? envio.error : undefined;
      return NextResponse.json(
        { ok: false, error: "No pudimos guardar tus respuestas. Intenta de nuevo.", detalle },
        { status: 502 }
      );
    }

    // A la participante NO se le devuelve puntaje ni nivel, solo si debe ver las líneas de apoyo.
    return NextResponse.json({ ok: true, mostrarLineasEmergencia: diagnostico.mostrarLineasEmergencia });
  } catch {
    return NextResponse.json({ ok: false, error: "Error al procesar la solicitud." }, { status: 500 });
  }
}
