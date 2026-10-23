# PDF «Mi plan de acompañamiento psicosocial»

Documento **para la participante**, que la profesional genera después de la primera llamada. Sigue la estructura del archivo
«Plan de Acompañamiento - Ruta Mujer» (10 secciones, 2 hojas). Se arma al abrir `/api/pdf/plan-acompanamiento` con el ID del registro de
«Psicosocial RutaM v2»; no se guarda en ningún lado.

> **Importante:** el armado de datos y del PDF está probado (`npm run test:plan`, compilación completa y petición real a la ruta con datos de ejemplo).
> La lectura de Zoho real y el botón **NO se han probado en tu CRM**, y falta ordenar los campos nuevos en su sección del formulario (ver abajo).

## Privacidad: qué NO aparece
Como lo recibe la participante, el PDF **no muestra** nivel de riesgo, puntajes, porcentajes, alertas ni banderas rojas. El radar muestra solo la forma,
sin números, y el «Estado en la ruta» se traduce a tres frases (Primer contacto realizado · Acompañamiento completado · En acompañamiento): nunca sale el
texto interno del CRM, por ejemplo «Remitido». Todo lo que escribe la profesional (revisión, recomendaciones, estrategias) lo ve la participante tal cual:
va en lenguaje cercano.

## De dónde sale cada sección
| Sección del documento | Origen |
|---|---|
| Nombre | Campo «Nombre completo» del registro, que la función del botón copia desde Orientación RutaM al crear el enlace (si falta, se busca en Orientación RutaM) |
| Documento, fecha del diagnóstico | Ya existen: nombre del registro y «Fecha de diligenciamiento» |
| Fecha de la llamada 1 | Ya existe: «L1 Hora de inico» (fecha y hora de inicio de la llamada 1); en el PDF se muestra solo la fecha. Es obligatoria: la profesional debe registrarla |
| Profesional que te acompaña | Campo «Psicosocial encargada» (Angelica Posada o Johana Diaz), de la sección Llamada 1 |
| Contacto de la profesional | `CONTACTOS_PROFESIONALES` en `src/lib/plan-acompanamiento/config.ts`: se escribe ahí el correo o teléfono de cada una. Mientras esté vacío, el plan dice «A través del canal del programa» |
| Estado en la ruta | Ya existe: «Estado del caso (Llamada 1)», traducido a tres frases |
| Tu mapa de fortalecimiento | Los 5 porcentajes del diagnóstico (ya existen). Nombres: Seguridad en mis relaciones · Redes de apoyo y entorno familiar · Bienestar emocional · Autonomía personal y económica · Barreras de empleabilidad |
| Revisión de tu profesional | Campo nuevo «Revisión profesional»: la escribe la profesional |
| Tus fortalezas / Lo que podemos fortalecer juntas | Ya existen: preguntas 28 y 29 del diagnóstico (lo que marcó la participante) |
| Barreras que identificamos | **Barrera 1, 2 y 3 se llenan solas** con las barreras que la participante marcó en la pregunta 26 (una por campo; si marca 2, la tercera queda vacía). La profesional solo escribe la estrategia y quién apoya |
| Mis tres metas para la próxima semana | Campos nuevos: Meta 1, 2 y 3, con su primer paso y fecha límite |
| Herramientas y recursos psicosociales | Ya existe: lista «L1 Herramientas y recursos entregados» y «L1 Otro recurso (cuál)» (la opción «Otro recurso entregado» se reemplaza por el texto) |
| Recomendaciones | Campo nuevo «Recomendaciones del plan» |
| Nuestro próximo contacto | Ya existen: «L1 Fecha agendada Llamada 2» y «L1 Canal de contacto preferido» |

## Campos del módulo «Psicosocial RutaM v2»
Todos existen en tu CRM (los 20 nuevos se crearon el 14-oct-2026) y el código ya usa estos nombres de API.

**Campos nuevos** (creados el 14-oct-2026). Los de la sección «Plan de trabajo y acompañamiento» los llena la profesional en la llamada 1, salvo Barrera 1, 2 y 3, que llegan del formulario:

| Etiqueta | Tipo | Nombre de API | Cómo se llena |
|---|---|---|---|
| Nombre completo | Texto | `Nombre_completo` | La función del botón, al crear el enlace |
| Psicosocial encargada | Lista (Angelica Posada, Johana Diaz) | `Psicosocial_encargada` | La profesional, en la sección Llamada 1 |

Los del plan:

| Etiqueta | Tipo | Nombre de API |
|---|---|---|
| Revisión profesional | Texto largo (2.000 caracteres) | `Revisi_n_profesional` |
| Barrera 1 · Estrategia barrera 1 · Quién apoya barrera 1 | Texto · Texto largo · Texto | `Barrera_1` · `Estrategia_barrera_1` · `Qui_n_apoya_barrera_1` |
| Barrera 2 · Estrategia barrera 2 · Quién apoya barrera 2 | igual | `Barrera_2` · `Estrategia_barrera_2` · `Qui_n_apoya_barrera_2` |
| Barrera 3 · Estrategia barrera 3 · Quién apoya barrera 3 | igual | `Barrera_3` · `Estrategia_barrera_3` · `Qui_n_apoya_barrera_3` |
| Meta 1 · Primer paso meta 1 · Fecha límite meta 1 | Texto · Texto · Fecha | `Meta_1` · `Primer_paso_meta_1` · `Fecha_l_mite_meta_1` |
| Meta 2 · Primer paso meta 2 · Fecha límite meta 2 | igual | `Meta_2` · `Primer_paso_meta_2` · `Fecha_l_mite_meta_2` |
| Meta 3 · Primer paso meta 3 · Fecha límite meta 3 | igual | `Meta_3` · `Primer_paso_meta_3` · `Fecha_l_mite_meta_3` |
| Recomendaciones del plan | Texto largo (hasta 32.000 caracteres) | `Recomendaciones_del_plan` |

**Ya existían** y también se usan: `L1_Herramientas_y_recursos_entregados`, `L1_Otro_recurso_cu_l`, `L1_Fecha_agendada_Llamada_2`,
`L1_Canal_de_contacto_preferido` y `Estado_del_caso_Llamada_1`.

Notas:
- Las etiquetas tienen máximo 25 caracteres (límite de Zoho), por eso se llaman «Revisión profesional» y no «Revisión de la profesional».
- «Recomendaciones del plan» es de texto largo grande porque el módulo ya tenía el máximo de campos de texto largo pequeño.
- Los 20 campos del plan quedan en la primera sección hasta que los muevas; «Psicosocial encargada» conviene moverlo a la sección **Llamada 1**.
- Barreras y metas son opcionales salvo la **Meta 1**. Si solo hay una barrera o dos metas, las demás filas se omiten en el PDF.
- «Plan de salida recomendaciones» (`Plan_de_salida_recomendaciones`) es de la llamada 2; no se usa aquí.

### Sección «Plan de trabajo y acompañamiento» en el formulario
Los 20 campos nuevos quedaron al final de la primera sección («Información de Psicosocial RutaM v2»), porque las herramientas que se usaron no crean
secciones. Para ordenarlos: Configuración → Personalización → Módulos y campos → Psicosocial RutaM v2 → Diseños → Standard →
agrega una sección nueva llamada **Plan de trabajo y acompañamiento** y arrastra a ella los 20 campos, en este orden:
Revisión profesional, Barrera 1 (con su estrategia y quién apoya), Barrera 2, Barrera 3, Meta 1 (con su primer paso y fecha), Meta 2, Meta 3 y Recomendaciones del plan.
Mover los campos de sección no cambia sus nombres de API ni lo que ya guardaste.

## Cuándo se puede generar
Solo si el diagnóstico está **«Diligenciado»** (hace falta para el mapa) y el registro tiene la **revisión profesional**, la **Meta 1** y la **fecha de la llamada 1** (campo «L1 Hora de inico»).
Barreras, herramientas, recomendaciones y próxima llamada son opcionales: si están vacías, esa sección se omite del PDF (un caso de riesgo Bajo
puede no tener próxima llamada). Si falta algo obligatorio, la página lo dice, y si un campo todavía no existe en Zoho, dice cuál.

## 1. Variable en Vercel
Ninguna nueva: usa la misma `PDF_ACCESS_KEY` del perfil de riesgo.

## 2. Probar que el PDF funciona (sin Zoho)
`https://TU-DOMINIO/api/pdf/plan-acompanamiento?demo=1&key=TU_CLAVE`

Debe abrir un PDF de 2 hojas con datos ficticios.

## 3. Ver los campos reales (con Zoho)
`https://TU-DOMINIO/api/pdf/plan-acompanamiento?id=ID_DEL_REGISTRO&key=TU_CLAVE&debug=1`

Devuelve el registro tal como llega de Zoho (**datos reales: úsalo solo con un registro de prueba**). Ahí ves cómo se llaman los campos y subformularios.

## 4. Generar el PDF de un registro
`https://TU-DOMINIO/api/pdf/plan-acompanamiento?id=ID_DEL_REGISTRO&key=TU_CLAVE`

## 5. Botón en Zoho (módulo Psicosocial RutaM v2)
Igual que el del perfil de riesgo: usa las variables `url_formulario` y `clave_pdf`, que ya existen.

1. Configuración → Developer Hub → Funciones → Nueva función. Nombre: `abrirPlanAcompanamiento` · Categoría: **Botón** · Parámetro: `registroId` (texto).

```deluge
string button.abrirPlanAcompanamiento(string registroId)
{
  enlacePdf = zoho.crm.getOrgVariable("url_formulario") + "/api/pdf/plan-acompanamiento?id=" + registroId + "&key=" + zoho.crm.getOrgVariable("clave_pdf");
  openUrl(enlacePdf, "new window");
  return "";
}
```
2. Módulo **Psicosocial RutaM v2** → Enlaces y botones → Nuevo botón: **Generar plan de acompañamiento**, vista de detalle, acción «Escribir una función»,
   con `registroId` asignado al **ID de registro del propio módulo** (no a «Participante RutaM»).

> Como los otros botones, no se ha probado en tu CRM.

## Si algo no sale
| Lo que ves | Qué significa |
|---|---|
| «No tienes acceso a este documento» | La clave no coincide con `PDF_ACCESS_KEY` |
| «Todavía no se puede generar el plan…» + lista | Falta algo obligatorio. Si dice «no se encontró el campo X en Zoho», ese campo no existe o se llama distinto |
| «No se pudo generar el documento» | Error al leer Zoho; el detalle queda en los registros (logs) de Vercel |
