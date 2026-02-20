# Database Schema Diagram

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        varchar email UK
        text password_hash
        varchar role
        timestamp created_at
    }
    
    ORDERS {
        uuid id PK
        bigint order_number UK
        varchar external_order_id
        varchar channel
        varchar customer_email
        varchar customer_name
        varchar customer_address
        varchar customer_city
        varchar customer_state
        varchar status
        numeric total_amount
        varchar promo_code
        varchar payment_mode
        numeric balance_payment
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        varchar product_id
        varchar product_name
        numeric price
        int quantity
        timestamp created_at
    }
    
    ORDER_STATUS_HISTORY {
        uuid id PK
        uuid order_id FK
        varchar old_status
        varchar new_status
        varchar changed_by
        varchar changed_by_email
        timestamp changed_at
    }
    
    CHANNEL_SYNC_LOGS {
        uuid id PK
        uuid order_id FK
        varchar channel
        varchar status
        text error_message
        int retry_count
        timestamp created_at
    }
    
    APP_CONFIG {
        int id PK
        varchar name UK
        varchar value
        varchar status
        timestamp created_at
        timestamp updated_at
    }
    
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o{ ORDER_STATUS_HISTORY : tracks
    ORDERS ||--o{ CHANNEL_SYNC_LOGS : syncs
```

## Table Descriptions

### Core Tables

#### USERS
- **Purpose**: Store admin user accounts with authentication data
- **Key Fields**: 
  - `email`: Unique identifier for login
  - `password_hash`: Bcrypt hashed password
  - `role`: User permission level (SUPER_ADMIN)

#### ORDERS
- **Purpose**: Main order management table
- **Key Fields**:
  - `order_number`: Sequential order identifier
  - `external_order_id`: Reference to external system
  - `channel`: Source channel (e.g., website, mobile)
  - `status`: Current order status
  - `total_amount`: Order total value

#### ORDER_ITEMS
- **Purpose**: Individual products within an order
- **Relationship**: Many-to-one with ORDERS
- **Key Fields**:
  - `product_id`: External product reference
  - `price`: Item price at time of order
  - `quantity`: Number of items ordered

### Audit & Logging Tables

#### ORDER_STATUS_HISTORY
- **Purpose**: Track all status changes for compliance
- **Key Fields**:
  - `old_status` / `new_status`: Status transition
  - `changed_by`: User who made the change
  - `changed_at`: Timestamp of change

#### CHANNEL_SYNC_LOGS
- **Purpose**: Monitor external system synchronization
- **Key Fields**:
  - `channel`: External system name
  - `status`: Sync operation result
  - `error_message`: Failure details
  - `retry_count`: Number of retry attempts

### Configuration Table

#### APP_CONFIG
- **Purpose**: Store application configuration settings
- **Key Fields**:
  - `name`: Configuration key
  - `value`: Configuration value
  - `status`: Active/inactive state

## Indexes & Performance

### Primary Indexes
- `idx_orders_status`: Fast status-based queries
- `idx_orders_channel`: Channel-specific filtering
- `idx_orders_created_at`: Time-based sorting

### Unique Constraints
- `users.email`: Prevent duplicate accounts
- `orders.order_number`: Ensure unique order numbering
- `orders(external_order_id, channel)`: Prevent duplicate imports

## Data Integrity

### Foreign Key Relationships
- All child tables reference orders via `order_id`
- Cascade delete ensures data consistency
- Referential integrity maintained at database level

### Data Types
- UUIDs for distributed system compatibility
- Numeric precision for financial calculations
- Timestamps with timezone awareness
