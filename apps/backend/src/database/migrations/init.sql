CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    external_order_id VARCHAR(255),
    channel VARCHAR(50) NOT NULL,

    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    customer_address VARCHAR(255),
    customer_city VARCHAR(100),
    customer_state VARCHAR(100),

    status VARCHAR(50) NOT NULL,

    total_amount NUMERIC(10,2) NOT NULL,
    promo_code VARCHAR(100),
    payment_mode VARCHAR(50),
    balance_payment NUMERIC(10,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (external_order_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders(channel);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Status history
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by VARCHAR(255) NULL,
    changed_by_email VARCHAR(255) NULL,
    changed_at TIMESTAMP DEFAULT NOW()
);

-- Sync logs
CREATE TABLE IF NOT EXISTS channel_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    channel VARCHAR(50),
    status VARCHAR(50),
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_config (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    value VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'inactive'
        CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,

    product_id VARCHAR(255),
    product_name VARCHAR(255),
    price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);
