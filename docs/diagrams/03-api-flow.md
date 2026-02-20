# API Flow Diagram

## Request-Response Flow

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

## API Endpoints Overview

### Authentication Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh

### Order Management Endpoints
- `GET /orders` - List orders with pagination
- `GET /orders/:id` - Get specific order details
- `PATCH /orders/:id/status` - Update order status

### System Endpoints
- `GET /health` - System health check
- `GET /docs` - API documentation
- `POST /webhooks/*` - External webhook handlers

### Logs & Monitoring
- `GET /logs` - System logs access
- Internal logging via Pino middleware

## Middleware Chain

```mermaid
flowchart LR
    REQ[Incoming Request] --> REQID[Request ID]
    REQID --> CORS[CORS Check]
    CORS --> HELMET[Security Headers]
    HELMET --> RATE[Rate Limiting]
    RATE --> AUTH[Authentication]
    AUTH --> AUTHZ[Authorization]
    AUTHZ --> VALID[Input Validation]
    VALID --> ROUTE[Route Handler]
    ROUTE --> LOG[Response Logging]
    LOG --> RES[Response]
```

## Error Handling Flow

```mermaid
flowchart TD
    START[Request Received] --> MIDDLEWARE{Middleware Chain}
    MIDDLEWARE -->|Pass| HANDLER[Route Handler]
    MIDDLEWARE -->|Fail| ERROR[Error Response]
    
    HANDLER --> BUSINESS{Business Logic}
    BUSINESS -->|Success| SUCCESS[Success Response]
    BUSINESS -->|Error| CATCH[Error Caught]
    
    CATCH --> LOG[Log Error]
    LOG --> FORMAT[Format Error Response]
    FORMAT --> ERROR
    
    ERROR --> CLIENT[Send to Client]
    SUCCESS --> CLIENT
```
