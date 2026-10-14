import React from "react";
import { Document, Page, View, Text, Svg, Circle, Path, StyleSheet } from "@react-pdf/renderer";
import { Radar } from "../perfil-riesgo/Radar";
import { Datos, Encabezado, Pie, Titulo, base } from "../pdf-comun/Comun";
import { COLOR } from "../pdf-comun/recursos";
import { TEXTOS } from "./config";
import type { PlanAcompanamientoData } from "./types";

const { AZUL, AMARILLO, GRIS, LINEA } = COLOR;
const TINTE = "#EEF1F7";

const s = StyleSheet.create({
  seccion: { marginBottom: 11 },
  intro: { fontSize: 10, fontStyle: "italic", color: GRIS, lineHeight: 1.3, marginBottom: 5 },
  bloque: { borderLeftWidth: 2.2, borderLeftColor: AZUL, paddingLeft: 10, paddingVertical: 1 },
  bloqueTexto: { fontSize: 10.5, lineHeight: 1.35 },
  encabezadoTabla: { flexDirection: "row", borderBottomWidth: 0.9, borderBottomColor: AZUL, paddingBottom: 4 },
  tituloColumna: { fontSize: 10.5, fontWeight: 700, color: AZUL },
  filaTabla: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: LINEA, paddingVertical: 4.5 },
  celda: { fontSize: 10, lineHeight: 1.25, paddingRight: 10 },
  numero: { fontSize: 12, fontWeight: 700, color: AZUL },
  fila: { flexDirection: "row", alignItems: "flex-start", marginBottom: 5 },
  contacto: { backgroundColor: TINTE, padding: 10, flexDirection: "row" },
  etiqueta: { fontSize: 9, color: GRIS, marginBottom: 1 },
  valor: { fontSize: 11.5, fontWeight: 700 },
  apoyo: { fontSize: 9.5, color: GRIS, lineHeight: 1.35, marginTop: 6 },
  cierre: { backgroundColor: TINTE, borderLeftWidth: 4, borderLeftColor: AMARILLO, paddingVertical: 9, paddingHorizontal: 12 },
  cierreTexto: { fontSize: 11.5, fontStyle: "italic", color: AZUL, textAlign: "center" },
});

function Tabla({ columnas, filas }: { columnas: { titulo: string; ancho: number }[]; filas: (string | number)[][] }) {
  return (
    <View>
      <View style={s.encabezadoTabla}>
        {columnas.map((c) => (
          <Text key={c.titulo} style={[s.tituloColumna, { width: `${c.ancho}%` }]}>{c.titulo}</Text>
        ))}
      </View>
      {filas.map((fila, i) => (
        <View key={i} style={s.filaTabla} wrap={false}>
          {fila.map((celda, j) => (
            <Text key={j} style={[j === 0 && columnas[0].titulo === "#" ? s.numero : s.celda, { width: `${columnas[j].ancho}%` }]}>{celda}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function Visto() {
  return (
    <Svg width={13} height={13} viewBox="0 0 14 14" style={{ marginRight: 9, marginTop: 1 }}>
      <Circle cx={7} cy={7} r={6.3} fill={AZUL} />
      <Path d="M 4 7.2 L 6.2 9.3 L 10 4.9" stroke="#FFFFFF" strokeWidth={1.5} fill="none" />
    </Svg>
  );
}

export function PlanAcompanamientoPdf({ data, ejemplo = false }: { data: PlanAcompanamientoData; ejemplo?: boolean }) {
  const filasFortalezas = Math.max(data.fortalezas.length, data.aFortalecer.length);

  return (
    <Document title={`Mi plan de acompañamiento psicosocial, ${data.nombre}`} author="Fundación Colombia Incluyente">
      <Page size="LETTER" style={base.pagina}>
        <Encabezado />
        <Titulo titulo="Mi plan de acompañamiento psicosocial" subtitulo="Empleabilidad, empoderamiento y autonomía económica." />
        <Datos
          columnas={3}
          items={[
            ["Nombre", data.nombre], ["Documento", data.documento], ["Fecha del diagnóstico", data.fechaDiagnostico],
            ["Profesional que te acompaña", data.profesional], ["Contacto de la profesional", data.contacto], ["Estado en la ruta", data.estadoRuta],
          ]}
        />

        <View style={s.seccion} wrap={false}>
          <Text style={[base.h2, { marginBottom: 4 }]}>Tu mapa de fortalecimiento</Text>
          <Text style={s.intro}>{TEXTOS.introMapa}</Text>
          <View style={{ alignItems: "center" }}>
            <Radar ejes={data.ejes} mostrarValores={false} escala={0.8} />
          </View>
        </View>

        <View style={s.seccion} wrap={false}>
          <Text style={[base.h2, { marginBottom: 4 }]}>Revisión de tu profesional</Text>
          <Text style={s.intro}>{TEXTOS.introRevision}</Text>
          <View style={s.bloque}>
            <Text style={s.bloqueTexto}>{data.revision}</Text>
          </View>
        </View>

        {filasFortalezas > 0 && (
          <View style={s.seccion} wrap={false}>
            <Text style={[base.h2, { marginBottom: 4 }]}>Lo que ya tienes a tu favor</Text>
            <Tabla
              columnas={[{ titulo: "Tus fortalezas", ancho: 50 }, { titulo: "Lo que podemos fortalecer juntas", ancho: 50 }]}
              filas={Array.from({ length: filasFortalezas }, (_, i) => [data.fortalezas[i] ?? "", data.aFortalecer[i] ?? ""])}
            />
          </View>
        )}

        {data.barreras.length > 0 && (
          <View style={s.seccion} wrap={false}>
            <Text style={[base.h2, { marginBottom: 4 }]}>Barreras que identificamos</Text>
            <Tabla
              columnas={[{ titulo: "#", ancho: 6 }, { titulo: "Barrera", ancho: 30 }, { titulo: "Estrategia de superación", ancho: 38 }, { titulo: "Quién apoya", ancho: 26 }]}
              filas={data.barreras.map((b, i) => [i + 1, b.barrera, b.estrategia, b.apoyo])}
            />
          </View>
        )}

        <View style={s.seccion} wrap={false}>
          <Text style={[base.h2, { marginBottom: 4 }]}>Mis tres metas para la próxima semana</Text>
          <Tabla
            columnas={[{ titulo: "#", ancho: 6 }, { titulo: "Meta", ancho: 34 }, { titulo: "Mi primer paso", ancho: 40 }, { titulo: "Para cuándo", ancho: 20 }]}
            filas={data.metas.map((m, i) => [i + 1, m.meta, m.primerPaso, m.fecha])}
          />
        </View>

        {data.herramientas.length > 0 && (
          <View style={s.seccion} wrap={false}>
            <Text style={[base.h2, { marginBottom: 4 }]}>Herramientas y recursos psicosociales</Text>
            <Text style={s.intro}>{TEXTOS.introHerramientas}</Text>
            {data.herramientas.map((h) => (
              <View key={h} style={s.fila}>
                <Visto />
                <Text style={{ flex: 1, fontSize: 10.5, lineHeight: 1.3 }}>{h}</Text>
              </View>
            ))}
          </View>
        )}

        {data.recomendaciones && (
          <View style={s.seccion} wrap={false}>
            <Text style={[base.h2, { marginBottom: 4 }]}>Recomendaciones</Text>
            <Text style={s.intro}>{TEXTOS.introRecomendaciones}</Text>
            <View style={s.bloque}>
              <Text style={s.bloqueTexto}>{data.recomendaciones}</Text>
            </View>
          </View>
        )}

        <View style={s.seccion} wrap={false}>
          <Text style={[base.h2, { marginBottom: 4 }]}>Nuestro próximo contacto</Text>
          {data.proximoContacto && (
            <View style={s.contacto}>
              <View style={{ width: "50%" }}>
                <Text style={s.etiqueta}>Fecha de la próxima llamada</Text>
                <Text style={s.valor}>{data.proximoContacto.fecha}</Text>
              </View>
              <View style={{ width: "50%" }}>
                <Text style={s.etiqueta}>¿Cómo te contactamos?</Text>
                <Text style={s.valor}>{data.proximoContacto.canal}</Text>
              </View>
            </View>
          )}
          <Text style={s.apoyo}>{TEXTOS.lineasApoyo}</Text>
        </View>

        <View style={s.cierre} wrap={false}>
          <Text style={s.cierreTexto}>{TEXTOS.cierre}</Text>
        </View>

        <Pie izquierda={ejemplo ? "Ejemplo con datos ficticios." : "Documento para la participante."} />
      </Page>
    </Document>
  );
}
