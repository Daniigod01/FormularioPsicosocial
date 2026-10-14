import React from "react";
import { Svg, Line, Circle, Polygon, Text as SvgText } from "@react-pdf/renderer";
import type { Dimension } from "./types";

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

const punto = (i: number, radio: number) => {
  const a = (i * 2 * Math.PI) / 6; // sentido horario desde arriba
  return { x: CX + radio * Math.sin(a), y: CY - radio * Math.cos(a) };
};

/** Gráfica de araña de 6 ejes (0 a 100) dibujada con primitivas SVG de react-pdf. */
export function Radar({ dimensiones }: { dimensiones: Dimension[] }) {
  const poligono = dimensiones
    .map((d, i) => {
      const p = punto(i, (R * d.valor) / 100);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <Svg width={RADAR_W} height={RADAR_H} viewBox={`0 0 ${RADAR_W} ${RADAR_H}`}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <Circle key={f} cx={CX} cy={CY} r={R * f} fill="none" stroke={REJILLA} strokeWidth={0.8} />
      ))}
      {dimensiones.map((_, i) => {
        const p = punto(i, R);
        return <Line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke={REJILLA} strokeWidth={0.8} />;
      })}

      <Polygon points={poligono} fill={AZUL} fillOpacity={0.16} stroke={AZUL} strokeWidth={2.2} />
      {dimensiones.map((d, i) => {
        const p = punto(i, (R * d.valor) / 100);
        return <Circle key={d.clave} cx={p.x} cy={p.y} r={3.6} fill={AMARILLO} stroke={AZUL} strokeWidth={1.4} />;
      })}

      {dimensiones.map((d, i) => {
        const p = punto(i, R + 10);
        const anchor = i === 0 || i === 3 ? "middle" : i < 3 ? "start" : "end";
        const alto = (d.lineas.length + 1) * INTERLINEA;
        const arriba = i === 0 ? p.y - alto + 2 : i === 3 ? p.y + 2 : p.y - alto / 2;
        return (
          <React.Fragment key={d.clave}>
            {d.lineas.map((linea, j) => (
              <SvgText key={j} x={p.x} y={arriba + 10 + j * INTERLINEA} textAnchor={anchor} fill={GRAFITO}
                style={{ fontFamily: "Carlito", fontSize: 10 }}>
                {linea}
              </SvgText>
            ))}
            <SvgText x={p.x} y={arriba + 10 + d.lineas.length * INTERLINEA} textAnchor={anchor} fill={AZUL}
              style={{ fontFamily: "Carlito", fontSize: 11.5, fontWeight: 700 }}>
              {`${d.valor}%`}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
