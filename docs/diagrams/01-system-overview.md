# System Overview Diagram

## High-Level Architecture

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

## Component Description

### Client Layer
- **React Frontend**: User interface built with React 19 and TypeScript
- **Load Tests**: K6 performance testing scripts for system validation

### Application Layer
- **Express.js API**: Main REST API server handling all business logic
- **Background Worker**: BullMQ worker for processing async jobs
- **Swagger Docs**: Auto-generated API documentation

### Middleware Layer
- **JWT Auth**: Token-based authentication system
- **Rate Limiting**: Protection against API abuse
- **CORS**: Cross-origin resource sharing configuration
- **Pino Logger**: Structured logging for monitoring

### Data Layer
- **PostgreSQL**: Primary database for persistent data storage
- **Redis**: Caching and job queue management

### External Systems
- **Webhooks**: Integration endpoints for external services
- **Order Channels**: Third-party order management integrations
