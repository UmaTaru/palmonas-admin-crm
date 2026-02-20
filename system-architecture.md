# Palmonas Admin CRM - System Design Diagrams

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React Frontend<br/>Port: 5173]
        LT[Load Tests<br/>K6 Scripts]
    end
    
    subgraph "Load Balancer/Proxy"
        LB[Nginx/Docker<br/>Load Balancer]
    end
    
    subgraph "Application Layer"
        API[Express.js API<br/>Port: 4000]
        WORKER[Background Worker<br/>BullMQ]
        DOCS[Swagger Docs<br/>/docs]
    end
    
    subgraph "Middleware Layer"
        AUTH[JWT Auth<br/>Middleware]
        RATE[Rate Limiting<br/>Middleware]
        CORS[CORS<br/>Middleware]
        LOG[Pino Logger<br/>Middleware]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Port: 5432)]
        REDIS[(Redis<br/>Port: 6379)]
    end
    
    subgraph "External Systems"
        WEBHOOKS[External<br/>Webhooks]
        CHANNELS[Order Channels<br/>Integrations]
    end
    
    UI --> LB
    LT --> LB
    LB --> API
    API --> AUTH
    API --> RATE
    API --> CORS
    API --> LOG
    API --> PG
    API --> REDIS
    WORKER --> PG
    WORKER --> REDIS
    WEBHOOKS --> API
    API --> CHANNELS
    
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef database fill:#e8f5e8
    classDef external fill:#fff3e0
    
    class UI,LT frontend
    class API,WORKER,DOCS,AUTH,RATE,CORS,LOG backend
    class PG,REDIS database
    class WEBHOOKS,CHANNELS external
```

## 2. Database Schema Diagram

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

## 3. API Flow Diagram

```mermaid
sequenceDiagram
    participant C as Client (React)
    participant A as API Server
    participant M as Middleware
    participant DB as PostgreSQL
    participant R as Redis
    participant W as Worker
    
    Note over C,W: Authentication Flow
    C->>A: POST /auth/login
    A->>M: Rate Limiting Check
    M->>A: Allow/Deny
    A->>DB: Validate Credentials
    DB->>A: User Data
    A->>A: Generate JWT
    A->>C: JWT Token
    
    Note over C,W: Order Management Flow
    C->>A: GET /orders (with JWT)
    A->>M: Auth Middleware
    M->>A: Validated User
    A->>DB: Query Orders
    DB->>A: Orders Data
    A->>C: Orders Response
    
    Note over C,W: Order Status Update Flow
    C->>A: PATCH /orders/:id/status
    A->>M: Auth + Validation
    M->>A: Validated Request
    A->>DB: Update Order Status
    A->>DB: Log Status History
    A->>R: Queue Background Job
    R->>W: Process Job
    W->>DB: Update Sync Logs
    A->>C: Success Response
```

## 4. Authentication & Authorization Flow

```mermaid
flowchart TD
    START([User Login Request]) --> VALIDATE{Validate Credentials}
    VALIDATE -->|Invalid| REJECT[Return 401 Unauthorized]
    VALIDATE -->|Valid| GENERATE[Generate JWT Tokens]
    GENERATE --> ACCESS[Access Token<br/>15min expiry]
    GENERATE --> REFRESH[Refresh Token<br/>7 days expiry]
    ACCESS --> STORE[Store in Memory/LocalStorage]
    REFRESH --> HTTPONLY[Store in HttpOnly Cookie]
    
    STORE --> PROTECTED[Access Protected Routes]
    PROTECTED --> MIDDLEWARE{Auth Middleware}
    MIDDLEWARE -->|Valid Token| AUTHORIZE{Check Role/Permissions}
    MIDDLEWARE -->|Invalid/Expired| REFRESH_FLOW[Try Refresh Token]
    
    AUTHORIZE -->|Authorized| ALLOW[Allow Access]
    AUTHORIZE -->|Forbidden| DENY[Return 403 Forbidden]
    
    REFRESH_FLOW --> NEW_ACCESS[Generate New Access Token]
    NEW_ACCESS --> ALLOW
    
    classDef success fill:#d4edda
    classDef error fill:#f8d7da
    classDef process fill:#d1ecf1
    
    class ALLOW,NEW_ACCESS success
    class REJECT,DENY error
    class GENERATE,MIDDLEWARE,AUTHORIZE process
```

## 📊 Architecture Highlights

### Scalability Features
- **Stateless API design** for horizontal scaling
- **Background job processing** for async operations
- **Redis caching** for performance optimization
- **Database indexing** for query performance

### Security Measures
- **JWT authentication** with refresh token rotation
- **Role-based access control** (RBAC)
- **Rate limiting** and request validation
- **Secure password hashing** with bcrypt

### Reliability Features
- **Health checks** for all services
- **Structured logging** with request tracing
- **Error handling** with retry mechanisms
- **Database transactions** for data consistency
