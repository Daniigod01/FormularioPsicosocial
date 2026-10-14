import React from "react";
import { Svg, Line, Circle, Polygon, Text as SvgText } from "@react-pdf/renderer";
import type { EjePerfil } from "./types";

const AZUL = "#001F5B";
const AMARILLO = "#FFD30F";
const GRAFITO = "#2B2B2B";
const REJILLA = "#D5DAE6";

export const RADAR_W = 280;
export const RADAR_H = 246;

const CX = RADAR_W / 2;
const CY = 120;
const R = 70;
const INTERLINEA = 13;

/** Punto a `radio` del centro para el eje `i` de `n` (sentido horario, empezando arriba). */
const punto = (i: number, n: number, radio: number) => {
  const a = (i * 2 * Math.PI) / n;
  return { x: CX + radio * Math.sin(a), y: CY - radio * Math.cos(a), sen: Math.sin(a), cos: Math.cos(a) };
};

/** Gráfica de araña (0 a 100) con cualquier número de ejes, dibujada con primitivas SVG de react-pdf. */
export function Radar({ ejes }: { ejes: EjePerfil[] }) {
  const n = ejes.length;
  const poligono = ejes
    .map((e, i) => {
      const p = punto(i, n, (R * e.valor) / 100);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <Svg width={RADAR_W} height={RADAR_H} viewBox={`0 0 ${RADAR_W} ${RADAR_H}`}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <Circle key={f} cx={CX} cy={CY} r={R * f} fill="none" stroke={REJILLA} strokeWidth={0.8} />
      ))}
      {ejes.map((e, i) => {
        const p = punto(i, n, R);
        return <Line key={e.id} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke={REJILLA} strokeWidth={0.8} />;
      })}

      <Polygon points={poligono} fill={AZUL} fillOpacity={0.16} stroke={AZUL} strokeWidth={2.2} />
      {ejes.map((e, i) => {
        const p = punto(i, n, (R * e.valor) / 100);
        return <Circle key={e.id} cx={p.x} cy={p.y} r={3.6} fill={AMARILLO} stroke={AZUL} strokeWidth={1.4} />;
      })}

      {ejes.map((e, i) => {
        const p = punto(i, n, R + 10);
        const anchor = p.sen > 0.25 ? "start" : p.sen < -0.25 ? "end" : "middle";
        const alto = (e.lineas.length + 1) * INTERLINEA;
        // arriba: el bloque va sobre el punto; abajo: bajo el punto; a los lados: centrado
        const arriba = p.y - (alto * (1 + p.cos)) / 2;
        return (
          <React.Fragment key={e.id}>
            {e.lineas.map((linea, j) => (
              <SvgText key={j} x={p.x} y={arriba + 10 + j * INTERLINEA} textAnchor={anchor} fill={GRAFITO}
                style={{ fontFamily: "Carlito", fontSize: 10 }}>
                {linea}
              </SvgText>
            ))}
            <SvgText x={p.x} y={arriba + 10 + e.lineas.length * INTERLINEA} textAnchor={anchor} fill={AZUL}
              style={{ fontFamily: "Carlito", fontSize: 11.5, fontWeight: 700 }}>
              {`${e.valor}%`}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
