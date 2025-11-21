# 🚀 Cómo Ejecutar el Proyecto - AI Chess Duel

## 📋 Requisitos Previos

- **Node.js** v18 o superior
- **PostgreSQL** instalado y corriendo
- **Docker** (para ejecutar Redis)
- **pnpm** (gestor de paquetes)

---

## 🔧 Configuración Inicial

### 0. Instalar Redis con Docker

Redis se ejecuta en un contenedor Docker para facilitar la instalación y gestión:

```bash
# Descargar la imagen de Redis
docker pull redis:latest

# Ejecutar Redis en un contenedor
docker run -d --name redis-chess -p 6379:6379 redis:latest

# Verificar que Redis está corriendo
docker ps
```

**Comandos útiles de Redis en Docker:**

```bash
# Iniciar Redis (si está detenido)
docker start redis-chess

# Detener Redis
docker stop redis-chess

# Ver logs de Redis
docker logs redis-chess

# Conectarse a Redis CLI
docker exec -it redis-chess redis-cli
```

**Alternativa sin Docker (Windows):**

Si no quieres usar Docker, puedes usar Redis en WSL2:

```bash
# En WSL2 (Ubuntu)
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

---

### 1. Clonar e Instalar Dependencias

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd PROYECTO

# Instalar dependencias del frontend
pnpm install

# Instalar dependencias del backend
cd backend
pnpm install
cd ..
```

### 2. Configurar Base de Datos PostgreSQL

```bash
# Crear la base de datos
psql -U postgres
CREATE DATABASE chess_db;
\q
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Crear archivo `.env` en la carpeta `backend`:

```env
# Database
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/chess_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=4000
NODE_ENV=development

# AI Providers (Opcional - al menos una clave)
OPENAI_API_KEY=tu_clave_openai
ANTHROPIC_API_KEY=tu_clave_anthropic
GOOGLE_API_KEY=tu_clave_google
```

### 4. Inicializar Base de Datos

```bash
cd backend
npm run init-db
cd ..
```

---

## ▶️ Ejecutar el Proyecto

### Opción 1: Ejecución Manual (Recomendado)

Necesitas **3 terminales** abiertas:

#### Terminal 1 - Backend API Server
```bash
cd backend
npm run dev
```
Debería mostrar:
```
🚀 Server running on http://localhost:4000
✅ Connected to PostgreSQL database
```

#### Terminal 2 - BullMQ Worker (Procesamiento de IA)
```bash
cd backend
npm run worker
```
Debería mostrar:
```
✅ AI Move Worker started
📡 Connected to Redis: localhost:6379
✅ Stockfish engine initialized successfully
```

#### Terminal 3 - Frontend (Next.js)
```bash
npm run dev
```
Debería mostrar:
```
▲ Next.js running on http://localhost:3000
```

### Opción 2: Script de Inicio Rápido

Puedes usar PowerShell para iniciar todo de una vez:

```powershell
# En la raíz del proyecto
.\start-all.ps1
```

O manualmente en una terminal:

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run worker"
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

---

## 🎮 Usar la Aplicación

1. Abre tu navegador en `http://localhost:3000`
2. Crea un perfil de usuario (se guarda en localStorage)
3. Selecciona un modo de juego:
   - **Normal**: Sin límite de tiempo
   - **Rapid**: 10 minutos por jugador
   - **Blitz**: 5 minutos por jugador
4. Elige un oponente IA:
   - **Stockfish**: Motor de ajedrez tradicional (3 niveles)
   - **OpenAI GPT-4**: Requiere API key
   - **Anthropic Claude**: Requiere API key
   - **Google Gemini**: Requiere API key

---

## 🛑 Detener el Proyecto

### Opción 1: Ctrl+C en cada terminal

En cada una de las 3 terminales presiona `Ctrl+C`

### Opción 2: Matar todos los procesos Node

```powershell
taskkill /F /IM node.exe
```

⚠️ **Advertencia**: Esto cerrará TODOS los procesos de Node.js en tu sistema.

---

## 🔍 Verificar que Todo Funciona

### 1. Verificar Backend API
```bash
curl http://localhost:4000/api/health
# Debería devolver: {"status":"ok","database":"connected"}
```

### 2. Verificar Redis (Docker)
```bash
# Con Docker
docker exec -it redis-chess redis-cli ping
# Debería devolver: PONG

# O si tienes redis-cli instalado localmente
redis-cli -h localhost -p 6379 ping
```

### 3. Verificar PostgreSQL
```bash
psql -U postgres -d chess_db -c "SELECT COUNT(*) FROM users;"
# Debería mostrar el número de usuarios
```

---

## 🐛 Solución de Problemas

### Error: "Port 4000 is already in use"
```powershell
# Encontrar el proceso
netstat -ano | findstr :4000

# Matar el proceso (reemplaza PID con el número que obtuviste)
taskkill /PID <PID> /F
```

### Error: "Unable to connect to database"
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `backend/.env`
- Verifica que la base de datos `chess_db` exista

### Error: "Redis connection failed"
- Verifica que el contenedor de Redis esté corriendo:
  ```bash
  docker ps | grep redis-chess
  ```
- Si no está corriendo, inícialo:
  ```bash
  docker start redis-chess
  ```
- Verifica la conexión:
  ```bash
  docker exec -it redis-chess redis-cli ping
  ```
- Verifica el puerto en `backend/.env` (debe ser 6379)
- Si el contenedor no existe, créalo nuevamente:
  ```bash
  docker run -d --name redis-chess -p 6379:6379 redis:latest
  ```

### Error: "Stockfish engine not found"
- Verifica que el ejecutable de Stockfish esté en la ruta correcta
- Por defecto busca en: `backend/engines/stockfish-windows-x86-64-avx2.exe`

### Next.js muestra: "Port 3000 in use"
- El proyecto usa automáticamente el puerto 3001 si 3000 está ocupado
- O mata el proceso en el puerto 3000:
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

---

## 📁 Estructura del Proyecto

```
PROYECTO/
├── app/                    # Páginas Next.js
│   ├── page.tsx           # Página principal (tablero)
│   ├── stats/             # Página de estadísticas
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── game-board.tsx    # Componente principal del juego
│   ├── chessboard.tsx    # Tablero visual
│   ├── leaderboard.tsx   # Ranking de jugadores
│   └── ui/               # Componentes UI (shadcn)
├── backend/              # Servidor Express + Socket.io
│   ├── src/
│   │   ├── server.ts    # Servidor principal
│   │   ├── worker.ts    # Worker de BullMQ
│   │   ├── routes/      # Rutas de API
│   │   ├── services/    # Lógica de negocio
│   │   └── socket/      # Eventos de Socket.io
│   └── engines/         # Motor Stockfish
├── lib/                  # Utilidades y tipos
└── public/              # Archivos estáticos
```

---

## 🎯 Características Principales

- ✅ **Múltiples Proveedores de IA**: Stockfish, GPT-4, Claude, Gemini
- ✅ **3 Modos de Juego**: Normal, Rapid, Blitz
- ✅ **Procesamiento Asíncrono**: BullMQ + Redis para movimientos de IA
- ✅ **Tiempo Real**: Socket.io para actualizaciones instantáneas
- ✅ **Análisis de Partidas**: Estadísticas detalladas post-juego
- ✅ **Modo Enseñanza**: Sugerencias de movimientos durante el juego
- ✅ **Historial Completo**: Registro de todas las partidas
- ✅ **Ranking**: Tabla de clasificación de jugadores
- ✅ **Persistencia**: PostgreSQL + localStorage

---

## 📝 Notas Importantes

1. **Claves de API**: Los proveedores de IA (excepto Stockfish) requieren claves API válidas
2. **Stockfish**: Es el único proveedor que funciona sin configuración adicional
3. **Redis**: Es necesario para el procesamiento asíncrono de movimientos de IA
4. **PostgreSQL**: Almacena usuarios, partidas y estadísticas
5. **localStorage**: Se usa como backup para datos de usuario en el frontend

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👨‍💻 Autor

**Elias Pozuelos**

¿Preguntas? Abre un issue en el repositorio.
