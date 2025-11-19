# ✅ Backend con PostgreSQL - COMPLETADO

## 🎉 Migración Exitosa: JSON → PostgreSQL

Tu backend de ajedrez ahora usa PostgreSQL como base de datos relacional en lugar de archivos JSON.

---

## 📦 ¿Qué se Agregó?

### Nuevos Archivos:

1. **Base de Datos**
   - `src/config/database.ts` - Configuración de conexión PostgreSQL
   - `src/database/schema.sql` - Esquema completo de la base de datos
   - `src/database/init.ts` - Inicialización automática

2. **Scripts de Setup**
   - `setup-database.ps1` - Script PowerShell para crear la BD
   - `setup-database.bat` - Script CMD para crear la BD

3. **Documentación**
   - `POSTGRESQL_SETUP.md` - Guía completa de instalación
   - `POSTGRESQL_MIGRATION.md` - Detalles de la migración

### Archivos Modificados:

- `package.json` - Agregadas dependencias: `pg`, `pg-hstore`, `@types/pg`
- `src/services/user.service.ts` - Reescrito para usar PostgreSQL
- `src/index.ts` - Inicialización de BD al arrancar
- `.env` - Agregadas variables de PostgreSQL
- `README.md` - Actualizado con info de PostgreSQL

---

## 🗄️ Esquema de Base de Datos

```
chess_db (PostgreSQL)
├── users                # Cuentas de usuario
│   ├── id (UUID)
│   ├── username
│   ├── password_hash
│   └── created_at
│
├── user_stats           # Estadísticas por usuario
│   ├── user_id → users.id
│   ├── games_played, games_won, games_lost, games_draw
│   ├── total_moves, total_time
│   ├── averages
│   └── stats por tipo (normal/rapid/blitz)
│
├── games                # Partidas activas/completadas
│   ├── id (UUID)
│   ├── white/black player info
│   ├── FEN, PGN
│   ├── status, winner
│   └── moves[]
│
└── game_history         # Historial de partidas
    ├── user_id → users.id
    ├── game_date, game_type
    ├── white_player, black_player, winner
    └── moves_count, duration
```

---

## 🚀 Cómo Usarlo

### Paso 1: Instalar PostgreSQL

**Windows:**
```
https://www.postgresql.org/download/windows/
```

**Linux:**
```bash
sudo apt install postgresql
```

**Mac:**
```bash
brew install postgresql@16
```

### Paso 2: Crear Base de Datos

**Opción A - Automático (Windows):**
```powershell
cd backend
.\setup-database.ps1
```

**Opción B - Manual:**
```bash
psql -U postgres
CREATE DATABASE chess_db;
\q
```

### Paso 3: Configurar `.env`

Edita `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/chess_db
```

### Paso 4: Iniciar Backend

```bash
cd backend
pnpm install  # Ya hecho ✅
pnpm dev
```

Verás:
```
✅ Connected to PostgreSQL database
🔄 Initializing database...
✅ Database initialized successfully
✅ Server is running on port 4000
🗄️  PostgreSQL database connected
```

---

## 📝 Variables de Entorno

Actualiza `backend/.env`:

```env
# Server
PORT=4000
NODE_ENV=development
JWT_SECRET=chess-game-super-secret-key-2024
FRONTEND_URL=http://localhost:3000

# PostgreSQL Database (NUEVO)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chess_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=chess_db

# Stockfish (Opcional)
STOCKFISH_PATH=/path/to/stockfish
```

---

## ✅ Beneficios de PostgreSQL

| Antes (JSON) | Ahora (PostgreSQL) |
|--------------|-------------------|
| Archivos locales | Base de datos relacional |
| Búsquedas lentas | Búsquedas indexadas rápidas |
| Sin relaciones | Relaciones con foreign keys |
| Sin transacciones | Transacciones ACID |
| Límite de escala | Escalable |
| Sin concurrencia | Multi-usuario seguro |

---

## 🛠️ Comandos Útiles

### Ver la Base de Datos

```bash
# Conectar
psql -U postgres -d chess_db

# Listar tablas
\dt

# Ver usuarios
SELECT * FROM users;

# Ver estadísticas
SELECT u.username, s.* 
FROM users u 
JOIN user_stats s ON u.id = s.user_id;

# Salir
\q
```

### Reset de Base de Datos

```bash
psql -U postgres -c "DROP DATABASE chess_db;"
psql -U postgres -c "CREATE DATABASE chess_db;"
```

Luego reinicia el backend para reinicializar el esquema.

---

## 🐛 Troubleshooting

### Error: "Failed to connect to database"

**Solución:**
1. Verifica que PostgreSQL esté corriendo:
   ```powershell
   Get-Service postgresql*
   ```
2. Verifica credenciales en `.env`
3. Verifica que la base de datos existe:
   ```bash
   psql -U postgres -l
   ```

### Error: "password authentication failed"

**Solución:**
Actualiza el password en `.env` para que coincida con el de PostgreSQL.

### Error: "database chess_db does not exist"

**Solución:**
```bash
psql -U postgres -c "CREATE DATABASE chess_db;"
```

---

## 📚 Documentación

- **Setup completo:** `POSTGRESQL_SETUP.md`
- **Detalles de migración:** `POSTGRESQL_MIGRATION.md`
- **Schema SQL:** `src/database/schema.sql`
- **README Backend:** `README.md`

---

## 🎯 Próximos Pasos

1. ✅ Instalar PostgreSQL
2. ✅ Crear base de datos `chess_db`
3. ✅ Configurar `.env` con credenciales
4. ✅ Iniciar backend: `pnpm dev`
5. ✅ Iniciar frontend: `pnpm dev` (en carpeta raíz)
6. ✅ Registrar usuario y jugar!

---

## 🎉 ¡Listo para Producción!

Tu backend ahora está preparado para:
- ✅ Múltiples usuarios simultáneos
- ✅ Consultas complejas y eficientes
- ✅ Integridad de datos
- ✅ Escalabilidad
- ✅ Backups y recuperación
- ✅ Deploy en servicios cloud (Heroku, AWS RDS, etc.)

---

**¿Dudas?** Revisa:
- `POSTGRESQL_SETUP.md` - Instalación paso a paso
- `POSTGRESQL_MIGRATION.md` - Detalles técnicos
- `README.md` - Documentación completa del backend

**¡Disfruta tu aplicación de ajedrez con PostgreSQL!** ♟️🎉
