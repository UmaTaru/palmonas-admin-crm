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

## 5. Deployment Architecture

```mermaid
graph TB
    subgraph "Docker Environment"
        subgraph "Frontend Container"
            FE[React App<br/>Vite Dev Server<br/>Port: 5173]
        end
        
        subgraph "Backend Container"
            BE[Express API<br/>Node.js<br/>Port: 4000]
        end
        
        subgraph "Worker Container"
            WK[Background Worker<br/>BullMQ Consumer]
        end
        
        subgraph "Database Container"
            DB[(PostgreSQL 15<br/>Port: 5432)]
        end
        
        subgraph "Cache Container"
            RD[(Redis 7<br/>Port: 6379)]
        end
    end
    
    subgraph "External Services"
        EXT[External APIs<br/>Webhooks<br/>Order Channels]
    end
    
    subgraph "Development Tools"
        K6[K6 Load Tests]
        LOGS[Docker Logs]
        HEALTH[Health Checks]
    end
    
    FE --> BE
    BE --> DB
    BE --> RD
    WK --> DB
    WK --> RD
    EXT --> BE
    K6 --> BE
    
    DB -.->|Health Check| HEALTH
    RD -.->|Health Check| HEALTH
    BE -.->|Logs| LOGS
    WK -.->|Logs| LOGS
    
    classDef container fill:#e3f2fd
    classDef database fill:#e8f5e8
    classDef external fill:#fff3e0
    classDef tools fill:#f3e5f5
    
    class FE,BE,WK container
    class DB,RD database
    class EXT external
    class K6,LOGS,HEALTH tools
```

## 6. Background Job Processing Flow

```mermaid
flowchart LR
    subgraph "API Layer"
        API[Express API]
    end
    
    subgraph "Queue System"
        REDIS[(Redis)]
        QUEUE[BullMQ Queue]
    end
    
    subgraph "Worker Process"
        WORKER[Background Worker]
        PROCESSOR[Job Processor]
    end
    
    subgraph "Job Types"
        ORDER_SYNC[Order Sync Jobs]
        STATUS_UPDATE[Status Update Jobs]
        NOTIFICATION[Notification Jobs]
        CLEANUP[Cleanup Jobs]
    end
    
    API --> QUEUE
    QUEUE --> REDIS
    REDIS --> WORKER
    WORKER --> PROCESSOR
    
    PROCESSOR --> ORDER_SYNC
    PROCESSOR --> STATUS_UPDATE
    PROCESSOR --> NOTIFICATION
    PROCESSOR --> CLEANUP
    
    ORDER_SYNC -.->|Success/Failure| REDIS
    STATUS_UPDATE -.->|Success/Failure| REDIS
    NOTIFICATION -.->|Success/Failure| REDIS
    CLEANUP -.->|Success/Failure| REDIS
```

## 7. Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Network Security"
            CORS[CORS Policy<br/>Allowed Origins]
            HELMET[Helmet.js<br/>Security Headers]
        end
        
        subgraph "Authentication"
            JWT[JWT Tokens<br/>Access + Refresh]
            BCRYPT[Bcrypt<br/>Password Hashing]
        end
        
        subgraph "Authorization"
            RBAC[Role-Based Access<br/>SUPER_ADMIN]
            MIDDLEWARE[Auth Middleware<br/>Route Protection]
        end
        
        subgraph "Rate Limiting"
            API_LIMIT[API Rate Limiting<br/>General Endpoints]
            AUTH_LIMIT[Auth Rate Limiting<br/>Login Endpoints]
        end
        
        subgraph "Input Validation"
            ZOD[Zod Validation<br/>Request Schemas]
            SANITIZE[Input Sanitization<br/>XSS Prevention]
        end
    end
    
    subgraph "Data Protection"
        ENV[Environment Variables<br/>Secrets Management]
        DB_CONN[Secure DB Connections<br/>Connection Pooling]
    end
    
    CLIENT[Client Request] --> CORS
    CORS --> HELMET
    HELMET --> API_LIMIT
    API_LIMIT --> AUTH_LIMIT
    AUTH_LIMIT --> JWT
    JWT --> RBAC
    RBAC --> MIDDLEWARE
    MIDDLEWARE --> ZOD
    ZOD --> SANITIZE
    SANITIZE --> DB_CONN
```

## Architecture Decisions & Rationale

### Technology Choices
- **React + TypeScript**: Type safety and modern UI development
- **Express.js**: Lightweight, flexible Node.js framework
- **PostgreSQL**: ACID compliance for order data integrity
- **Redis**: Fast caching and job queue management
- **BullMQ**: Robust background job processing
- **Docker**: Consistent development and deployment environment

### Scalability Considerations
- **Horizontal scaling**: Stateless API design allows multiple instances
- **Database indexing**: Optimized queries for order lookups
- **Caching strategy**: Redis for frequently accessed data
- **Background processing**: Async job handling for heavy operations

### Security Measures
- **JWT authentication**: Stateless, scalable auth mechanism
- **Role-based access**: Granular permission control
- **Rate limiting**: Protection against abuse
- **Input validation**: Zod schemas prevent malicious input
- **Security headers**: Helmet.js for common vulnerabilities
