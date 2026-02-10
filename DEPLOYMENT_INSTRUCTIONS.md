# 🔧 Instrucciones para Actualizar Google Apps Script

## Paso 1: Copiar el Código Actualizado

1. Abre el archivo `GoogleAppsScript.gs` en tu editor
2. Selecciona TODO el contenido (Cmd+A)
3. Copia el código (Cmd+C)

## Paso 2: Actualizar en Google Apps Script

1. Ve a tu Google Sheet de Nutria
2. Haz clic en **Extensiones** → **Apps Script**
3. En el editor de Apps Script, selecciona TODO el código existente
4. Pega el nuevo código (Cmd+V)
5. Haz clic en **Guardar** (icono de diskette o Cmd+S)

## Paso 3: Crear Nuevo Deployment

⚠️ **IMPORTANTE**: Debes crear un NUEVO deployment para que los cambios surtan efecto.

1. En el editor de Apps Script, haz clic en **Implementar** → **Nueva implementación**
2. Haz clic en el icono de engranaje ⚙️ junto a "Seleccionar tipo"
3. Selecciona **Aplicación web**
4. Configura:
   - **Descripción**: "Nutria v2 - Columnas individuales para perfil"
   - **Ejecutar como**: "Yo (tu email)"
   - **Quién tiene acceso**: "Cualquier persona"
5. Haz clic en **Implementar**
6. Copia la **URL de la aplicación web** (será algo como `https://script.google.com/macros/s/AKfycby.../exec`)

## Paso 4: Actualizar .env.local

1. Abre el archivo `.env.local` en tu proyecto
2. Actualiza la variable `VITE_GOOGLE_SHEET_URL` con la nueva URL que copiaste
3. Guarda el archivo

## Paso 5: Reiniciar el Servidor de Desarrollo

En la terminal donde está corriendo `npm run dev`:
1. Presiona `Ctrl+C` para detener el servidor
2. Ejecuta `npm run dev` nuevamente

## Paso 6: Limpiar la Hoja _UsersAuth_

Para evitar problemas con datos antiguos:

1. Ve a tu Google Sheet
2. Haz clic en **Ver** → **Hojas ocultas** → **_UsersAuth_**
3. **Elimina todas las filas de usuarios** (excepto la fila de encabezados)
4. Verifica que la fila 1 tenga estas columnas en este orden:
   ```
   Username | Password | CreatedAt | FullName | Frutas | Leches | Vegetales | Harinas | Proteinas | Grasas | Calorias | ExercisePlan | Indications | LiquidLiters | WeightActual | WeightMeta
   ```
5. Si las columnas no están correctas, el script las actualizará automáticamente en el próximo signup/login

## Paso 7: Probar

1. Ve a http://localhost:3001/Nutria/
2. Crea un nuevo usuario (por ejemplo, `toto2` / `toto2`)
3. Llena la ficha nutricional con valores de prueba
4. Guarda los cambios
5. Ve a Google Sheets → _UsersAuth_ y verifica que los datos se guardaron en las columnas correctas
6. Cierra sesión y vuelve a iniciar sesión
7. Abre "Mi Ficha" y confirma que los datos persisten

---

## ⚠️ Notas Importantes

- **NO uses los usuarios antiguos** (tete, test_user) hasta que actualices sus filas manualmente o los elimines y los vuelvas a crear
- El nuevo código es **compatible con hojas antiguas** - actualizará automáticamente los encabezados
- Cada vez que hagas cambios en `GoogleAppsScript.gs`, debes crear un **nuevo deployment** en Google Apps Script
