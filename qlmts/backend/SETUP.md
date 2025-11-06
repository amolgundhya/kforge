# QLMTS Backend Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Docker and Docker Compose (recommended)

---

## Initial Setup

### 1. Install Dependencies

```bash
cd qlmts/backend
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://qlmts:qlmts_password@localhost:5432/qlmts_db
JWT_SECRET=your_jwt_secret_key
REDIS_HOST=localhost
PORT=4000
S3_ENDPOINT=http://localhost:9000
```

---

## **IMPORTANT: Prisma Schema Selection**

The backend has **three Prisma schema files** with different feature sets:

### Available Schemas

1. **`schema.prisma`** (Basic)
   - Core entities: User, Supplier, Heat, Sample, Test, TestResult, Report
   - Use for: Minimal setup, basic material traceability

2. **`schema-report-automation.prisma`** (Extended - **RECOMMENDED**)
   - Everything from basic schema PLUS:
   - GeneratedReport, ReportTemplate, ReportSignature, ReportActivity
   - ReportDistribution, ReportVerification, ReportNumberSequence
   - Customer, PurchaseOrder, Batch models
   - Use for: Full report automation and quality control workflows

3. **`schema-complex.prisma`** (Complete)
   - Most comprehensive version with advanced traceability
   - Additional audit and compliance features
   - Use for: Production environments with full compliance requirements

### **Setup Instructions**

#### Option A: Use Report Automation Schema (Recommended for Development)

```bash
# Copy the report-automation schema as the main schema
cp prisma/schema-report-automation.prisma prisma/schema.prisma

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

#### Option B: Use Basic Schema (Minimal Setup)

```bash
# The default schema.prisma is already the basic version
# Just generate and migrate
npx prisma generate
npx prisma migrate dev
```

#### Option C: Use Complex Schema (Production)

```bash
# Copy the complex schema as the main schema
cp prisma/schema-complex.prisma prisma/schema.prisma

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### Why This Matters

The codebase includes **report-automation modules** that depend on extended Prisma models:

- `GeneratedReport` model (used in report-generation.service.ts)
- `ReportActivity` model (used in report-audit.service.ts)
- `ReportTemplate`, `ReportSignature`, etc.

**If you see errors like:**
```
Property 'generatedReport' does not exist on type 'PrismaService'
Property 'reportActivity' does not exist on type 'PrismaService'
```

**Solution:** You need to use `schema-report-automation.prisma` or `schema-complex.prisma`, then regenerate the Prisma client.

---

## 3. Database Setup

### Using Docker Compose (Recommended)

```bash
# Start PostgreSQL, Redis, and MinIO
docker-compose up -d

# Verify database is running
docker-compose ps
```

### Manual Database Setup

```bash
# Create database
createdb qlmts_db

# Or using psql
psql -U postgres -c "CREATE DATABASE qlmts_db;"
```

---

## 4. Run Migrations and Seed Data

```bash
# Generate Prisma client (after selecting schema above)
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed sample data (optional)
npx prisma db seed
```

### Default Test Users (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@qlmts.com | Admin@123 |
| QC Manager | qc.manager@qlmts.com | QCManager@123 |
| Lab Tech | lab.tech@qlmts.com | LabTech@123 |

---

## 5. Start Development Server

```bash
# Start with hot reload
npm run start:dev

# The API will be available at http://localhost:4000
# Swagger docs: http://localhost:4000/api/docs
```

---

## Common Issues

### Issue: TypeScript errors about missing Prisma models

**Error:**
```
Property 'generatedReport' does not exist on type 'PrismaService'
```

**Solution:**
1. Ensure you're using the correct schema file (see Prisma Schema Selection above)
2. Run `npx prisma generate` to regenerate the client
3. Restart your TypeScript server

### Issue: Puppeteer headless mode error

**Error:**
```
Type '"new"' is not assignable to type 'boolean | "shell"'
```

**Solution:** This has been fixed in the codebase. Update to the latest version or change `headless: 'new'` to `headless: true` in Puppeteer configuration.

### Issue: Database connection fails

**Solution:**
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env`
- Ensure database user has correct permissions

### Issue: Port 4000 already in use

**Solution:**
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or change the port in .env
PORT=4001
```

---

## Development Workflow

```bash
# Install dependencies
npm install

# Choose and apply correct Prisma schema (see above)
cp prisma/schema-report-automation.prisma prisma/schema.prisma

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run start:dev

# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format
```

---

## Database Management

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

---

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

---

## Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

---

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Project CLAUDE.md](../CLAUDE.md) - Instructions for Claude Code AI assistant
