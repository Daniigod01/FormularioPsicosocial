import { CAMPOS, EJES, ESTADO_DILIGENCIADO } from "../perfil-riesgo/config";
import { fechaLarga, lista, nombreDeOrientacion, numero, texto } from "../perfil-riesgo/build-data";
import { CAMPOS_PLAN, CONTACTOS_PROFESIONALES, EJES_PLAN, TEXTOS } from "./config";
import type { PlanAcompanamientoData } from "./types";

export type Resultado = { ok: true; data: PlanAcompanamientoData } | { ok: false; faltantes: string[] };

/**
 * Estado en la ruta, en palabras para la participante. Nunca se muestra el texto interno del CRM
 * (por ejemplo «Remitido»): solo estas tres frases.
 */
export function estadoParaParticipante(estado: string): string {
  const e = estado.toLowerCase();
  if (e.includes("cerrado")) return "Acompañamiento completado";
  if (e.includes("pendiente llamada 2") || e.includes("primer contacto realizado")) return "Primer contacto realizado";
  return "En acompañamiento";
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
/** «28 sep 2026»: cabe en una columna angosta. Acepta AAAA-MM-DD o fecha y hora de Zoho (se usa la fecha tal como viene, ya en hora local). Si no es una fecha, devuelve el texto tal cual. */
export function fechaCorta(v: unknown): string {
  const s = texto(v);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  return m ? `${+m[3]} ${MESES[+m[2] - 1]} ${m[1]}` : s;
}

/**
 * `completo` = el registro se leyó sin lista de campos (modo de respaldo): ahí, si un campo no viene,
 * es porque no existe en Zoho con ese nombre, y el mensaje lo dice.
 */
export function construirPlanAcompanamiento(
  registro: Record<string, unknown>,
  orientacion: Record<string, unknown> | null,
  completo = false,
): Resultado {
  const faltantes: string[] = [];
  const P = CAMPOS_PLAN;
  const noExiste = (campo: string) => (completo && !(campo in registro) ? ` (no se encontró el campo ${campo} en Zoho)` : "");

  const estado = texto(registro[CAMPOS.estado]);
  if (estado !== ESTADO_DILIGENCIADO) {
    faltantes.push(`La participante todavía no diligencia el formulario (estado actual: ${estado || "sin estado"})`);
  }

  const ejes = EJES_PLAN.map((e) => {
    const n = numero(registro[EJES.find((x) => x.id === e.id)!.campo]);
    if (n === null && estado === ESTADO_DILIGENCIADO) faltantes.push(`Porcentaje del eje ${e.id} del diagnóstico`);
    return { id: e.id, lineas: e.lineas, prosa: e.prosa, valor: Math.round(Math.min(100, Math.max(0, n ?? 0))) };
  });

  const fechaLlamada1 = fechaCorta(registro[P.fechaLlamada1]);
  if (!fechaLlamada1) faltantes.push(`Fecha de la llamada 1 (campo «L1 Hora de inico»)${noExiste(P.fechaLlamada1)}`);

  const revision = texto(registro[P.revision]);
  if (!revision) faltantes.push(`Revisión de la profesional${noExiste(P.revision)}`);

  const metas = P.metas
    .map((m) => ({ meta: texto(registro[m.meta]), primerPaso: texto(registro[m.primerPaso]), fecha: fechaCorta(registro[m.fecha]) }))
    .filter((m) => m.meta);
  if (!metas.length) faltantes.push(`Al menos una meta del plan de trabajo${noExiste(P.metas[0].meta)}`);

  if (faltantes.length) return { ok: false, faltantes };

  const barreras = P.barreras
    .map((b) => ({ barrera: texto(registro[b.barrera]), estrategia: texto(registro[b.estrategia]), apoyo: texto(registro[b.apoyo]) }))
    .filter((b) => b.barrera);

  const otraHerramienta = texto(registro[P.herramientaOtra]);
  // «Otro recurso entregado» es una opción de la lista: en el PDF se muestra el recurso concreto que escribió la profesional
  const herramientas = [...lista(registro[P.herramientas]).filter((h) => h !== "Otro recurso entregado"), ...(otraHerramienta ? [otraHerramienta] : [])];

  const profesional = texto(registro[P.profesional]);
  const contacto = (profesional && CONTACTOS_PROFESIONALES[profesional]) || TEXTOS.contactoPorDefecto;

  const fechaLlamada = fechaLarga(registro[P.fechaProximaLlamada]);
  const canal = texto(registro[P.canalContacto]);

  const documento = texto(registro[CAMPOS.documento]) || "No registrado";
  return {
    ok: true,
    data: {
      nombre: texto(registro[CAMPOS.nombreCompleto]) || (nombreDeOrientacion(orientacion) ?? documento),
      documento,
      profesional: profesional || "Tu profesional del programa",
      contacto,
      fechaDiagnostico: fechaCorta(registro[CAMPOS.fechaDiligenciamiento]) || "No registrada",
      fechaLlamada1,
      estadoRuta: estadoParaParticipante(texto(registro[P.estadoCaso])),
      ejes,
      revision,
      fortalezas: lista(registro[CAMPOS.fortalezas]),
      aFortalecer: lista(registro[CAMPOS.aspectosFortalecer]),
      barreras,
      metas,
      herramientas,
      recomendaciones: texto(registro[P.recomendaciones]),
      proximoContacto: fechaLlamada ? { fecha: fechaLlamada, canal: canal || "Por definir" } : null,
    },
  };
}
