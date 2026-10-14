# Diagnóstico Psicosocial — Ruta Mujer (Colsubsidio · Fundación Colombia Incluyente)

Formulario web autoaplicado (Next.js 16 + Tailwind 4) que calcula el nivel de riesgo en el servidor y lo envía al CRM Zoho,
módulo «Información Psicosocial». Base: el proyecto del formulario de empresas.

## Estado

| Pieza | Estado |
|---|---|
| 30 preguntas en `src/lib/preguntas_data.json` (con condicionales, máx. 3, opciones excluyentes) | ✅ |
| Motor de puntaje, banderas rojas, alerta naranja (`src/lib/puntaje.ts`) | ✅ 23 pruebas (`npm run test:puntaje`) |
| Interfaz: consentimiento, aviso de seguridad, botón Salir, líneas 106/155/123, pasos, cierre | ✅ |
| `POST /api/enviar`: calcula en el servidor, no devuelve puntaje a la participante | ✅ |
| Mapeo formulario → campos de Zoho (`src/lib/zoho-campos.ts`, generado de los metadatos reales) | ✅ 17 pruebas (`npm run test:zoho`) |
| Envío a Zoho: crear registro (sin enlace, solo pruebas) | ✅ probado contra Zoho real |
| Enlace único con vencimiento: `/api/enlace` (lo llama Zoho), `/api/sesion` (valida al abrir), `/api/enviar` (ACTUALIZA el registro, un solo uso) | ✅ 33 pruebas con Zoho simulado · ⏳ falta probarlo con Zoho real |
| Campo «Enlace del formulario» en Zoho | ✅ creado |
| Botón «Generar enlace de diagnóstico» (guarda el enlace en ese campo; la orientadora lo copia) | ⏳ código en `docs/zoho-botones.md`, sin probar en el CRM |
| Mostrar datos prellenados (nombre, documento…) dentro del formulario | ⏳ |
| PDF «Perfil de riesgo psicosocial» (`/api/pdf/perfil-riesgo`): gráfica de araña de 5 ejes, nivel, alertas, banderas, barreras y fortalezas | ✅ 23 pruebas (`npm run test:pdf`) y petición real a la ruta · ⏳ falta probarlo con Zoho real (ver `docs/pdf-perfil-riesgo.md`) |
| PDF del plan de trabajo y seguimiento, llamadas 1 y 2 en Zoho | ⏳ en espera de la estructura nueva |

Campos del CRM: `docs/campos-zoho-psicosocial.xlsx` (hoja «Pendientes» = decisiones por confirmar con la solicitante).

## Correr en local

```bash
npm install
npm run dev          # http://localhost:3000
npm run test:puntaje # pruebas del motor
npm run test:pdf     # pruebas del armado de datos del PDF
```

## Variables de entorno (Vercel)

- `NEXT_PUBLIC_URL_SALIDA` — página neutra del botón «Salir» (por defecto `https://www.google.com`).
- `PDF_ACCESS_KEY` — clave para abrir el PDF del Perfil de riesgo (ver `docs/pdf-perfil-riesgo.md`).
- `ZOHO_*` — ver `.env.example`. Sin `ZOHO_REFRESH_TOKEN` corre en modo prueba (no guarda nada).

## Decisiones de diseño

- El navegador envía solo respuestas; **el puntaje y el nivel se calculan en `/api/enviar`**.
- No se usa localStorage ni Postgres: las respuestas viven en memoria hasta el envío y luego solo en Zoho.
- Las respuestas de preguntas ocultas por condición no puntúan.
- El texto de autorización de datos (pantalla inicial) es provisional: debe validarse.

## Si cambian los campos u opciones en Zoho

`src/lib/zoho-campos.ts` se generó con los metadatos de «Psicosocial RutaM v2» (5-oct-2026) y usa los **valores internos**
de las listas. Si se renombra, recrea o cambia el tipo de un campo, hay que regenerarlo (Zoho cambia el nombre API al recrear un campo).
Campos del módulo que el formulario NO llena: los de las llamadas 1 y 2 (los diligencia la profesional en el CRM).
