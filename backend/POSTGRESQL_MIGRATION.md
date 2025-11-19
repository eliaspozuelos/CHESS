# Chess Backend - PostgreSQL Migration Complete

## ✅ Migration Status: COMPLETED

The backend has been successfully migrated from JSON file storage to PostgreSQL database.

## 🔄 What Changed

### Before (JSON):
- Data stored in `backend/data/users.json`
- In-memory game state
- No complex queries
- Limited scalability

### After (PostgreSQL):
- Relational database with proper schema
- Users, stats, games, and history tables
- Indexed for performance
- Scalable and production-ready

## 📊 Database Schema

### Tables Created:

1. **users** - User accounts
   - id, username, password_hash, created_at, updated_at

2. **user_stats** - User statistics
   - games_played, games_won, games_lost, games_draw
   - total_moves, total_time, averages
   - stats by game type (normal/rapid/blitz)

3. **games** - Active and completed games
   - Full game state with FEN/PGN
   - Player info, time controls, status
   - Move history

4. **game_history** - Completed game records
   - User game history
   - Results, duration, opponent info

### Indexes:
- Username lookup
- User stats queries
- Game status and players
- Game history by user and date

## 🚀 Getting Started

### 1. Install PostgreSQL

**Windows:**
- Download from: https://www.postgresql.org/download/
- Or run: `.\setup-database.bat`

**Linux:**
```bash
sudo apt install postgresql
```

**Mac:**
```bash
brew install postgresql@16
```

### 2. Create Database

**Option A - Automatic (Windows):**
```powershell
.\setup-database.ps1
# or
.\setup-database.bat
```

**Option B - Manual:**
```bash
psql -U postgres
CREATE DATABASE chess_db;
\q
```

### 3. Configure Environment

Update `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/chess_db
```

### 4. Start Backend

```bash
cd backend
pnpm dev
```

The database schema will be initialized automatically on first run.

## 📝 Environment Variables

```env
# PostgreSQL (NEW)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chess_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=chess_db

# Existing
PORT=4000
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
STOCKFISH_PATH=/path/to/stockfish  # Optional
```

## 🔍 Verify Setup

When backend starts successfully, you'll see:

```
✅ Connected to PostgreSQL database
🔄 Initializing database...
✅ Database initialized successfully
✅ Server is running on port 4000
🗄️  PostgreSQL database connected
```

## 📦 New Dependencies

- `pg` - PostgreSQL client
- `pg-hstore` - Key-value storage
- `@types/pg` - TypeScript definitions

## 🛠️ Database Tools

### View Database

```bash
psql -U postgres -d chess_db
```

### Common Commands

```sql
-- List tables
\dt

-- View users
SELECT * FROM users;

-- View stats
SELECT u.username, s.* FROM users u JOIN user_stats s ON u.id = s.user_id;

-- View game history
SELECT * FROM game_history;
```

### Reset Database

```bash
psql -U postgres -c "DROP DATABASE chess_db;"
psql -U postgres -c "CREATE DATABASE chess_db;"
```

## 📚 Documentation

- Full setup guide: `POSTGRESQL_SETUP.md`
- Database schema: `src/database/schema.sql`
- Connection config: `src/config/database.ts`
- Init scripts: `src/database/init.ts`

## 🔄 Migrating Old Data

If you have existing users in `data/users.json`, you can:

1. Keep the JSON file as backup
2. Users will be created fresh in PostgreSQL
3. Or create a migration script (not included)

## 🚨 Troubleshooting

### Connection Error

```
❌ Failed to connect to database
```

**Solutions:**
1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Check database exists: `psql -U postgres -l`

### Authentication Failed

```
password authentication failed
```

**Solution:**
Update password in `.env` to match PostgreSQL user password

### Database Not Found

```
database "chess_db" does not exist
```

**Solution:**
Run setup script or manually create: `psql -U postgres -c "CREATE DATABASE chess_db;"`

## 📊 Performance

PostgreSQL provides:
- ✅ Faster queries with indexes
- ✅ Complex joins and aggregations
- ✅ Transaction support
- ✅ Better scalability
- ✅ Data integrity
- ✅ Concurrent access

## 🔐 Security Notes

For production:
1. Use strong passwords
2. Create dedicated database user (not postgres)
3. Enable SSL connections
4. Regular backups
5. Update connection limits

## 🎉 Migration Complete!

Your chess backend now uses PostgreSQL for data storage. All features remain the same, but with improved performance and scalability.

**Next steps:**
1. Start PostgreSQL
2. Run setup script
3. Start backend: `pnpm dev`
4. Test registration and gameplay
5. Enjoy! ♟️
