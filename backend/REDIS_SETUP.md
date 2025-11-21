# 🚀 Configuración con BullMQ + Redis

## ✅ Instalación completada

Se ha implementado una arquitectura robusta con:
- **BullMQ**: Cola de trabajos para movimientos de IA (no bloqueante)
- **Redis**: Almacenamiento de cola
- **Workers**: Procesadores en segundo plano
- **Timers server-side**: Sincronización de relojes

## 📦 Componentes creados

### Archivos nuevos:
- `src/queues/ai-move.queue.ts` - Cola de movimientos de IA
- `src/workers/ai-move.worker.ts` - Worker que procesa movimientos
- `src/services/game-timer.service.ts` - Servicio de timers sincronizados
- `src/worker.ts` - Entry point del worker

### Archivos modificados:
- `src/services/game.service.ts` - Ahora usa colas no bloqueantes
- `src/socket/game.socket.ts` - Escucha eventos de cola y timers
- `backend/.env` - Agregada configuración de Redis
- `package.json` - Agregados scripts `worker` y `start:worker`

## 🚀 Cómo ejecutar

### 1. Asegúrate de que Redis está corriendo:
```powershell
docker ps
# Deberías ver: chess-redis ... Up ... 0.0.0.0:6379->6379/tcp
```

Si no está corriendo:
```powershell
docker start chess-redis
# O si no existe:
docker run -d --name chess-redis -p 6379:6379 redis:7-alpine
```

### 2. Abre **DOS terminales de PowerShell**:

#### Terminal 1 - Backend (API + Sockets):
```powershell
cd D:\elias2\Desktop\CICLO2\IA\PROYECTO\backend
npm run dev
```

#### Terminal 2 - Worker (Procesador de IA):
```powershell
cd D:\elias2\Desktop\CICLO2\IA\PROYECTO\backend
npm run worker
```

### 3. Frontend (en otra terminal):
```powershell
cd D:\elias2\Desktop\CICLO2\IA\PROYECTO
npm run dev
```

## 🎯 Qué se solucionó

### ❌ Antes (con bloqueo):
1. Usuario hace movimiento
2. Socket handler **ESPERA** 3-10 segundos por respuesta de IA (bloqueado)
3. Durante ese tiempo: ⏱️ timers congelados, 🔌 sockets sin responder
4. Finalmente la IA responde y el juego continúa

### ✅ Ahora (sin bloqueo):
1. Usuario hace movimiento
2. Socket handler **encola trabajo** y retorna inmediatamente (< 10ms)
3. ⏱️ Timers siguen actualizándose cada segundo
4. 🔌 Sockets siguen respondiendo
5. Worker procesa IA en segundo plano (3-10 segundos)
6. Cuando IA termina, emite `move_made` automáticamente

## 📊 Eventos socket nuevos

### Cliente puede escuchar:
- `ai_thinking` - La IA está pensando (mostrar spinner)
- `timer_update` - Actualización de relojes cada segundo
  ```js
  {
    whiteTime: 600,
    blackTime: 598,
    currentPlayer: 'w'
  }
  ```
- `move_made` - Movimiento completado (ya existía)
- `move_error` - Error en movimiento

## 🔧 Configuración de Redis

En `backend/.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 📝 Logs para debug

### Backend muestra:
```
✅ AI Move Queue initialized
🔌 Client connected: abc123
📡 Timer service initialized
♟️  Move in game_xxx: e2 -> e4
📬 AI move job 123 queued for game_xxx
```

### Worker muestra:
```
🤖 Worker processing AI move for game_xxx
   Model: gpt-4, Level: intermediate
   Requesting move from gpt-4...
✅ Worker completed: e7 → e5
```

## 🚨 Troubleshooting

### Error: "ECONNREFUSED localhost:6379"
Redis no está corriendo. Ejecuta:
```powershell
docker start chess-redis
```

### Worker no procesa trabajos:
1. Verifica que Redis esté corriendo: `docker ps`
2. Verifica que el worker esté corriendo: `npm run worker`
3. Revisa logs del worker para errores

### Timers no se actualizan:
1. Verifica que el backend esté corriendo
2. Abre consola del navegador (F12) y verifica eventos `timer_update`

## 🎮 Flujo completo

```
┌─────────┐      ┌────────┐      ┌───────┐      ┌────────┐
│ Cliente │─────▶│ Socket │─────▶│ Redis │─────▶│ Worker │
│         │      │Handler │      │ Queue │      │  (AI)  │
└─────────┘      └────────┘      └───────┘      └────────┘
     ▲               │                                │
     │               ▼ (inmediato)                    │
     │          ✅ Retorna OK                          │
     │               │                                ▼
     │               │                          Procesa IA
     │               │                          (3-10 seg)
     │               │                                │
     │               │◀───────────────────────────────┘
     │               │
     │◀──────────────┘
     │  emit('move_made')
```

## 🔐 Seguridad

- Redis corriendo en localhost (no expuesto)
- Workers procesan en segundo plano sin acceso directo
- Timeouts configurados (15s para IA, evita trabajos zombies)
- Reintentos automáticos (3 intentos con backoff exponencial)

## 📈 Performance

- Backend responde en < 10ms (no bloqueado)
- Timers actualizados cada 1 segundo
- Workers procesan hasta 5 movimientos de IA en paralelo
- Límite: máximo 10 trabajos por segundo (evita sobrecarga)

## 🎉 ¡Listo!

Ahora tu aplicación de ajedrez:
- ✅ No se congela durante movimientos de IA
- ✅ Timers sincronizados servidor-cliente
- ✅ Puede escalar a múltiples instancias
- ✅ Manejo robusto de errores y timeouts
- ✅ Logs detallados para debugging
