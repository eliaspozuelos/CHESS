# Chess Application - Integration Complete

## ✅ Backend Creado e Integrado

### Estructura del Backend

```
backend/
├── src/
│   ├── index.ts                 # Servidor principal Express + Socket.IO
│   ├── types/
│   │   └── index.ts            # Definiciones TypeScript
│   ├── services/
│   │   ├── user.service.ts     # Gestión de usuarios
│   │   ├── game.service.ts     # Lógica de juegos
│   │   └── stockfish.service.ts # Motor de ajedrez IA
│   ├── routes/
│   │   ├── auth.routes.ts      # Autenticación
│   │   ├── user.routes.ts      # Endpoints de usuarios
│   │   └── game.routes.ts      # Endpoints de juegos
│   ├── socket/
│   │   └── game.socket.ts      # Manejo de WebSockets
│   └── middleware/
│       └── auth.middleware.ts   # Middleware de autenticación
├── data/                        # Almacenamiento JSON
│   └── users.json
├── .env                         # Variables de entorno
├── package.json
└── tsconfig.json
```

### Características Implementadas

#### 🔐 Autenticación
- Registro de usuarios con contraseña hasheada (bcrypt)
- Login/Logout con JWT
- Cookies HTTP-only para seguridad
- Middleware de autenticación para rutas protegidas

#### ♟️ Gestión de Juegos
- Creación de partidas con configuración personalizada
- Validación de movimientos con chess.js
- Soporte para partidas Normal, Rápida y Blitz
- Sistema de temporizadores por tipo de juego

#### 🤖 IA con Stockfish
- 4 niveles de dificultad:
  - **Beginner**: Skill 1, Depth 5
  - **Intermediate**: Skill 10, Depth 10
  - **Advanced**: Skill 15, Depth 15
  - **Master**: Skill 20, Depth 20
- Fallback a movimientos aleatorios si Stockfish no está disponible
- Soporte para múltiples motores IA (GPT-4, Claude, etc.) en frontend

#### 🔌 WebSockets en Tiempo Real
- Conexión Socket.IO para partidas en vivo
- Eventos:
  - `join` - Unirse a una partida
  - `move` - Enviar un movimiento
  - `move_made` - Movimiento realizado (broadcast)
  - `move_error` - Error en movimiento
  - `resign` - Rendirse
  - `game_resigned` - Partida rendida (broadcast)
- Movimientos de IA automáticos después de movimientos de jugador

#### 📊 Estadísticas
- Tracking de partidas jugadas, ganadas, perdidas, empates
- Estadísticas por tipo de juego
- Historial de partidas
- Leaderboard con ranking de jugadores

### API Endpoints

#### Autenticación
```
POST /api/auth/register      # Crear usuario
POST /api/auth/login          # Iniciar sesión
POST /api/auth/logout         # Cerrar sesión
GET  /api/auth/me             # Obtener usuario actual
```

#### Usuarios
```
GET  /api/users/:userId              # Obtener perfil
GET  /api/users/leaderboard/top      # Obtener leaderboard
POST /api/users/:userId/stats        # Actualizar estadísticas
```

#### Juegos
```
POST   /api/games                    # Crear partida
GET    /api/games/:gameId            # Obtener partida
POST   /api/games/:gameId/move       # Hacer movimiento
POST   /api/games/:gameId/ai-move    # Solicitar movimiento IA
POST   /api/games/:gameId/resign     # Rendirse
GET    /api/games/:gameId/legal-moves # Movimientos legales
DELETE /api/games/:gameId            # Eliminar partida
```

### Variables de Entorno

#### Backend (.env)
```env
PORT=4000
JWT_SECRET=chess-game-super-secret-key-2024-change-in-production
FRONTEND_URL=http://localhost:3000
STOCKFISH_PATH=/ruta/a/stockfish  # Opcional
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Instalación de Stockfish (Opcional)

#### Windows
1. Descargar de: https://stockfishchess.org/download/
2. Extraer y configurar `STOCKFISH_PATH` en `.env`

#### Linux
```bash
sudo apt-get install stockfish
```

#### macOS
```bash
brew install stockfish
```

## 🚀 Cómo Ejecutar

### Opción 1: Scripts Automáticos

**Windows (PowerShell)**:
```powershell
.\start-servers.ps1
```

**Windows (CMD)**:
```cmd
start-servers.bat
```

### Opción 2: Manual

**Terminal 1 - Backend**:
```bash
cd backend
pnpm install
pnpm dev
```

**Terminal 2 - Frontend**:
```bash
pnpm install
pnpm dev
```

Acceder a: http://localhost:3000

## 📝 Flujo de Usuario

1. **Registro/Login**: Usuario crea cuenta o inicia sesión
2. **Configuración**: Selecciona tipo de partida, colores y niveles de IA
3. **Juego**: Partida en tiempo real con WebSockets
4. **IA**: Si el oponente es IA, Stockfish calcula movimientos
5. **Estadísticas**: Al finalizar se actualizan las estadísticas del usuario

## 🔧 Tecnologías Utilizadas

### Backend
- **Node.js** + **Express**: Servidor HTTP
- **TypeScript**: Tipado estático
- **Socket.IO**: WebSockets en tiempo real
- **chess.js**: Motor de ajedrez y validación
- **Stockfish**: IA de ajedrez
- **JWT**: Autenticación
- **bcryptjs**: Hash de contraseñas

### Frontend (Existente)
- **Next.js 16**: Framework React
- **React 19**: UI Library
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos
- **Socket.IO Client**: WebSockets
- **Shadcn/ui**: Componentes UI

## ✅ Integración Completada

- ✅ Backend creado desde cero
- ✅ Autenticación JWT implementada
- ✅ WebSockets configurados
- ✅ Stockfish integrado con fallback
- ✅ Frontend conectado al backend
- ✅ Sistema de partidas funcional
- ✅ Estadísticas y leaderboard
- ✅ Scripts de inicio automático

## 🐛 Troubleshooting

### Backend no inicia
- Verificar que puerto 4000 esté disponible
- Instalar dependencias: `cd backend && pnpm install`

### Frontend no conecta
- Verificar que backend esté corriendo en puerto 4000
- Verificar `.env.local` tenga `NEXT_PUBLIC_API_URL=http://localhost:4000`

### Stockfish no funciona
- Instalar Stockfish o configurar `STOCKFISH_PATH`
- El backend funcionará con movimientos aleatorios como fallback

### Errores de autenticación
- Limpiar cookies del navegador
- Verificar que `JWT_SECRET` esté configurado en backend/.env

## 📚 Próximos Pasos (Opcionales)

- [ ] Añadir base de datos (PostgreSQL/MongoDB) en lugar de JSON
- [ ] Implementar chat entre jugadores
- [ ] Añadir sistema de rankings ELO
- [ ] Implementar análisis de partidas con Stockfish
- [ ] Añadir replay de partidas
- [ ] Implementar torneos
- [ ] Añadir temas visuales para el tablero

## 📄 Licencia

MIT

---

**Proyecto creado y configurado exitosamente** ✅
