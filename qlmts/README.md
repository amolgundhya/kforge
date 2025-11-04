# QLMTS - Quality Lab & Material Traceability System

A comprehensive Laboratory Information Management System (LIMS) for end-to-end material traceability, laboratory testing, automated reporting, and enterprise integrations.

## 🏗️ Architecture Overview

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: NestJS + TypeScript + Prisma ORM
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Storage**: MinIO (S3-compatible)
- **Testing**: Jest + Selenium WebDriver
- **DevOps**: Docker + Docker Compose

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd qlmts
```

### 2. Environment Setup

```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend environment  
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your configuration
```

### 3. Start with Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 4. Manual Setup (Alternative)

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../e2e-tests && npm install

# Start PostgreSQL and Redis manually or use Docker
docker-compose up -d postgres redis minio

# Setup database
cd backend
npx prisma migrate dev
npx prisma db seed

# Start services
npm run start:dev  # Backend (port 4000)
cd ../frontend
npm run dev        # Frontend (port 3000)
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api/docs
- **MinIO Console**: http://localhost:9001 (admin/password)

### 6. Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@qlmts.com | Admin@123 |
| QC Manager | qc.manager@qlmts.com | QCManager@123 |
| Lab Tech | lab.tech@qlmts.com | LabTech@123 |

## 📁 Project Structure

```
qlmts/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication & authorization
│   │   │   ├── material/   # Heat & batch management
│   │   │   ├── testing/    # Sample registration & testing
│   │   │   ├── reports/    # Report generation & approval
│   │   │   ├── audit/      # Audit logging
│   │   │   └── business-rules/ # Business logic validation
│   │   ├── prisma/         # Database service
│   │   ├── common/         # Shared utilities
│   │   └── main.ts         # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   ├── migrations/     # Database migrations
│   │   └── seed.ts         # Database seeding
│   └── test/               # API tests
├── frontend/               # Next.js web application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # UI components
│   │   ├── lib/          # Utilities & API clients
│   │   └── hooks/        # Custom React hooks
│   ├── public/           # Static assets
│   └── package.json
├── e2e-tests/            # Selenium end-to-end tests
│   ├── src/
│   │   ├── helpers/      # WebDriver utilities
│   │   └── pages/        # Page Object Model
│   └── tests/            # Test specifications
├── docs/                 # Documentation
├── docker-compose.yml    # Development environment
└── README.md
```

## 🧪 Testing

### Unit & Integration Tests

```bash
# Backend tests
cd backend
npm run test           # Unit tests
npm run test:e2e      # Integration tests
npm run test:cov      # Coverage report

# Frontend tests
cd frontend
npm run test          # Component tests
npm run test:coverage # Coverage report
```

### End-to-End Tests

```bash
# Start Selenium Grid
docker-compose --profile e2e up -d

# Run E2E tests
cd e2e-tests
npm test                    # Chrome (default)
npm run test:firefox       # Firefox
npm run test:headless      # Headless mode
```

## 📊 Key Features

### ✅ Material Traceability
- Heat and batch record management
- Supplier integration and MTC handling
- Complete lineage tracking
- Lot splitting with maintained traceability

### ✅ Laboratory Testing
- Sample registration with QR codes
- Multi-category testing (Chemical, Mechanical, NDT)
- Instrument integration and data capture
- Automated verdict calculation
- Deviation management

### ✅ Quality Control Workflow
- State-based sample progression
- Multi-level approvals with e-signatures
- Business rule validation
- Audit trail for all operations

### ✅ Report Generation
- Template-based report creation
- Multiple output formats (PDF, Excel, Word)
- QR code verification
- Automated distribution

### ✅ Enterprise Integration
- SAP ERP integration (PO, GRN, Material Master)
- Instrument data acquisition
- SMTP notifications
- REST API for third-party systems

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting and throttling
- Audit logging for compliance
- Database encryption at rest
- TLS encryption in transit

## 📈 Performance & Scalability

- Horizontal scaling support
- Redis caching layer
- Database query optimization
- Async job processing
- File storage abstraction
- CDN support for static assets

## 🛠️ Development

### Database Operations

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name description

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

### Code Quality

```bash
# Linting
npm run lint           # Check for issues
npm run lint:fix       # Auto-fix issues

# Formatting
npm run format         # Format code with Prettier

# Type checking
npm run type-check     # TypeScript validation
```

### API Development

The API is documented with OpenAPI/Swagger. Access the interactive documentation at:
- http://localhost:4000/api/docs

Key API endpoints:
- `POST /api/auth/login` - User authentication
- `GET /api/materials/heats` - List heat records
- `POST /api/testing/samples` - Create sample
- `POST /api/reports/generate` - Generate report

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `REDIS_HOST` | Redis host | localhost |
| `PORT` | API server port | 4000 |
| `NODE_ENV` | Environment | development |
| `S3_ENDPOINT` | Object storage endpoint | - |

### Feature Flags

Configure features in `backend/src/config/features.ts`:
- SAP integration
- Instrument connectivity
- Email notifications
- Advanced reporting

## 📋 Business Rules

The system implements critical business rules:

1. **BR-01**: Reports can only be released if all mandatory tests pass
2. **BR-02**: Material cannot be consumed without released quality reports
3. **BR-03**: Lot splitting maintains complete traceability lineage
4. **BR-04**: Instrument readings are immutable without deviation approval
5. **BR-05**: Test verdicts are auto-calculated based on specification limits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Write comprehensive tests
- Use conventional commits
- Update documentation
- Ensure all tests pass

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **API Reference**: http://localhost:4000/api/docs
- **Issues**: Create an issue in the repository
- **Email**: support@qlmts.com

## 🗺️ Roadmap

### Phase 1 (MVP) ✅
- Core traceability and testing modules
- Basic reporting and workflow
- Authentication and authorization

### Phase 2 (Q2 2024)
- Advanced analytics and dashboards
- Mobile application for shop floor
- Real-time instrument integration
- Multi-language support

### Phase 3 (Q3 2024)
- AI-powered anomaly detection
- Advanced SPC and control charts
- Customer portal
- Advanced calibration management

### Phase 4 (Q4 2024)
- Multi-plant deployment
- Advanced integrations (MES, ERP)
- Blockchain traceability
- IoT sensor integration

---

Built with ❤️ by the QLMTS Team