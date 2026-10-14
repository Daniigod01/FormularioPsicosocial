import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { ANCHO, CM, COLOR, LOGO_COLSUBSIDIO, LOGO_FCI, MARGEN } from "./recursos";

const { AZUL, AMARILLO, GRAFITO, GRIS, LINEA } = COLOR;

export const base = StyleSheet.create({
  pagina: { fontFamily: "Carlito", fontSize: 10.5, color: GRAFITO, paddingTop: 3 * CM, paddingBottom: 2.1 * CM, paddingHorizontal: MARGEN },
  encabezado: { position: "absolute", top: 0.9 * CM, left: MARGEN, right: MARGEN, height: 2 * CM, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logos: { flexDirection: "row", alignItems: "center" },
  separador: { width: 0.8, height: 28, backgroundColor: LINEA, marginHorizontal: 14 },
  programa: { fontSize: 14, fontWeight: 700, color: AZUL },
  titulo: { fontSize: 28, fontWeight: 700, color: AZUL, lineHeight: 1.15 },
  barra: { width: 45, height: 3.2, backgroundColor: AMARILLO, marginTop: 5, marginBottom: 7 },
  subtitulo: { fontSize: 11, color: GRIS, lineHeight: 1.35, marginBottom: 14 },
  datos: { borderTopWidth: 0.8, borderTopColor: AZUL, marginBottom: 12 },
  fila: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: LINEA },
  etiqueta: { fontSize: 9, color: GRIS, marginBottom: 1 },
  valor: { fontSize: 11, fontWeight: 700 },
  h2: { fontSize: 14, fontWeight: 700, color: AZUL, marginBottom: 5 },
  pie: { position: "absolute", bottom: 1.0 * CM, left: MARGEN, right: MARGEN, borderTopWidth: 0.6, borderTopColor: LINEA, paddingTop: 7, flexDirection: "row", justifyContent: "space-between" },
  pieTexto: { fontSize: 9, color: GRIS },
});

/** Logos de FCI y Colsubsidio a la izquierda, nombre del programa a la derecha. */
export function Encabezado() {
  return (
    <View style={base.encabezado} fixed>
      <View style={base.logos}>
        <Image src={LOGO_FCI} style={{ height: 1 * CM, width: (1 * CM * 915) / 346 }} />
        <View style={base.separador} />
        <Image src={LOGO_COLSUBSIDIO} style={{ height: 0.72 * CM, width: (0.72 * CM * 1667) / 332 }} />
      </View>
      <Text style={base.programa}>Ruta Mujer</Text>
    </View>
  );
}

export function Pie({ izquierda }: { izquierda: string }) {
  return (
    <View style={base.pie} fixed>
      <Text style={base.pieTexto}>{izquierda}</Text>
      <Text style={base.pieTexto}>Fundación Colombia Incluyente</Text>
    </View>
  );
}

export function Titulo({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  return (
    <>
      <Text style={base.titulo}>{titulo}</Text>
      <View style={base.barra} />
      <Text style={base.subtitulo}>{subtitulo}</Text>
    </>
  );
}

/** Lista de datos (etiqueta pequeña arriba, valor en negrita), en filas de `columnas`. */
export function Datos({ items, columnas }: { items: [string, string][]; columnas: number }) {
  const filas: [string, string][][] = [];
  for (let i = 0; i < items.length; i += columnas) filas.push(items.slice(i, i + columnas));
  return (
    <View style={base.datos}>
      {filas.map((fila, i) => (
        <View key={i} style={base.fila}>
          {fila.map(([e, v]) => (
            <View key={e} style={{ width: `${100 / columnas}%`, paddingVertical: 5, paddingRight: 8 }}>
              <Text style={base.etiqueta}>{e}</Text>
              <Text style={base.valor}>{v}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export { ANCHO };
