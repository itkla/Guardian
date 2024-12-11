CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    pgp_private_key TEXT NOT NULL,
    pgp_public_key TEXT NOT NULL,
    mfa_secret TEXT NOT NULL,
    is_mfa_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- expand later
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    device_name VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is authorized BOOLEAN DEFAULT TRUE
)