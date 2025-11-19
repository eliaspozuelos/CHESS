-- Chess Application Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User statistics table
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    games_draw INTEGER DEFAULT 0,
    total_moves INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    average_moves_per_win DECIMAL(10, 2) DEFAULT 0,
    average_time_per_win DECIMAL(10, 2) DEFAULT 0,
    -- Game type stats
    normal_played INTEGER DEFAULT 0,
    normal_won INTEGER DEFAULT 0,
    rapid_played INTEGER DEFAULT 0,
    rapid_won INTEGER DEFAULT 0,
    blitz_played INTEGER DEFAULT 0,
    blitz_won INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    white_player_id UUID REFERENCES users(id) ON DELETE SET NULL,
    black_player_id UUID REFERENCES users(id) ON DELETE SET NULL,
    white_player_type VARCHAR(50) NOT NULL, -- 'human' or 'ai'
    black_player_type VARCHAR(50) NOT NULL,
    white_ai_model VARCHAR(100),
    black_ai_model VARCHAR(100),
    white_ai_level VARCHAR(50),
    black_ai_level VARCHAR(50),
    game_type VARCHAR(50) NOT NULL, -- 'normal', 'rapid', 'blitz'
    fen TEXT NOT NULL,
    pgn TEXT,
    current_player CHAR(1) NOT NULL, -- 'w' or 'b'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'resigned'
    winner VARCHAR(50), -- 'white', 'black', 'draw'
    moves TEXT[], -- Array of moves in UCI format
    white_time INTEGER NOT NULL,
    black_time INTEGER NOT NULL,
    start_time BIGINT NOT NULL,
    end_time BIGINT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Game history table (for completed games)
CREATE TABLE IF NOT EXISTS game_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL,
    game_date TIMESTAMP WITH TIME ZONE NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    white_player VARCHAR(255) NOT NULL,
    black_player VARCHAR(255) NOT NULL,
    winner VARCHAR(50) NOT NULL,
    moves_count INTEGER NOT NULL,
    duration INTEGER NOT NULL, -- in seconds
    user_color VARCHAR(50) NOT NULL, -- 'white' or 'black'
    opponent_type VARCHAR(50) NOT NULL, -- 'human' or 'ai'
    opponent_model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_white_player ON games(white_player_id);
CREATE INDEX IF NOT EXISTS idx_games_black_player ON games(black_player_id);
CREATE INDEX IF NOT EXISTS idx_game_history_user_id ON game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_game_history_date ON game_history(game_date DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
