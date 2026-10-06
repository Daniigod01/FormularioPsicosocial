# Botón de Zoho: «Generar enlace de diagnóstico»

La orientadora presiona UN botón en el registro de la participante (módulo **Orientación RutaM**). Zoho crea el registro
psicosocial, pide el enlace al formulario y lo **guarda en el campo «Enlace del formulario»**
(`Enlace_del_formulario`, ya creado en «Psicosocial RutaM v2»). La orientadora lo copia y se lo
envía por el canal que prefiera (WhatsApp, SMS, correo o llamada). No hace falta conectar nada a Zoho.

> **Importante:** el lado del formulario (`/api/enlace`, `/api/sesion`, `/api/enviar`) está probado.
> El código Deluge de este documento **NO se ha probado en tu CRM**: la sintaxis y las pantallas de
> configuración de Zoho pueden variar un poco. Pruébalo primero con UNA participante de prueba.

## 1. Variables del servidor (Vercel)

| Variable | Para qué |
|---|---|
| `ENLACE_API_KEY` | Clave que Zoho envía en la cabecera `x-api-key`. Cadena larga aleatoria, distinta de `ZOHO_LINK_SECRET`. |
| `URL_FORMULARIO` | Dirección pública del formulario, sin "/" final. Ej.: `https://mi-formulario.vercel.app` |
| `ENLACE_DIAS` | (Opcional) Días de vigencia. Por defecto 7. Máximo 30. |
| `PERMITIR_SIN_ENLACE` | (Solo pruebas) `1` deja abrir el formulario sin enlace. **Quitar en producción.** |

## 2. Variables de organización en Zoho (Configuración → Developer Hub → Variables)

| Nombre API | Valor |
|---|---|
| `url_formulario` | la misma `URL_FORMULARIO` |
| `clave_enlace` | la misma `ENLACE_API_KEY` |

## 3. Función (Configuración → Developer Hub → Funciones → Nueva función)

Nombre: `generarEnlaceDiagnostico` · Categoría: **Botón** · Parámetro: `participanteId` (texto)

> La primera línea **debe llevar la categoría** (`button.`). Si Zoho muestra un error de «Improper code format»,
> revisa que esa línea coincida con la categoría elegida (o déjala como la genera la plantilla de Zoho y cambia solo el nombre y el parámetro).

```deluge
string button.generarEnlaceDiagnostico(string participanteId)
{
  idPart = participanteId.toLong();
  p = zoho.crm.getRecordById("Orientaci_n_Colsubsidios", idPart);
  nombre = ifnull(p.get("Name"), "");  // en Orientación RutaM el nombre del registro es el número de documento

  // 1) Registro psicosocial en estado «Enlace enviado», ligado a la participante
  reg = Map();
  reg.put("Name", nombre);
  reg.put("Participante_RutaM", {"id": idPart});
  reg.put("Estado_del_diagn_stico", "Enlace enviado");
  creado = zoho.crm.createRecord("Psicosocial_RutaM_v2", reg);
  idReg = creado.get("id");

  // 2) Pedir el enlace firmado al formulario
  cuerpo = Map();
  cuerpo.put("id", idReg.toString());
  cab = Map();
  cab.put("x-api-key", zoho.crm.getOrgVariable("clave_enlace"));
  cab.put("Content-Type", "application/json");
  resp = invokeurl
  [
    url : zoho.crm.getOrgVariable("url_formulario") + "/api/enlace"
    type : POST
    parameters : cuerpo.toString()
    headers : cab
  ];
  enlace = resp.get("url");

  // 3) Guardar el enlace en el campo para que la orientadora lo copie
  cambios = Map();
  cambios.put("Enlace_del_formulario", enlace);
  zoho.crm.updateRecord("Psicosocial_RutaM_v2", idReg.toLong(), cambios);

  return "Enlace generado. Búscalo en el registro psicosocial de esta participante, campo «Enlace del formulario», y envíaselo.";
}
```

## 4. Crear el botón
1. Configuración → Personalización → Módulos y campos → **Orientación RutaM** → **Enlaces y botones** → Nuevo botón.
2. Nombre: **Generar enlace de diagnóstico**. Ubicación: **Vista de detalle**.
3. Acción: **Escribir una función** → elegir `generarEnlaceDiagnostico` y asignar `participanteId` al **ID de registro**.
4. (Recomendado) Agregar «Enlace del formulario» a la lista relacionada o a las columnas de la vista de «Psicosocial RutaM v2» para encontrarlo rápido.

## Cómo se usa
1. La orientadora abre el registro de la participante en Orientación RutaM → **Generar enlace de diagnóstico**.
2. Abre el registro psicosocial nuevo (estado «Enlace enviado») → copia el campo **Enlace del formulario**.
3. Se lo envía a la participante por el canal que prefiera. (El campo «Canal de envío del enlace» lo puede llenar a mano.)
4. Cuando la participante responde, ese mismo registro pasa a «Diligenciado» con el nivel de riesgo y las alertas.

## Limitaciones a tener presentes
- «Enlace enviado» significa **enlace generado**, no entregado: Zoho no sabe si el mensaje salió.
- Cada vez que se presiona el botón se **crea un registro nuevo**. Para reenviar el mismo enlace, se copia del registro existente; si venció (7 días), se presiona el botón de nuevo y el registro viejo se puede eliminar.
- Un enlace sirve **una sola vez**: después de responder, abrirlo muestra «Ya recibimos tus respuestas».

## Qué verificar en la primera prueba
- Se crea el registro psicosocial con la participante y estado «Enlace enviado».
- El campo «Enlace del formulario» trae una dirección que empieza con la de tu formulario.
- Al abrirla sale el formulario (y NO el mensaje de enlace inválido).
- Al enviar, el **mismo** registro pasa a «Diligenciado» (no aparece uno nuevo).
- Abrir el mismo enlace otra vez muestra «Ya recibimos tus respuestas…».

## Nota sobre módulos
- El botón vive en **Orientación RutaM** (`Orientaci_n_Colsubsidios`): ahí están las participantes (el nombre del registro es el número de documento).
- El diagnóstico se liga con el campo **Participante RutaM** (`Participante_RutaM`).
- El campo viejo «Participante» apunta a **Orientador RutaM** (otro módulo) y ya no se usa; se puede eliminar.
