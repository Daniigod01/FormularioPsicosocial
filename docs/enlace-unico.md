# Enlace único por participante

Formato: `https://<dominio-del-formulario>/?t=<idRegistro>.<firma>`

- `idRegistro`: id del registro de la participante en Zoho (el que irá en el lookup **Participante**).
- `firma`: HMAC-SHA256 en **hexadecimal** de `idRegistro`, usando el secreto `ZOHO_LINK_SECRET`.

El servidor verifica la firma (`verificarToken` en `src/lib/zoho.ts`). Si es válida, el registro del diagnóstico
queda vinculado a esa participante; si falta o es inválida, el diagnóstico se guarda **sin** vincular.

Generar el enlace desde Zoho (botón/función en el CRM) queda pendiente: ver README, pasos siguientes.
