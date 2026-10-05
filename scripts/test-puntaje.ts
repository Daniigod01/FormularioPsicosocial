import { calcularDiagnostico, nivelDePuntaje } from "../src/lib/puntaje";
import { esVisible, PREGUNTAS } from "../src/lib/preguntas";

let ok = 0, fail = 0;
function t(nombre: string, cond: boolean, detalle?: unknown) {
  if (cond) { ok++; console.log("  ✔", nombre); } else { fail++; console.log("  ✘", nombre, detalle ?? ""); }
}

console.log("Caso 1: sin riesgo (todo en cero)");
let d = calcularDiagnostico({
  p04_pareja: ["ninguna"], p05_familiar: "no", p06_laboral: "no", p07_comunidad: "no",
  p09_personas: "3_mas", p10_grupo: "si", p11_cuidado: "no",
  p14_emociones: ["ninguna"], p15_situaciones: ["ninguna"], p16_afrontamiento: ["hablar"], p17_alertas: ["ninguna"],
  p18_decisiones: "casi_siempre", p19_dinero: "yo_sola", p20_ahorro: "si", p21_libertad_empleo: "si", p22_control: "no", p25_vivienda: "no",
  p26_barreras: [], p27_exp_formal: "si",
});
t("puntaje 0", d.puntajeTotal === 0, d.puntajeTotal);
t("nivel Bajo", d.nivel === "Bajo");
t("sin banderas", d.banderasRojas.length === 0);

console.log("Caso 2: máximo teórico sin banderas rojas = 100 y Alto por puntaje");
d = calcularDiagnostico({
  p04_pareja: ["insulto", "amenaza", "aislamiento", "control_economico"], p05_familiar: "si", p05_tipo: ["psicologica"], p06_laboral: "si",
  p09_personas: "ninguna", p10_grupo: "no", p11_cuidado: "si", p11_tipo: ["ninos"], p12_barrera: "si", p13_apoyo_cuidado: "no",
  p14_emociones: ["tristeza","culpa","miedo","frustracion","rabia","soledad","humillacion","resentimiento","ansiedad","desesperanza","irritabilidad","apatia","inseguridad"],
  p15_situaciones: ["motivar","no_valgo","procrastino","expresar","desconfio","otra"], p16_afrontamiento: ["nada"], p17_alertas: ["ninguna"],
  p18_decisiones: "casi_nunca", p19_dinero: "otra_persona", p20_ahorro: "no", p21_libertad_empleo: "no", p22_control: "si", p25_vivienda: "si",
  p26_barreras: ["internet","cuidado","conocimientos"], p27_exp_formal: "no",
});
t("puntaje 100", d.puntajeTotal === 100, d.puntajeTotal);
t("ejes 30/20/20/15/15", d.ejes.map((e) => e.puntos).join("/") === "30/20/20/15/15", d.ejes.map((e) => e.puntos));
t("nivel Alto por puntaje", d.nivel === "Alto" && d.banderasRojas.length === 0);
t("alerta naranja activa", d.alertaNaranjaControlEconomico);

console.log("Caso 3: bandera roja sobre puntaje bajo");
d = calcularDiagnostico({
  p04_pareja: ["golpes"], p05_familiar: "no", p06_laboral: "no", p09_personas: "3_mas", p10_grupo: "si", p11_cuidado: "no",
  p14_emociones: ["ninguna"], p15_situaciones: ["ninguna"], p16_afrontamiento: ["hablar"], p17_alertas: ["ninguna"],
  p18_decisiones: "casi_siempre", p19_dinero: "yo_sola", p20_ahorro: "si", p21_libertad_empleo: "si", p22_control: "no", p25_vivienda: "no",
  p26_barreras: [], p27_exp_formal: "si",
});
t("puntaje bajo (0) pero nivel Alto", d.nivelPorPuntaje === "Bajo" && d.nivel === "Alto", d);
t("alerta inmediata", d.alertaPrioritariaInmediata);

console.log("Caso 4: consumo descontrolado → Alto sin alerta inmediata");
d = calcularDiagnostico({ p17_alertas: ["consumo_descontrol"] });
t("Alto", d.nivel === "Alto");
t("sin alerta inmediata", !d.alertaPrioritariaInmediata);
t("muestra líneas de emergencia", d.mostrarLineasEmergencia);

console.log("Caso 5: violencia familiar sin tipo físico/sexual no es bandera");
d = calcularDiagnostico({ p05_familiar: "si", p05_tipo: ["psicologica", "economica"] });
t("sin bandera, suma 8", d.banderasRojas.length === 0 && d.ejes[0].puntos === 8, d.ejes[0]);
d = calcularDiagnostico({ p05_familiar: "si", p05_tipo: ["sexual"] });
t("con tipo sexual: bandera", d.banderasRojas.includes("P5_violencia_familiar_fisica_o_sexual"));

console.log("Caso 6: bandas 29 / 30 / 59 / 60");
t("29 Bajo", nivelDePuntaje(29) === "Bajo");
t("30 Moderado", nivelDePuntaje(30) === "Moderado");
t("59 Moderado", nivelDePuntaje(59) === "Moderado");
t("60 Alto", nivelDePuntaje(60) === "Alto");

console.log("Caso 7: respuestas ocultas por condición no puntúan (P11=No ignora P12/P13)");
d = calcularDiagnostico({ p11_cuidado: "no", p12_barrera: "si", p13_apoyo_cuidado: "no" });
t("eje 2 = 0", d.ejes[1].puntos === 0, d.ejes[1]);

console.log("Caso 8: 'prefiero no responder' en P25 se excluye del % del eje 4");
d = calcularDiagnostico({ p18_decisiones: "casi_nunca", p19_dinero: "otra_persona", p25_vivienda: "prefiero_no" });
t("máximo aplicable 12 y 8/12 = 66.7%", d.ejes[3].maximoAplicable === 12 && d.ejes[3].porcentaje === 66.7, d.ejes[3]);

console.log("Caso 9: tope P14 (12) y P15 (5)");
d = calcularDiagnostico({
  p14_emociones: ["desesperanza","humillacion","resentimiento","tristeza","culpa","miedo","frustracion","rabia","soledad","ansiedad"],
  p15_situaciones: ["motivar","no_valgo","procrastino","expresar","desconfio","otra"],
});
t("eje 3 = 12 + 5 = 17", d.ejes[2].puntos === 17, d.ejes[2]);

console.log("Caso 10: condicional multiselect (P15=otra muestra P15.1)");
const p151 = PREGUNTAS.find((p) => p.id === "p15_otra")!;
t("visible con 'otra'", esVisible(p151, { p15_situaciones: ["otra"] }));
t("oculta sin 'otra'", !esVisible(p151, { p15_situaciones: ["motivar"] }));

console.log(`\n${ok} correctas, ${fail} fallidas`);
process.exit(fail ? 1 : 0);
