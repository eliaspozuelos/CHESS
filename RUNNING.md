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

## 3) Ejecutar el backend (carpeta `server/`)
- Cambia al directorio `server`:

```powershell
cd .\server
```

- Copia el `.env.example` a `.env` y edítalo si hace falta (puedes ajustar `PORT` y `ORIGIN`):

```powershell
copy .env.example .env
# luego edita .env con tu editor favorito
```

- Instala dependencias del server:

```powershell
# dentro de server/
pnpm install
# o
npm install
```

- Ejecuta el server en modo desarrollo:

```powershell
pnpm dev
# o
npm run dev
```

- Por defecto el server usa el puerto de `.env` (ej: 4000). Si hay errores, revisa la consola.

## 4) Problema conocido: `FST_ERR_PLUGIN_VERSION_MISMATCH` (Fastify / @fastify/cors)

Síntoma: Al arrancar el servidor aparece un error indicando que un plugin (por ejemplo `@fastify/cors`) requiere `fastify` 4.x pero está instalada la 5.x.

Soluciones (elige una):

### Opción A — Downgrade de `fastify` a 4.x (rápido y fiable)

```powershell
cd .\server
# con pnpm
pnpm add fastify@^4
# o con npm
npm install fastify@^4
# luego arranca
pnpm dev
```

Esto suele resolver inmediatamente el chequeo de la versión del plugin.

### Opción B — Actualizar el plugin a una versión compatible con `fastify` 5.x (más correcto a largo plazo)

1. Investiga la compatibilidad del plugin:

```powershell
cd .\server
npm view @fastify/cors peerDependencies
```

2. Si existe una versión de `@fastify/cors` compatible con Fastify 5, instálala explícitamente:

```powershell
pnpm add @fastify/cors@<versión-compatible>
# o npm install @fastify/cors@<versión-compatible>
```

3. Arranca el servidor de nuevo.

Si no hay versión compatible disponible, usa la Opción A.

### Opción C — Forzar/ignorar (no recomendado)

No se aconseja. Mejor cambiar versiones.

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
