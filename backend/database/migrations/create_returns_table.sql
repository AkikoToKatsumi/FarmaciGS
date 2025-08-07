CREATE TABLE IF NOT EXISTS returns (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Opcional: índice para consultas rápidas por fecha
CREATE INDEX IF NOT EXISTS idx_returns_created_at ON returns(created_at);
