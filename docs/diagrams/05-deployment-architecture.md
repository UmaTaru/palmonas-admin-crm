# Deployment Architecture

## Docker Container Architecture

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

## Container Details

### Frontend Container
- **Base Image**: Node.js Alpine
- **Build Tool**: Vite
- **Port**: 5173
- **Volume Mount**: Hot reload for development
- **Dependencies**: React, TypeScript, TailwindCSS

### Backend Container
- **Base Image**: Node.js Alpine
- **Runtime**: ts-node-dev for development
- **Port**: 4000
- **Volume Mount**: Source code for hot reload
- **Dependencies**: Express, PostgreSQL client, Redis client

### Worker Container
- **Base Image**: Same as backend
- **Process**: BullMQ worker
- **No Ports**: Internal processing only
- **Shared Codebase**: Uses backend source

### Database Container
- **Image**: PostgreSQL 15 Alpine
- **Port**: 5432
- **Volume**: Persistent data storage
- **Health Check**: pg_isready command

### Cache Container
- **Image**: Redis 7 Alpine
- **Port**: 6379
- **Health Check**: Redis ping command
- **Usage**: Session storage, job queues

## Network Architecture

```mermaid
graph LR
    subgraph "External Network"
        CLIENT[Client Browser]
        TESTER[Load Tester]
    end
    
    subgraph "Docker Network (palmonas-network)"
        FE[Frontend:5173]
        BE[Backend:4000]
        WK[Worker]
        DB[PostgreSQL:5432]
        RD[Redis:6379]
    end
    
    CLIENT -->|HTTP| FE
    CLIENT -->|API Calls| BE
    TESTER -->|Load Tests| BE
    
    FE -.->|Internal| BE
    BE -.->|Internal| DB
    BE -.->|Internal| RD
    WK -.->|Internal| DB
    WK -.->|Internal| RD
```

## Environment Configuration

### Development Environment
```yaml
services:
  frontend:
    build: ./apps/frontend
    ports: ["5173:5173"]
    volumes: ["./apps/frontend:/app"]
    
  backend:
    build: ./apps/backend
    ports: ["4000:4000"]
    volumes: ["./apps/backend:/app"]
    command: npm run dev
    
  worker:
    build: ./apps/backend
    volumes: ["./apps/backend:/app"]
    command: npm run worker
```

### Production Considerations
- **Multi-stage builds**: Optimized image sizes
- **Health checks**: Container orchestration
- **Resource limits**: CPU and memory constraints
- **Secrets management**: Environment variable injection
- **Logging**: Centralized log aggregation

## Scaling Strategy

### Horizontal Scaling
```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Nginx/HAProxy]
    end
    
    subgraph "API Instances"
        API1[Backend Instance 1]
        API2[Backend Instance 2]
        API3[Backend Instance 3]
    end
    
    subgraph "Worker Pool"
        W1[Worker 1]
        W2[Worker 2]
        W3[Worker 3]
    end
    
    subgraph "Shared Services"
        DB[(PostgreSQL<br/>Primary/Replica)]
        RD[(Redis Cluster)]
    end
    
    LB --> API1
    LB --> API2
    LB --> API3
    
    API1 --> DB
    API2 --> DB
    API3 --> DB
    
    W1 --> RD
    W2 --> RD
    W3 --> RD
```

## Monitoring & Observability

### Health Checks
- **Database**: Connection and query tests
- **Redis**: Ping and memory usage
- **API**: Response time and error rates
- **Worker**: Job processing metrics

### Logging Strategy
- **Structured logging**: JSON format with Pino
- **Log levels**: Debug, info, warn, error
- **Request tracing**: Unique request IDs
- **Performance metrics**: Response times, throughput

### Metrics Collection
- **Application metrics**: Custom business metrics
- **Infrastructure metrics**: CPU, memory, disk
- **Database metrics**: Connection pool, query performance
- **Queue metrics**: Job processing rates, failures
