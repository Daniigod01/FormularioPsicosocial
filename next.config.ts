import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // react-pdf se carga tal cual en el servidor, sin empaquetarse (PDF del Perfil de riesgo)
  serverExternalPackages: ["@react-pdf/renderer"],
  // incluye la fuente y los logos de /assets en el despliegue de Vercel
  outputFileTracingIncludes: {
    "/api/pdf/perfil-riesgo": ["./assets/**/*"],
  },
};

export default nextConfig;
