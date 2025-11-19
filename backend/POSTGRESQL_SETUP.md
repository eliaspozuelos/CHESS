# PostgreSQL Setup Guide

## Installation

### Windows

1. **Download PostgreSQL**:
   - Visit: https://www.postgresql.org/download/windows/
   - Download and run the installer
   - Default port: 5432
   - Remember the password you set for the `postgres` user

2. **Add to PATH** (if not automatic):
   ```powershell
   $env:Path += ";C:\Program Files\PostgreSQL\16\bin"
   ```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS

```bash
brew install postgresql@16
brew services start postgresql@16
```

## Database Setup

### 1. Access PostgreSQL

**Windows (PowerShell):**
```powershell
psql -U postgres
```

**Linux/Mac:**
```bash
sudo -u postgres psql
```

### 2. Create Database

```sql
CREATE DATABASE chess_db;
```

### 3. Create User (Optional - for production)

```sql
CREATE USER chess_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chess_db TO chess_user;
```

### 4. Exit psql

```sql
\q
```

## Configuration

Update `backend/.env` with your database credentials:

```env
# Using DATABASE_URL (recommended)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chess_db

# Or individual settings
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=chess_db
```

## Verify Setup

1. **Start the backend**:
```bash
cd backend
pnpm dev
```

2. **Check logs** for:
```
✅ Connected to PostgreSQL database
🔄 Initializing database...
✅ Database initialized successfully
✅ Server is running on port 4000
🗄️  PostgreSQL database connected
```

## Troubleshooting

### Connection refused

**Check if PostgreSQL is running:**

Windows:
```powershell
Get-Service postgresql*
```

Linux/Mac:
```bash
sudo systemctl status postgresql
```

**Start PostgreSQL if stopped:**

Windows: Start from Services or:
```powershell
pg_ctl start -D "C:\Program Files\PostgreSQL\16\data"
```

Linux:
```bash
sudo systemctl start postgresql
```

Mac:
```bash
brew services start postgresql@16
```

### Authentication failed

1. Check password in `.env` matches PostgreSQL user password
2. Try resetting password:

```bash
psql -U postgres
ALTER USER postgres WITH PASSWORD 'newpassword';
```

### Database doesn't exist

```bash
psql -U postgres -c "CREATE DATABASE chess_db;"
```

## Database Management

### View tables

```bash
psql -U postgres -d chess_db -c "\dt"
```

### View data

```bash
# View users
psql -U postgres -d chess_db -c "SELECT * FROM users;"

# View stats
psql -U postgres -d chess_db -c "SELECT * FROM user_stats;"
```

### Reset database

```bash
psql -U postgres -c "DROP DATABASE chess_db;"
psql -U postgres -c "CREATE DATABASE chess_db;"
```

Then restart the backend to reinitialize schema.

### Backup database

```bash
pg_dump -U postgres chess_db > backup.sql
```

### Restore database

```bash
psql -U postgres chess_db < backup.sql
```

## GUI Tools (Optional)

- **pgAdmin**: https://www.pgadmin.org/
- **DBeaver**: https://dbeaver.io/
- **TablePlus**: https://tableplus.com/

## Migration from JSON

The old JSON data is in `backend/data/users.json`. 

To migrate old users to PostgreSQL, you can create a migration script or manually insert them via SQL.

## Production Tips

1. Use environment-specific `.env` files
2. Use a dedicated database user (not `postgres`)
3. Enable SSL for connections
4. Regular backups
5. Monitor connection pool size
6. Use connection pooling (already implemented)

## Docker Setup (Alternative)

If you prefer Docker:

```bash
docker run --name chess-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=chess_db \
  -p 5432:5432 \
  -d postgres:16
```

Update `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chess_db
```
