# Guía rápida para ejecutar el proyecto (Windows / PowerShell)

Esta guía explica cómo instalar dependencias y arrancar tanto el frontend (Next.js) como el backend (carpeta `server/`). Incluye comandos PowerShell listos para copiar/pegar y pasos para resolver el problema conocido de compatibilidad entre `fastify` y `@fastify/cors`.

## Requisitos
- Node.js 18+ (recomendado). Comprueba la versión:

```powershell
node -v
```

- pnpm recomendado (hay `pnpm-lock.yaml`). Opcional: instalar pnpm si no lo tienes:

```powershell
npm install -g pnpm
pnpm -v
```

## 1) Instalar dependencias (raíz del proyecto)
- Abre PowerShell en la raíz del proyecto, por ejemplo `D:\elias2\Desktop\CICLO2\IA\PROYECTO`.
- Instala con pnpm (recomendado) o npm si no quieres usar pnpm:

```powershell
# desde la raíz
pnpm install
# o con npm
npm install
```

## 2) Ejecutar el frontend (Next.js)
- Desarrollo:

```powershell
# desde la raíz del proyecto
pnpm dev
# o con npm
npm run dev
```

- Abre: http://localhost:3000

- Build y start (producción local):

```powershell
pnpm build
pnpm start
# o
npm run build
npm start
```

## 3) Ejecutar el backend (carpeta `backend/`)
- Cambia al directorio `backend`:

```powershell
cd .\backend
```

- Copia el `.env.example` a `.env` (ya hay un `.env` configurado):

```powershell
copy .env.example .env
# El archivo .env ya está configurado con valores por defecto
```

- Instala dependencias del backend:

```powershell
# dentro de backend/
pnpm install
# o
npm install
```

- Ejecuta el backend en modo desarrollo:

```powershell
pnpm dev
# o
npm run dev
```

- Por defecto el backend usa el puerto 4000. Verás el mensaje: `✅ Server is running on port 4000`

## 4) Configurar Stockfish (Opcional pero recomendado)

Stockfish es el motor de ajedrez que proporciona la IA. El backend funcionará sin él pero con movimientos aleatorios.

### Windows:
1. Descarga Stockfish desde [stockfishchess.org](https://stockfishchess.org/download/)
2. Extrae el archivo y copia la ruta de `stockfish.exe`
3. Edita `backend/.env` y añade: `STOCKFISH_PATH=C:\ruta\a\stockfish.exe`

### Linux:
```bash
sudo apt-get install stockfish
```

### Mac:
```bash
brew install stockfish
```

Si Stockfish está en el PATH del sistema, no necesitas configurar `STOCKFISH_PATH`.

## 5) Troubleshooting rápido

- Si ves errores TypeScript en el editor sobre módulos instalados (ej. `Cannot find module 'lucide-react'`): reinicia el servidor de TypeScript/TS Server en tu editor (VSCode: Command Palette → "TypeScript: Restart TS Server").
- Si algo falla en la instalación: borra `node_modules` y reinstala en la carpeta problematica:

```powershell
# dentro de server
rm -r node_modules
pnpm install
```

- Para comprobar que el backend responde desde PowerShell (simple check):

```powershell
Invoke-WebRequest http://localhost:4000 -UseBasicParsing
```

## 6) Notas sobre SSR / hydratation warnings

- El proyecto ya contiene correcciones para evitar diferencias server/client (evitar `Date.now()` / `Math.random()` en render server-side). Si ves advertencias de "hydration mismatch" revisa la consola del navegador y busca componentes que usen valores no determinísticos en el render inicial.

## 7) ¿Quieres que haga el cambio por ti?

- Puedo aplicar la Opción A (downgrade de `fastify` en `server/package.json`) y luego arrancar el servidor aquí, y te muestro los logs.
- Si quieres que lo haga, confirma y lo hago (haré los cambios mínimos y te mostraré el resultado). Si prefieres intentar tú primero, sigue la Opción A localmente.

## 8) Resumen de comandos más usados (PowerShell)

```powershell
# desde la raíz
pnpm install
pnpm dev

# backend
cd .\server
copy .env.example .env
pnpm install
pnpm dev

# arreglar Fastify rápidamente (opción A)
pnpm add fastify@^4
pnpm dev
```

---

Si quieres, genero un `patch` para bajar `fastify` a 4.x automáticamente en `server/package.json` y arranco el servidor; dime si te lo aplico ahora.
