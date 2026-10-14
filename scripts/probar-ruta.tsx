/**
 * Prueba la ruta completa sin Zoho real (simula las respuestas de la API):
 *   npx tsx scripts/probar-ruta.tsx
 */
import fs from "node:fs";
process.env.PDF_ACCESS_KEY = "clave-de-prueba";
process.env.ZOHO_REFRESH_TOKEN = "x";

const completo: Record<string, any> = {
  id: "1234567890123456789", Name: "1000000000", Owner: { name: "Laura Martínez", id: "1" },
  Participante_RutaM: { name: "Ana María Rojas Díaz", id: "9876543210987654321" },
  Fecha_del_diagnostico: "2026-09-21", Motivo_de_atencion: "Manejo emocional y del estrés", Orientadora: "Camila Herrera",
  Nivel_de_riesgo: "Alto", Violencia_activa: true, Ideacion_suicida: false,
  Puntaje_bienestar_emocional: 55, Puntaje_violencia_tensiones: 100, Puntaje_redes_apoyo: 100,
  Puntaje_consumo_sustancias: 50, Puntaje_condiciones_vivienda: 0, Puntaje_barreras_empleabilidad: "67",
  Herramientas_preseleccionadas: ["guía de regulación emocional", "cápsula virtual de manejo del estrés"],
  Ficha_de_remision_preparada: true,
};
let registro = completo;

const fetchReal = globalThis.fetch;
globalThis.fetch = (async (input: any, init?: any) => {
  const u = String(input);
  if (!u.includes("zoho")) return fetchReal(input, init); // lo demás (p. ej. recursos internos de la librería) sigue normal
  if (u.includes("/oauth/v2/token")) return Response.json({ access_token: "t", expires_in: 3600 });
  if (u.includes("9876543210987654321")) return Response.json({ data: [{ id: "9876543210987654321", Name: "Ana María Rojas Díaz" }] });
  return Response.json({ data: [registro] });
}) as typeof fetch;

const perfil = (await import("../app/api/pdf/perfil-riesgo/route")).GET;
const ID = "1234567890123456789", KEY = "clave-de-prueba";
const mostrar = async (t: string, r: Response) => console.log(t.padEnd(40), r.status, (r.headers.get("content-type") ?? "").split(";")[0], r.headers.get("content-disposition") ?? "");
fs.mkdirSync("out", { recursive: true });

for (const [nombre, GET, ruta, archivo] of [["perfil", perfil, "perfil-riesgo", "desde-ruta-perfil.pdf"]] as const) {
  const base = `http://localhost/api/pdf/${ruta}`;
  const llamar = (q: string) => GET(new Request(`${base}?${q}`));
  console.log(`--- ${nombre}`);
  registro = completo;
  await mostrar("sin clave", await llamar(`id=${ID}`));
  await mostrar("clave incorrecta", await llamar(`id=${ID}&key=mala`));
  await mostrar("id inválido", await llamar(`id=abc&key=${KEY}`));
  await mostrar("dos registros seleccionados", await llamar(`id=${ID},9999999999&key=${KEY}`));

  registro = { ...completo, Nivel_de_riesgo: null, Puntaje_redes_apoyo: undefined };
  const r422 = await llamar(`id=${ID}&key=${KEY}`);
  await mostrar("faltan datos", r422);
  console.log("   ->", (await r422.text()).match(/<li>[^<]+<\/li>/g)?.join(" "));

  registro = completo;
  const ok = await llamar(`id=${ID}&key=${KEY}`);
  await mostrar("registro completo", ok);
  fs.writeFileSync(`out/${archivo}`, Buffer.from(await ok.arrayBuffer()));
}
