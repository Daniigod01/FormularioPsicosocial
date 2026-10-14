import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { Radar, RADAR_W } from "./Radar";
import { unir } from "./build-data";
import { Datos, Encabezado, Pie, Titulo, base } from "../pdf-comun/Comun";
import { ANCHO, COLOR } from "../pdf-comun/recursos";
import type { Nivel, PerfilRiesgoData } from "./types";

const { AZUL, AMARILLO, GRIS, AZUL_CLARO } = COLOR;
const PANEL_W = 170;
const PANEL_PAD = 16;

const s = StyleSheet.create({
  hero: { flexDirection: "row", alignItems: "center" },
  panel: { width: PANEL_W, marginLeft: 11, backgroundColor: AZUL, padding: PANEL_PAD, minHeight: 214, justifyContent: "center" },
  panelEtiqueta: { fontSize: 10, color: AZUL_CLARO },
  nivel: { fontSize: 38, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.1, marginBottom: 4 },
  escala: { flexDirection: "row", marginBottom: 12 },
  panelValor: { fontSize: 12, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.25, marginTop: 1, marginBottom: 9 },
  alerta: { fontSize: 11, fontWeight: 700, color: AMARILLO, lineHeight: 1.25, marginTop: 1 },
  nota: { fontSize: 9.5, color: GRIS, marginTop: 3, marginBottom: 12 },
  dos: { flexDirection: "row" },
  columna: { width: "50%", borderLeftWidth: 2.2, borderLeftColor: AZUL, paddingLeft: 9, paddingRight: 11 },
  h2: { fontSize: 14, fontWeight: 700, color: AZUL, marginBottom: 3 },
  parrafo: { fontSize: 10, lineHeight: 1.35, marginBottom: 3 },
  subtitulo: { fontSize: 10, fontWeight: 700, lineHeight: 1.35, marginTop: 3 },
  viñeta: { flexDirection: "row", marginBottom: 2 },
});

function Escala({ nivel }: { nivel: Nivel }) {
  const niveles: Nivel[] = ["Bajo", "Moderado", "Alto"];
  const ancho = (PANEL_W - 2 * PANEL_PAD - 4) / 3;
  return (
    <View style={s.escala}>
      {niveles.map((n, i) => {
        const activo = n === nivel;
        return (
          <View key={n} style={{ width: ancho, height: 20, marginRight: i < 2 ? 2 : 0, alignItems: "center", justifyContent: "center",
            backgroundColor: activo ? AMARILLO : "transparent", borderWidth: activo ? 0 : 0.8, borderColor: "#5E75A8" }}>
            <Text style={{ fontSize: 9.5, fontWeight: activo ? 700 : 400, color: activo ? AZUL : AZUL_CLARO }}>{n}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function PerfilRiesgoPdf({ data, ejemplo = false }: { data: PerfilRiesgoData; ejemplo?: boolean }) {
  const hayContexto = data.barreras.length > 0 || data.fortalezas.length > 0 || data.aspectosFortalecer.length > 0;

  return (
    <Document title={`Perfil de riesgo psicosocial, ${data.participante}`} author="Fundación Colombia Incluyente">
      <Page size="LETTER" style={base.pagina}>
        <Encabezado />
        <Titulo
          titulo="Perfil de riesgo psicosocial"
          subtitulo="Resultado del diagnóstico autoaplicado. Sirve para preparar la primera llamada y definir cuánto acompañamiento necesita la participante."
        />
        <Datos
          columnas={3}
          items={[
            ["Participante", data.participante], ["Documento", data.documento], ["Fecha de diligenciamiento", data.fechaDiligenciamiento],
            ["Motivo de atención", data.motivo], ["Teléfono", data.telefono], ["Correo electrónico", data.correo],
          ]}
        />

        <View style={s.hero}>
          <View style={{ width: ANCHO - PANEL_W - 11, alignItems: "center" }}>
            <Radar ejes={data.ejes} />
          </View>
          <View style={s.panel}>
            <Text style={s.panelEtiqueta}>Nivel de riesgo</Text>
            <Text style={s.nivel}>{data.nivel}</Text>
            <Escala nivel={data.nivel} />
            {data.puntajeTotal !== null && (
              <>
                <Text style={s.panelEtiqueta}>Puntaje total</Text>
                <Text style={s.panelValor}>{`${Math.round(data.puntajeTotal)} de 100`}</Text>
              </>
            )}
            <Text style={s.panelEtiqueta}>Intensidad de acompañamiento</Text>
            <Text style={s.panelValor}>{data.intensidad}</Text>
            {data.alertaInmediata && <Text style={s.alerta}>Alerta prioritaria inmediata</Text>}
            {data.alertaControlEconomico && <Text style={s.alerta}>Revisar posible control económico</Text>}
          </View>
        </View>
        <Text style={s.nota}>
          Cada porcentaje indica el nivel de riesgo o necesidad en ese eje: mientras más alto, más atención requiere.
        </Text>

        <View style={s.dos} wrap={false}>
          <View style={s.columna}>
            <Text style={s.h2}>Para tener en cuenta en la llamada</Text>
            <Text style={s.parrafo}>{data.lecturaRapida}</Text>
            {data.banderas.length > 0 && (
              <>
                <Text style={s.subtitulo}>Banderas rojas activas</Text>
                {data.banderas.map((b) => (
                  <View key={b} style={s.viñeta}>
                    <Text style={{ width: 10, fontSize: 10 }}>•</Text>
                    <Text style={{ flex: 1, fontSize: 10, lineHeight: 1.3 }}>{b}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
          <View style={[s.columna, { marginLeft: 11, paddingRight: 0 }]}>
            <Text style={s.h2}>Barreras y fortalezas</Text>
            {!hayContexto && <Text style={s.parrafo}>La participante no registró barreras ni fortalezas.</Text>}
            {data.barreras.length > 0 && <Text style={s.parrafo}>{`Barreras que señaló: ${unir(data.barreras)}.`}</Text>}
            {data.fortalezas.length > 0 && <Text style={s.parrafo}>{`Fortalezas: ${unir(data.fortalezas)}.`}</Text>}
            {data.aspectosFortalecer.length > 0 && <Text style={s.parrafo}>{`Quiere fortalecer: ${unir(data.aspectosFortalecer)}.`}</Text>}
          </View>
        </View>

        <Pie izquierda={ejemplo ? "Ejemplo con datos ficticios. Uso interno de la profesional." : "Confidencial. Uso interno de la profesional."} />
      </Page>
    </Document>
  );
}
