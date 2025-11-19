# Chess Backend

Backend server for the Chess application with AI opponents powered by Stockfish.

## Features

- 🔐 User authentication with JWT
- ♟️ Real-time multiplayer chess with WebSockets
- 🤖 **Multiple AI opponents:**
  - **Stockfish** (local, gratis)
  - **GPT-4 / GPT-3.5** (OpenAI)
  - **Gemini 1.5 Pro / Flash** (Google AI)
- ⚡ **Auto-start para partidas IA vs IA**
- 📊 User statistics and game history
- 🏆 Leaderboard system
- 💾 PostgreSQL database

## Tech Stack

- **Node.js** with Express
- **TypeScript**
- **PostgreSQL** for data persistence
- **Socket.IO** for real-time communication
- **chess.js** for chess logic
- **Stockfish** chess engine for local AI
- **OpenAI API** for GPT-4/3.5 opponents (optional)
- **Google Gemini API** for Gemini 1.5 opponents (optional)
- **JWT** for authentication
- **bcryptjs** for password hashing

## Setup

### Prerequisites

- Node.js 18+ or pnpm
- (Optional) Stockfish chess engine installed

### Installation

1. Install dependencies:
```bash
cd backend
npm install
# or
pnpm install
```

2. **Setup PostgreSQL Database:**

**Option A - Automatic (Windows):**
```powershell
.\setup-database.ps1
```

**Option B - Manual:**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE chess_db;"
```

See `POSTGRESQL_SETUP.md` for detailed instructions.

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=4000
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000

# PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chess_db

# Stockfish (Optional)
STOCKFISH_PATH=/path/to/stockfish

# AI Providers (Optional - for GPT-4/Gemini opponents)
OPENAI_API_KEY=sk-proj-your-openai-key
GEMINI_API_KEY=AIza-your-gemini-key
```

**📚 Para configurar las IAs avanzadas (GPT-4, Claude 3), consulta `AI_CONFIGURATION.md`**

### Installing Stockfish (Optional but Recommended)

#### Windows:
1. Download from [Stockfish official site](https://stockfishchess.org/download/)
2. Extract and note the path to `stockfish.exe`
3. Set `STOCKFISH_PATH` in `.env` or add to system PATH

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get install stockfish
```

#### macOS:
```bash
brew install stockfish
```

If Stockfish is not available, the server will fall back to random move generation.

## Running the Server

### Development mode:
```bash
npm run dev
# or
pnpm dev
```

### Production build:
```bash
npm run build
npm start
# or
pnpm build
pnpm start
```

The server will start on `http://localhost:4000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:userId` - Get user profile
- `GET /api/users/leaderboard/top` - Get leaderboard
- `POST /api/users/:userId/stats` - Update user stats

### Games
- `POST /api/games` - Create new game
- `GET /api/games/:gameId` - Get game details
- `POST /api/games/:gameId/move` - Make a move
- `POST /api/games/:gameId/ai-move` - Request AI move
- `POST /api/games/:gameId/resign` - Resign game
- `GET /api/games/:gameId/legal-moves` - Get legal moves
- `DELETE /api/games/:gameId` - Delete game

### Health Check
- `GET /health` - Server health status

## WebSocket Events

### Client → Server
- `join` - Join a game room
- `leave` - Leave a game room
- `move` - Make a move
- `request_ai_move` - Request AI to make a move
- `resign` - Resign from game

### Server → Client
- `joined` - Confirmation of joining room
- `move_made` - A move was made
- `move_error` - Move failed
- `game_resigned` - Game was resigned

## Data Storage

**PostgreSQL Database** (Relational Database)
- User accounts and authentication
- User statistics and game history
- Active and completed games
- Indexed for fast queries

See `POSTGRESQL_SETUP.md` for installation and configuration.

## AI Difficulty Levels

- **Beginner** - Stockfish Skill Level 1, Depth 5
- **Intermediate** - Stockfish Skill Level 10, Depth 10
- **Advanced** - Stockfish Skill Level 15, Depth 15
- **Master** - Stockfish Skill Level 20, Depth 20

## Architecture

```
backend/
├── src/
│   ├── index.ts              # Main server file
│   ├── types/                # TypeScript type definitions
│   ├── services/             # Business logic
│   │   ├── user.service.ts
│   │   ├── game.service.ts
│   │   └── stockfish.service.ts
│   ├── routes/               # API routes
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── game.routes.ts
│   ├── socket/               # WebSocket handlers
│   │   └── game.socket.ts
│   └── middleware/           # Express middleware
│       └── auth.middleware.ts
├── data/                     # Data storage
└── dist/                     # Compiled JavaScript
```

## License

MIT
