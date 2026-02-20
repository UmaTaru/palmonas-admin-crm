# Authentication & Authorization Flow

## JWT Authentication Flow

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

## Role-Based Access Control

```mermaid
graph TB
    subgraph "User Roles"
        SUPER[SUPER_ADMIN<br/>Full Access]
    end
    
    subgraph "Protected Resources"
        ORDERS[Orders Management<br/>CRUD Operations]
        LOGS[System Logs<br/>Read Access]
        CONFIG[App Configuration<br/>Modify Settings]
        WEBHOOKS[Webhook Management<br/>External Integrations]
    end
    
    subgraph "Public Resources"
        LOGIN[Login Endpoint]
        HEALTH[Health Check]
        DOCS[API Documentation]
    end
    
    SUPER --> ORDERS
    SUPER --> LOGS
    SUPER --> CONFIG
    SUPER --> WEBHOOKS
    
    classDef admin fill:#e8f5e8
    classDef protected fill:#fff3e0
    classDef public fill:#e1f5fe
    
    class SUPER admin
    class ORDERS,LOGS,CONFIG,WEBHOOKS protected
    class LOGIN,HEALTH,DOCS public
```

## Token Lifecycle

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Service
    participant DB as Database
    participant R as Redis
    
    Note over C,R: Initial Authentication
    C->>A: POST /auth/login {email, password}
    A->>DB: Validate user credentials
    DB->>A: User data + role
    A->>A: Generate access + refresh tokens
    A->>R: Store refresh token (optional)
    A->>C: {accessToken, refreshToken}
    
    Note over C,R: Protected Request
    C->>A: GET /orders {Authorization: Bearer token}
    A->>A: Verify JWT signature
    A->>A: Check token expiration
    A->>A: Extract user info
    A->>C: Protected resource data
    
    Note over C,R: Token Refresh
    C->>A: POST /auth/refresh {refreshToken}
    A->>A: Validate refresh token
    A->>A: Generate new access token
    A->>C: {accessToken}
```

## Security Measures

### Password Security
- **Bcrypt hashing**: Salted password storage
- **Rate limiting**: Login attempt protection
- **Strong password policy**: Enforced complexity

### Token Security
- **Short-lived access tokens**: 15-minute expiry
- **Refresh token rotation**: Enhanced security
- **Secure storage**: HttpOnly cookies for refresh tokens
- **JWT signing**: HMAC SHA-256 algorithm

### Session Management
- **Stateless design**: No server-side sessions
- **Token blacklisting**: Logout invalidation (via Redis)
- **Concurrent session limits**: Optional implementation

### Request Security
- **HTTPS enforcement**: Encrypted communication
- **CORS policy**: Restricted origins
- **Rate limiting**: Per-IP and per-user limits
- **Input validation**: Zod schema validation
