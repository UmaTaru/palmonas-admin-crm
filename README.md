# Palmonas Admin CRM

A full-stack admin CRM system for managing orders with real-time processing, authentication, and monitoring capabilities.

## 🏗️ Project Structure

```
palmonas-assignment/
├── apps/
│   ├── backend/          # Node.js/Express API server
│   └── frontend/         # React web application
├── load-tests/           # K6 performance tests
├── docker-compose.yml    # Docker services configuration
└── .env.example         # Environment variables template
```

## 🚀 Tech Stack

### Backend
- Node.js with Express.js - REST API server
- TypeScript - Type-safe development
- PostgreSQL - Primary database
- Redis - Caching and job queues
- BullMQ - Background job processing
- JWT - Authentication
- Swagger - API documentation
- Pino - Structured logging

### Frontend
- React 19 with TypeScript
- Vite - Build tool and dev server
- TailwindCSS - Styling
- React Router - Navigation
- Axios - HTTP client

### Infrastructure
- Docker & Docker Compose - Containerization
- K6 - Load testing

## 📋 Prerequisites

Make sure you have these installed on your system:

- Node.js (version 18 or higher)
- Docker and Docker Compose
- Git

## 🛠️ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/UmaTaru/palmonas-admin-crm.git
cd palmonas-assignment
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# The default values in .env.example should work for local development
```

### 3. Start the Application
```bash
# Start all services (database, backend, frontend, worker)
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```
### 4. Default Admin Credentials
```bash
Email: admin@palmonas.com
Password: admin123
```
### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- API Documentation: http://localhost:4000/docs
- Health Check: http://localhost:4000/health

## 🔧 Development Setup

### Running Without Docker

If you prefer to run services individually:

#### 1. Start Database Services
```bash
# Start only PostgreSQL and Redis
docker-compose up postgres redis -d
```

#### 2. Backend Development
```bash
cd apps/backend

# Install dependencies
npm install

# Start development server
npm run dev

# Start background worker (in another terminal)
npm run worker
```

#### 3. Frontend Development
```bash
cd apps/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🧪 Testing

### Load Testing with K6

The project includes performance tests to ensure the system can handle load:

```bash
# Install K6 (macOS)
brew install k6

# Run health check test
k6 run load-tests/healthcheck.test.js

# Run orders dashboard test
k6 run load-tests/orders-dashboard.test.js

# Run get orders test
k6 run load-tests/getOrders.test.js
```

## 📚 API Features

### Authentication
- User login/logout
- JWT-based authentication
- Role-based access control (SUPER_ADMIN)

### Orders Management
- Create, read, update, delete orders
- Pagination support
- Real-time order processing via background jobs

### System Monitoring
- Health check endpoint
- Structured logging
- System metrics

### Security
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Zod

## 🗃️ Database

The system uses PostgreSQL with the following key features:
- Connection pooling
- Health checks
- Structured data storage for orders and users

## 🔄 Background Jobs

Redis and BullMQ handle background processing:
- Order processing workflows
- Email notifications
- Data synchronization tasks

## 📊 Monitoring & Logging

- **Pino** for structured JSON logging
- Request ID tracking
- Performance monitoring
- Health check endpoints

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 5173 | React development server |
| Backend | 4000 | Express API server |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache and job queue |

## 🔒 Environment Variables

Key environment variables (see `.env.example`):

```env
# Database
POSTGRES_DB=palmonas
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgres://postgres:postgres@postgres:5432/palmonas

# Redis
REDIS_URL=redis://redis:6379

# JWT Secrets
JWT_ACCESS_SECRET=access_secret_key
JWT_REFRESH_SECRET=refresh_secret_key

# Server
PORT=4000
```

## 🚦 Common Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Rebuild services
docker-compose up --build

# Reset database (removes all data)
docker-compose down -v
docker-compose up -d
```

## 🔧 Troubleshooting

### Port Already in Use
If you get port conflicts:
```bash
# Check what's using the port
lsof -i :4000
lsof -i :5173

# Kill the process or change ports in docker-compose.yml
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres
```

### Frontend Not Loading
```bash
# Check if backend is running
curl http://localhost:4000/health

# Restart frontend service
docker-compose restart frontend
```

## 👨‍💻 Development Notes

- Backend uses **hot reloading** with `ts-node-dev`
- Frontend uses **Vite** for fast development
- All services have **health checks** configured
- **CORS** is configured for local development
- **Rate limiting** is available but commented out for development

**Author**: Uma Taru