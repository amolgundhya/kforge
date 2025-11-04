# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: QLMTS - Quality Lab & Material Traceability System

A LIMS (Laboratory Information Management System) for material traceability, testing, and quality control in manufacturing environments. Built with NestJS backend, Next.js frontend, PostgreSQL database, and supporting services.

## Tech Stack
- **Backend**: NestJS + TypeScript + Prisma ORM + PostgreSQL
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Infrastructure**: Docker Compose, Redis (cache), MinIO (S3-compatible storage)
- **Testing**: Jest (unit/integration) + Selenium WebDriver (E2E)

## Development Commands

### Quick Start - Full Stack with Docker
```bash
# Start all services (recommended)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Backend Development (NestJS)
```bash
cd qlmts/backend

# Install dependencies
npm install

# Database operations
npx prisma generate           # Generate Prisma client
npx prisma migrate dev        # Run migrations
npx prisma migrate reset      # Reset database (WARNING: Data loss)
npx prisma db seed           # Seed sample data
npx prisma studio            # Open database GUI

# Development
npm run start:dev            # Start with hot reload (port 4000)
npm run build               # Build for production
npm run start:prod          # Run production build

# Testing
npm run test                # Unit tests
npm run test:e2e           # Integration tests
npm run test:cov           # Coverage report

# Code quality
npm run lint               # ESLint check
npm run format             # Prettier formatting
```

### Frontend Development (Next.js)
```bash
cd qlmts/frontend

# Install dependencies
npm install

# Development
npm run dev                 # Start dev server (port 3000)
npm run build              # Build for production
npm run start              # Run production build

# Testing
npm run test               # Component tests
npm run test:coverage      # Coverage report

# Code quality
npm run lint              # Next.js linting
```

### E2E Testing (Selenium)
```bash
# Start Selenium Grid first
docker-compose --profile e2e up -d

cd qlmts/e2e-tests
npm install

# Run tests
npm test                   # Chrome (default)
npm run test:firefox      # Firefox
npm run test:headless     # Headless mode
```

## Database Schema

Uses Prisma ORM with PostgreSQL. Main entities:
- **User**: Authentication, roles (Admin, QC Manager, Lab Tech)
- **Supplier**: Material suppliers
- **Heat**: Material batches with traceability
- **Sample**: Test samples from heats
- **Test**: Testing procedures (Chemical, Mechanical, NDT)
- **TestResult**: Test outcomes with verdicts
- **Report**: Generated quality reports

## API Endpoints (Backend port 4000)

- **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- **Materials**: `/api/materials/heats` (CRUD operations)
- **Samples**: `/api/testing/samples` (Registration, state management)
- **Reports**: `/api/reports/generate` (PDF/Excel generation)
- **API Docs**: `http://localhost:4000/api/docs` (Swagger)

## Environment Configuration

Backend (`.env`):
```
DATABASE_URL=postgresql://qlmts:qlmts_password@localhost:5432/qlmts_db
JWT_SECRET=your_jwt_secret_key
REDIS_HOST=localhost
PORT=4000
S3_ENDPOINT=http://localhost:9000
```

Frontend (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Default Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@qlmts.com | Admin@123 |
| QC Manager | qc.manager@qlmts.com | QCManager@123 |
| Lab Tech | lab.tech@qlmts.com | LabTech@123 |

## Key Business Rules

1. **BR-01**: Reports can only be released if all mandatory tests pass
2. **BR-02**: Material cannot be consumed without released quality reports
3. **BR-03**: Lot splitting maintains complete traceability lineage
4. **BR-04**: Instrument readings are immutable without deviation approval
5. **BR-05**: Test verdicts are auto-calculated based on specification limits

## Project Structure

```
qlmts/
├── backend/                 # NestJS API
│   ├── src/modules/        # Feature modules (auth, material, testing, reports)
│   ├── prisma/             # Database schema and migrations
│   └── test/               # Test files
├── frontend/               # Next.js application
│   ├── src/app/           # App router pages
│   ├── components/        # UI components
│   └── lib/               # API clients and utilities
├── e2e-tests/             # Selenium E2E tests
└── docker-compose.yml     # Development environment
```

## Services & Ports

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- MinIO: localhost:9000 (API), localhost:9001 (Console)
- Selenium Hub: localhost:4444

## Important Notes

- Always run `npx prisma generate` after schema changes
- Use Docker Compose for consistent development environment
- Backend uses JWT with refresh tokens for authentication
- Frontend uses React Query for API state management
- All test results are immutable once approved
- Maintain audit trail for compliance requirements