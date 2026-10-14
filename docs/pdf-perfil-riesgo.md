# PDF «Perfil de riesgo psicosocial»

Documento de **uso interno** de la profesional: gráfica de araña con los 5 ejes del diagnóstico, nivel de riesgo, puntaje total,
alertas, banderas rojas, barreras y fortalezas. Se genera al abrir `/api/pdf/perfil-riesgo` con el ID del registro de
«Psicosocial RutaM v2». No se guarda en ningún lado: se arma en el momento a partir de lo que hay en el CRM.

> **Importante:** el armado de los datos y del PDF está probado (`npm run test:pdf`, compilación completa y petición real a la ruta).
> La lectura de Zoho real y el botón **NO se han probado en tu CRM**. Pruébalo primero con UNA participante de prueba.

## Cuándo se puede generar
Solo si el registro está en estado **«Diligenciado»** y trae el nivel de riesgo y los 5 porcentajes de los ejes.
Si falta algo, la página lo dice en lugar de entregar un PDF incompleto.

## 1. Variable en Vercel
| Variable | Para qué |
|---|---|
| `PDF_ACCESS_KEY` | Clave para abrir el PDF. Cadena larga aleatoria, distinta de `ZOHO_LINK_SECRET` y de `ENLACE_API_KEY`. |

Las demás (`ZOHO_*`) ya existen. El refresh token necesita permiso de **lectura** en «Psicosocial RutaM v2» y, para mostrar el nombre,
también en «Orientación RutaM». Si no puede leer Orientación, el PDF sale igual y muestra el número de documento como participante.

## 2. Probar que el PDF funciona (sin Zoho)
Con la app desplegada, abre en el navegador:

`https://TU-DOMINIO/api/pdf/perfil-riesgo?demo=1&key=TU_CLAVE`

Debe abrir un PDF de ejemplo con datos ficticios. Si abre, el despliegue, la fuente y los logos están bien.

## 3. Ver los campos reales (con Zoho)
`https://TU-DOMINIO/api/pdf/perfil-riesgo?id=ID_DEL_REGISTRO&key=TU_CLAVE&debug=1`

Devuelve los registros tal como llegan de Zoho (**datos reales de la participante: úsalo solo con un registro de prueba**).
Sirve para ver cómo se llaman los campos de nombre en Orientación RutaM: si el PDF no muestra el nombre, anota esos campos en
`CAMPOS_NOMBRE_ORIENTACION` de `src/lib/perfil-riesgo/config.ts` (por ejemplo `["Nombres", "Apellidos"]`).

## 4. Generar el PDF de un registro
`https://TU-DOMINIO/api/pdf/perfil-riesgo?id=ID_DEL_REGISTRO&key=TU_CLAVE`

## 5. Botón en Zoho (módulo Psicosocial RutaM v2)
Opción recomendada: una función que guarda la clave en una variable de organización (así no queda escrita en el botón).

1. Configuración → Developer Hub → Variables: crear `clave_pdf` con el mismo valor de `PDF_ACCESS_KEY`
   (la variable `url_formulario` ya existe).
2. Configuración → Developer Hub → Funciones → Nueva función. Nombre: `abrirPerfilRiesgo` · Categoría: **Botón** · Parámetro: `registroId` (texto).

```deluge
void button.abrirPerfilRiesgo(string registroId)
{
  url = zoho.crm.getOrgVariable("url_formulario") + "/api/pdf/perfil-riesgo?id=" + registroId + "&key=" + zoho.crm.getOrgVariable("clave_pdf");
  openUrl(url, "new window");
}
```
3. Configuración → Personalización → Módulos y campos → **Psicosocial RutaM v2** → Enlaces y botones → Nuevo botón.
   Nombre: **Generar perfil de riesgo**. Ubicación: **Vista de detalle** (o la lista). Acción: **Escribir una función** →
   `abrirPerfilRiesgo`, con `registroId` asignado al **ID de registro**.

> Igual que `generarEnlaceDiagnostico`, este código Deluge no se ha probado en tu CRM: la sintaxis o las pantallas pueden variar un poco.
> Alternativa más simple: un botón de tipo «Abrir una URL» con
> `https://TU-DOMINIO/api/pdf/perfil-riesgo?id=${Psicosocial_RutaM_v2.Id}&key=TU_CLAVE` (la clave queda visible para quien edite el botón).

## Si algo no sale
| Lo que ves | Qué significa |
|---|---|
| «No tienes acceso a este documento» | La clave del botón no coincide con `PDF_ACCESS_KEY`. |
| «Faltan las variables de Zoho en el servidor» | No está `ZOHO_REFRESH_TOKEN` en Vercel. |
| «Todavía no se puede generar el perfil de riesgo» + lista | Falta algo en el registro (por ejemplo, la participante no ha enviado el formulario). |
| «Selecciona un solo registro» | El botón está en la lista y hay varios registros marcados. |
| «No se pudo generar el documento» | Error al leer Zoho; el detalle queda en los registros (logs) de Vercel. |
