import path from "node:path";
import { Font } from "@react-pdf/renderer";

/** Medidas y paleta compartidas por todos los PDF (paleta Colsubsidio). */
export const CM = 28.3465;
export const MARGEN = 1.8 * CM;
export const ANCHO = 612 - 2 * MARGEN;

export const COLOR = {
  AZUL: "#001F5B",
  AMARILLO: "#FFD30F",
  GRAFITO: "#2B2B2B",
  GRIS: "#5F6675",
  LINEA: "#D5DAE6",
  AZUL_CLARO: "#B8C4DE",
};

const ASSETS = path.join(process.cwd(), "assets");
export const LOGO_FCI = path.join(ASSETS, "logos", "fci.png");
export const LOGO_COLSUBSIDIO = path.join(ASSETS, "logos", "colsubsidio.png");

Font.register({
  family: "Carlito",
  fonts: [
    { src: path.join(ASSETS, "fonts", "Carlito-Regular.ttf"), fontWeight: 400 },
    { src: path.join(ASSETS, "fonts", "Carlito-Bold.ttf"), fontWeight: 700 },
    { src: path.join(ASSETS, "fonts", "Carlito-Italic.ttf"), fontWeight: 400, fontStyle: "italic" },
  ],
});
Font.registerHyphenationCallback((palabra) => [palabra]); // sin cortes de palabra
