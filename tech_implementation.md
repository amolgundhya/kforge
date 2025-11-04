# QLMTS Technical Implementation Guide
**Version:** 1.0  
**Date:** 2025-09-15  
**Purpose:** Complete implementation reference for Quality Lab & Material Traceability System MVP

---

## 1. Technology Stack & Architecture

### 1.1 Frontend Stack
```javascript
{
  "framework": "Next.js 14 (App Router)",
  "ui_library": "shadcn/ui + Radix UI",
  "styling": "Tailwind CSS 3.4",
  "state": "Zustand 4.5 + TanStack Query v5",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts 2.10",
  "tables": "TanStack Table v8",
  "icons": "Lucide React",
  "animations": "Framer Motion 11",
  "date": "date-fns 3.0",
  "pdf": "react-pdf",
  "barcode": "react-barcode + qrcode.js"
}
```

### 1.2 Backend Stack
```javascript
{
  "framework": "NestJS 10",
  "runtime": "Node.js 20 LTS",
  "orm": "Prisma 5.8",
  "database": "PostgreSQL 16",
  "cache": "Redis 7",
  "queue": "BullMQ",
  "validation": "class-validator + class-transformer",
  "auth": "Passport.js + JWT",
  "api_docs": "Swagger/OpenAPI 3.0",
  "logging": "Winston + Morgan",
  "monitoring": "Prometheus + Grafana"
}
```

### 1.3 Infrastructure
```yaml
development:
  - Docker Compose
  - Hot reload enabled
  - Local PostgreSQL + Redis

production:
  - Kubernetes (K8s)
  - PostgreSQL (AWS RDS/Azure Database)
  - Redis (ElastiCache/Azure Cache)
  - S3/Azure Blob (file storage)
  - CDN (CloudFront/Azure CDN)
```

---

## 2. Modern UI Design System

### 2.1 Color Palette
```css
:root {
  /* Primary - Professional Blue */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-900: #1e3a8a;
  
  /* Success - Green */
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --success-600: #16a34a;
  
  /* Warning - Amber */
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  
  /* Danger - Red */
  --danger-50: #fef2f2;
  --danger-500: #ef4444;
  --danger-600: #dc2626;
  
  /* Neutral - Slate */
  --neutral-50: #f8fafc;
  --neutral-100: #f1f5f9;
  --neutral-200: #e2e8f0;
  --neutral-300: #cbd5e1;
  --neutral-500: #64748b;
  --neutral-700: #334155;
  --neutral-900: #0f172a;
  --neutral-950: #020617;
}
```

### 2.2 Typography
```css
/* Font: Inter for UI, JetBrains Mono for code */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### 2.3 Component Design Patterns

#### Card Component
```tsx
// Modern card with subtle shadow and hover effect
<Card className="
  bg-white dark:bg-neutral-900 
  border border-neutral-200 dark:border-neutral-800
  rounded-xl 
  shadow-sm hover:shadow-md 
  transition-all duration-200
  p-6
">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
      Total Samples
    </CardTitle>
    <BeakerIcon className="h-4 w-4 text-neutral-500" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">2,543</div>
    <p className="text-xs text-neutral-500 mt-1">
      +12% from last month
    </p>
  </CardContent>
</Card>
```

#### Modern Table Design
```tsx
// Clean table with hover states and sorting indicators
<Table>
  <TableHeader>
    <TableRow className="border-b border-neutral-200 dark:border-neutral-800">
      <TableHead className="font-medium text-neutral-700 dark:text-neutral-300">
        Heat Number
        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="
      hover:bg-neutral-50 dark:hover:bg-neutral-800/50 
      transition-colors cursor-pointer
    ">
      <TableCell>Content</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 2.4 Layout Structure
```tsx
// Main Layout with modern sidebar
<div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
  {/* Sidebar */}
  <aside className="
    w-64 bg-white dark:bg-neutral-900 
    border-r border-neutral-200 dark:border-neutral-800
    flex flex-col
  ">
    {/* Logo */}
    <div className="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800">
      <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
        QLMTS
      </h1>
    </div>
    
    {/* Navigation */}
    <nav className="flex-1 p-4">
      {/* Nav items with modern hover effect */}
    </nav>
  </aside>
  
  {/* Main Content */}
  <main className="flex-1 overflow-auto">
    {/* Top Bar */}
    <header className="
      h-16 bg-white dark:bg-neutral-900 
      border-b border-neutral-200 dark:border-neutral-800
      px-6 flex items-center justify-between
    ">
      {/* Breadcrumb and actions */}
    </header>
    
    {/* Page Content */}
    <div className="p-6">
      {children}
    </div>
  </main>
</div>
```

---

## 3. Frontend Validation Rules

### 3.1 Form Validation Schemas (Zod)

```typescript
// src/lib/validations/material.ts
import { z } from 'zod';

// Heat validation schema
export const heatSchema = z.object({
  heatNo: z.string()
    .min(1, 'Heat number is required')
    .max(50, 'Heat number must be less than 50 characters')
    .regex(/^[A-Za-z0-9\-\/\.]+$/, 'Invalid heat number format')
    .transform(val => val.toUpperCase()),
  
  supplierId: z.string()
    .uuid('Invalid supplier ID'),
  
  materialGrade: z.string()
    .min(1, 'Material grade is required')
    .max(100, 'Material grade too long'),
  
  receivedOn: z.date()
    .max(new Date(), 'Received date cannot be in future'),
  
  quantity: z.number()
    .positive('Quantity must be positive')
    .max(999999.999, 'Quantity too large'),
  
  unit: z.enum(['KG', 'MT', 'LBS', 'PCS'], {
    errorMap: () => ({ message: 'Invalid unit' })
  }),
  
  mtcFile: z.instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'File must be less than 10MB')
    .refine(file => ['application/pdf'].includes(file.type), 'Only PDF files allowed')
    .optional()
});

// Sample registration schema
export const sampleSchema = z.object({
  sampleCode: z.string()
    .min(1, 'Sample code required')
    .regex(/^S-\d{4}-\d{6}$/, 'Format: S-YYYY-XXXXXX'),
  
  sourceType: z.enum(['HEAT', 'BATCH', 'FINISHED']),
  
  sourceId: z.string().uuid(),
  
  testPlanId: z.string().uuid('Test plan required'),
  
  priority: z.enum(['NORMAL', 'URGENT', 'CRITICAL']).default('NORMAL'),
  
  requestedBy: z.string().email('Valid email required'),
  
  notes: z.string().max(500, 'Notes too long').optional()
});

// Chemical test results schema
export const chemicalTestSchema = z.object({
  elements: z.array(z.object({
    element: z.enum(['C', 'Mn', 'Si', 'P', 'S', 'Cr', 'Ni', 'Mo', 'Cu', 'Al', 'V', 'Ti', 'Nb']),
    value: z.number()
      .min(0, 'Value cannot be negative')
      .max(100, 'Value cannot exceed 100%')
      .multipleOf(0.001, 'Maximum 3 decimal places'),
    unit: z.literal('%')
  })).min(1, 'At least one element required'),
  
  method: z.enum(['SPECTRO', 'ICP', 'WET_CHEM']),
  
  equipmentId: z.string().uuid(),
  
  operatorId: z.string().uuid()
});

// Mechanical test schema
export const mechanicalTestSchema = z.object({
  testType: z.enum(['TENSILE', 'HARDNESS', 'IMPACT', 'BEND']),
  
  tensile: z.object({
    uts: z.number().positive('UTS must be positive'),
    ys: z.number().positive('YS must be positive'),
    elongation: z.number().min(0).max(100),
    reductionArea: z.number().min(0).max(100).optional()
  }).optional(),
  
  hardness: z.object({
    value: z.number().positive(),
    scale: z.enum(['HB', 'HRC', 'HRB', 'HV']),
    load: z.number().positive()
  }).optional(),
  
  impact: z.object({
    value: z.number().min(0),
    temperature: z.number(),
    notchType: z.enum(['V', 'U'])
  }).optional()
});
```

### 3.2 Real-time Validation Hooks

```typescript
// src/hooks/useFormValidation.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';

export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onChange', // Real-time validation
    reValidateMode: 'onChange'
  });
  
  const [validationState, setValidationState] = useState({
    isValidating: false,
    fieldErrors: {},
    touchedFields: {}
  });
  
  // Custom async validation for unique checks
  const validateUnique = async (field: string, value: string) => {
    setValidationState(prev => ({ ...prev, isValidating: true }));
    
    try {
      const response = await fetch(`/api/validate/unique`, {
        method: 'POST',
        body: JSON.stringify({ field, value })
      });
      
      const { isUnique } = await response.json();
      
      if (!isUnique) {
        form.setError(field, {
          type: 'manual',
          message: `${field} already exists`
        });
      }
    } finally {
      setValidationState(prev => ({ ...prev, isValidating: false }));
    }
  };
  
  return {
    ...form,
    validateUnique,
    validationState
  };
}
```

### 3.3 Input Components with Validation

```tsx
// src/components/ui/validated-input.tsx
import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ label, error, success, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </Label>
        
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              'pr-10 transition-all duration-200',
              error && 'border-danger-500 focus:ring-danger-500',
              success && 'border-success-500 focus:ring-success-500',
              className
            )}
            {...props}
          />
          
          {error && (
            <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-danger-500" />
          )}
          
          {success && !error && (
            <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-success-500" />
          )}
        </div>
        
        {error && (
          <p className="text-xs text-danger-500 mt-1 animate-slideIn">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-xs text-neutral-500 mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
```

---

## 4. Backend Validation & Business Rules

### 4.1 DTO Validation (NestJS)

```typescript
// src/modules/material/dto/create-heat.dto.ts
import { 
  IsString, IsUUID, IsDateString, IsNumber, IsEnum,
  Length, Matches, Min, Max, IsOptional
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum UnitType {
  KG = 'KG',
  MT = 'MT',
  LBS = 'LBS',
  PCS = 'PCS'
}

export class CreateHeatDto {
  @ApiProperty({ 
    example: 'HT-2024-001234',
    description: 'Unique heat number from supplier'
  })
  @IsString()
  @Length(1, 50)
  @Matches(/^[A-Za-z0-9\-\/\.]+$/, {
    message: 'Heat number contains invalid characters'
  })
  @Transform(({ value }) => value?.toUpperCase())
  heatNo: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID('4')
  supplierId: string;

  @ApiProperty({ example: 'ASTM A105' })
  @IsString()
  @Length(1, 100)
  materialGrade: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @Transform(({ value }) => {
    const date = new Date(value);
    if (date > new Date()) {
      throw new Error('Received date cannot be in future');
    }
    return value;
  })
  receivedOn: string;

  @ApiProperty({ example: 1500.5 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(999999.999)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ enum: UnitType })
  @IsEnum(UnitType)
  unit: UnitType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  poNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  grnNumber?: string;
}
```

### 4.2 Custom Validation Decorators

```typescript
// src/common/decorators/validators.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

// Custom validator for unique constraint
@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(value: any, args: ValidationArguments) {
    const [model, field] = args.constraints;
    const count = await this.prisma[model].count({
      where: { [field]: value }
    });
    return count === 0;
  }

  defaultMessage(args: ValidationArguments) {
    const [model, field] = args.constraints;
    return `${field} already exists`;
  }
}

export function IsUnique(model: string, field: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [model, field],
      validator: IsUniqueConstraint,
    });
  };
}

// Validator for business rule: Material within spec limits
@ValidatorConstraint({ async: true })
@Injectable()
export class IsWithinSpecConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(value: any, args: ValidationArguments) {
    const { element, percentage, materialGrade } = args.object as any;
    
    const spec = await this.prisma.materialSpec.findFirst({
      where: { 
        grade: materialGrade,
        element: element
      }
    });
    
    if (!spec) return true; // No spec defined, pass validation
    
    return percentage >= spec.minValue && percentage <= spec.maxValue;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is outside specification limits`;
  }
}
```

### 4.3 Business Rules Service

```typescript
// src/modules/business-rules/business-rules.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class BusinessRulesService {
  constructor(private prisma: PrismaService) {}

  /**
   * BR-01: Report can only be released if all mandatory tests pass
   */
  async validateReportRelease(reportId: string): Promise<void> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        sample: {
          include: {
            tests: {
              include: {
                results: true,
                testPlan: true
              }
            }
          }
        }
      }
    });

    const mandatoryTests = report.sample.tests.filter(t => t.testPlan.isMandatory);
    const failedTests = mandatoryTests.filter(t => 
      t.results.some(r => r.verdict === 'FAIL')
    );

    if (failedTests.length > 0) {
      throw new BadRequestException(
        `Cannot release report. ${failedTests.length} mandatory tests failed.`
      );
    }
  }

  /**
   * BR-02: Heat/Batch cannot be consumed if report not released
   */
  async validateMaterialConsumption(batchId: string): Promise<void> {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        samples: {
          include: {
            reports: true
          }
        }
      }
    });

    const hasReleasedReport = batch.samples.some(s => 
      s.reports.some(r => r.status === 'RELEASED')
    );

    if (!hasReleasedReport) {
      throw new BadRequestException(
        'Material cannot be consumed without a released quality report'
      );
    }
  }

  /**
   * BR-03: Lot splitting must maintain traceability
   */
  async splitBatch(
    parentBatchId: string, 
    splitQuantities: number[]
  ): Promise<string[]> {
    const parentBatch = await this.prisma.batch.findUnique({
      where: { id: parentBatchId }
    });

    const totalSplit = splitQuantities.reduce((a, b) => a + b, 0);
    
    if (totalSplit > parentBatch.quantity) {
      throw new BadRequestException(
        'Split quantity exceeds available batch quantity'
      );
    }

    const childBatches = await Promise.all(
      splitQuantities.map(async (qty, index) => {
        return await this.prisma.batch.create({
          data: {
            batchNo: `${parentBatch.batchNo}-S${index + 1}`,
            heatId: parentBatch.heatId,
            quantity: qty,
            unit: parentBatch.unit,
            splitParentId: parentBatchId
          }
        });
      })
    );

    // Update parent batch quantity
    await this.prisma.batch.update({
      where: { id: parentBatchId },
      data: {
        quantity: parentBatch.quantity - totalSplit
      }
    });

    return childBatches.map(b => b.id);
  }

  /**
   * BR-04: Instrument readings are immutable
   */
  async validateTestResultModification(
    testResultId: string,
    userId: string
  ): Promise<void> {
    const result = await this.prisma.testResult.findUnique({
      where: { id: testResultId },
      include: { test: true }
    });

    if (result.test.source === 'INSTRUMENT') {
      // Only allow with deviation approval
      const deviation = await this.prisma.deviation.findFirst({
        where: {
          testResultId,
          approvedBy: userId,
          status: 'APPROVED'
        }
      });

      if (!deviation) {
        throw new BadRequestException(
          'Instrument readings cannot be modified without approved deviation'
        );
      }
    }
  }

  /**
   * BR-05: Calculate mileage and validate thresholds
   */
  calculateTestVerdict(
    value: number,
    min: number | null,
    max: number | null,
    target: number | null
  ): 'PASS' | 'FAIL' | 'WARNING' {
    if (min !== null && value < min) return 'FAIL';
    if (max !== null && value > max) return 'FAIL';
    
    // Warning if outside ±10% of target
    if (target !== null) {
      const tolerance = target * 0.1;
      if (Math.abs(value - target) > tolerance) return 'WARNING';
    }
    
    return 'PASS';
  }
}
```

### 4.4 Validation Pipes

```typescript
// src/common/pipes/validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    
    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    });
    
    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors
      });
    }
    
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]): Record<string, string[]> {
    const formatted = {};
    
    errors.forEach(error => {
      const property = error.property;
      const constraints = Object.values(error.constraints || {});
      
      if (!formatted[property]) {
        formatted[property] = [];
      }
      
      formatted[property].push(...constraints);
    });
    
    return formatted;
  }
}
```

---

## 5. API Specification with Validation

### 5.1 OpenAPI Schema Generation

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('QLMTS API')
    .setDescription('Quality Lab & Material Traceability System API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Materials', 'Heat and batch management')
    .addTag('Testing', 'Sample registration and test results')
    .addTag('Reports', 'Report generation and approval')
    .addTag('Integration', 'SAP and instrument integrations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT || 4000);
}

bootstrap();
```

### 5.2 Request/Response Interceptors

```typescript
// src/common/interceptors/validation.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Pre-processing validation
    this.validateHeaders(request.headers);
    this.validateQueryParams(request.query);
    
    return next.handle().pipe(
      map(data => {
        // Post-processing validation
        this.validateResponse(data);
        return this.formatResponse(data);
      }),
    );
  }

  private validateHeaders(headers: any): void {
    // Validate required headers
    if (!headers['x-request-id']) {
      throw new BadRequestException('Missing x-request-id header');
    }
  }

  private validateQueryParams(query: any): void {
    // Validate pagination params
    if (query.page && (isNaN(query.page) || query.page < 1)) {
      throw new BadRequestException('Invalid page parameter');
    }
    
    if (query.limit && (isNaN(query.limit) || query.limit < 1 || query.limit > 100)) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
  }

  private validateResponse(data: any): void {
    // Ensure response has required structure
    if (data && typeof data === 'object' && !data.timestamp) {
      data.timestamp = new Date().toISOString();
    }
  }

  private formatResponse(data: any): any {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
```

---

## 6. Database Schema with Constraints

### 6.1 Prisma Schema with Validations

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Heat {
  id            String    @id @default(uuid())
  heatNo        String    @unique @db.VarChar(50)
  supplierId    String    @db.Uuid
  materialGrade String    @db.VarChar(100)
  receivedOn    DateTime  @db.Date
  quantity      Decimal   @db.Decimal(10, 3)
  unit          Unit
  poNumber      String?   @db.VarChar(50)
  grnNumber     String?   @db.VarChar(50)
  mtcId         String?   @db.Uuid
  
  // Audit fields
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  createdBy     String    @db.Uuid
  updatedBy     String?   @db.Uuid
  
  // Relations
  supplier      Supplier  @relation(fields: [supplierId], references: [id])
  mtc           MTC?      @relation(fields: [mtcId], references: [id])
  batches       Batch[]
  samples       Sample[]
  
  // Indexes
  @@index([supplierId])
  @@index([materialGrade])
  @@index([receivedOn])
  @@index([heatNo, supplierId])
}

model Sample {
  id            String        @id @default(uuid())
  code          String        @unique @db.VarChar(20)
  sourceType    SourceType
  sourceId      String        @db.Uuid
  testPlanId    String        @db.Uuid
  priority      Priority      @default(NORMAL)
  state         SampleState   @default(DRAFT)
  requestedBy   String        @db.VarChar(100)
  notes         String?       @db.Text
  
  // Audit
  createdAt     DateTime      @default(now())
  registeredAt  DateTime?
  completedAt   DateTime?
  
  // Relations
  testPlan      TestPlan      @relation(fields: [testPlanId], references: [id])
  tests         Test[]
  reports       Report[]
  approvals     Approval[]
  
  // Constraints
  @@index([state])
  @@index([sourceType, sourceId])
  @@check("code ~ '^S-[0-9]{4}-[0-9]{6}$'")
}

model TestResult {
  id            String    @id @default(uuid())
  testId        String    @db.Uuid
  parameter     String    @db.VarChar(50)
  value         Decimal   @db.Decimal(12, 6)
  unit          String    @db.VarChar(20)
  minLimit      Decimal?  @db.Decimal(12, 6)
  maxLimit      Decimal?  @db.Decimal(12, 6)
  targetValue   Decimal?  @db.Decimal(12, 6)
  verdict       Verdict
  
  // Instrument data
  source        DataSource @default(MANUAL)
  instrumentId  String?    @db.Uuid
  rawData       Json?
  
  // Audit
  createdAt     DateTime  @default(now())
  createdBy     String    @db.Uuid
  modifiedAt    DateTime?
  modifiedBy    String?   @db.Uuid
  
  // Relations
  test          Test      @relation(fields: [testId], references: [id])
  instrument    Equipment? @relation(fields: [instrumentId], references: [id])
  deviations    Deviation[]
  
  // Constraints
  @@index([verdict])
  @@index([testId, parameter])
  @@check("value >= 0")
}

// Enums
enum Unit {
  KG
  MT
  LBS
  PCS
}

enum SourceType {
  HEAT
  BATCH
  FINISHED
}

enum Priority {
  NORMAL
  URGENT
  CRITICAL
}

enum SampleState {
  DRAFT
  REGISTERED
  IN_PROGRESS
  IN_REVIEW
  APPROVED
  RELEASED
  REJECTED
  ON_HOLD
}

enum Verdict {
  PASS
  FAIL
  WARNING
  PENDING
}

enum DataSource {
  MANUAL
  INSTRUMENT
  CALCULATED
  IMPORTED
}
```

### 6.2 Database Triggers for Validation

```sql
-- Trigger to validate heat number uniqueness per supplier
CREATE OR REPLACE FUNCTION validate_heat_uniqueness()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM heat 
    WHERE heat_no = NEW.heat_no 
    AND supplier_id = NEW.supplier_id 
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Heat number % already exists for this supplier', NEW.heat_no;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_heat_uniqueness
BEFORE INSERT OR UPDATE ON heat
FOR EACH ROW EXECUTE FUNCTION validate_heat_uniqueness();

-- Trigger to auto-calculate test verdict
CREATE OR REPLACE FUNCTION calculate_test_verdict()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.min_limit IS NOT NULL AND NEW.value < NEW.min_limit THEN
    NEW.verdict = 'FAIL';
  ELSIF NEW.max_limit IS NOT NULL AND NEW.value > NEW.max_limit THEN
    NEW.verdict = 'FAIL';
  ELSIF NEW.target_value IS NOT NULL THEN
    IF ABS(NEW.value - NEW.target_value) > (NEW.target_value * 0.1) THEN
      NEW.verdict = 'WARNING';
    ELSE
      NEW.verdict = 'PASS';
    END IF;
  ELSE
    NEW.verdict = 'PASS';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_verdict
BEFORE INSERT OR UPDATE ON test_result
FOR EACH ROW EXECUTE FUNCTION calculate_test_verdict();

-- Trigger to prevent modification of instrument data
CREATE OR REPLACE FUNCTION protect_instrument_data()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.source = 'INSTRUMENT' AND NEW.value != OLD.value THEN
    -- Check if deviation exists
    IF NOT EXISTS (
      SELECT 1 FROM deviation 
      WHERE test_result_id = NEW.id 
      AND status = 'APPROVED'
    ) THEN
      RAISE EXCEPTION 'Cannot modify instrument data without approved deviation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_instrument_readings
BEFORE UPDATE ON test_result
FOR EACH ROW EXECUTE FUNCTION protect_instrument_data();
```

---

## 7. Security & Input Sanitization

### 7.1 Input Sanitization Middleware

```typescript
// src/common/middleware/sanitization.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as DOMPurify from 'isomorphic-dompurify';
import * as validator from 'validator';

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }
    
    // Sanitize query params
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }
    
    // Sanitize params
    if (req.params) {
      req.params = this.sanitizeObject(req.params);
    }
    
    next();
  }
  
  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      // Remove HTML tags
      let sanitized = DOMPurify.sanitize(obj, { ALLOWED_TAGS: [] });
      
      // Escape SQL characters
      sanitized = sanitized.replace(/['";\\]/g, '');
      
      // Normalize whitespace
      sanitized = validator.trim(sanitized);
      sanitized = validator.stripLow(sanitized);
      
      return sanitized;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj !== null && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        // Prevent prototype pollution
        if (obj.hasOwnProperty(key) && !['__proto__', 'constructor', 'prototype'].includes(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  }
}
```

### 7.2 Rate Limiting

```typescript
// src/common/guards/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as Redis from 'ioredis';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private redis: Redis.Redis;
  
  constructor(private reflector: Reflector) {
    this.redis = new Redis.Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const limit = this.reflector.get<number>('rateLimit', context.getHandler()) || 100;
    const window = this.reflector.get<number>('rateLimitWindow', context.getHandler()) || 60;
    
    const key = `rate_limit:${request.ip}:${request.route.path}`;
    
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, window);
    }
    
    if (current > limit) {
      throw new HttpException({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Rate limit exceeded',
        retryAfter: window,
      }, HttpStatus.TOO_MANY_REQUESTS);
    }
    
    return true;
  }
}

// Usage decorator
export function RateLimit(limit: number, window: number = 60) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('rateLimit', limit, descriptor.value);
    Reflect.defineMetadata('rateLimitWindow', window, descriptor.value);
  };
}
```

---

## 8. Error Handling & Logging

### 8.1 Global Exception Filter

```typescript
// src/common/filters/global-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors = null;
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = exceptionResponse['message'] || message;
        errors = exceptionResponse['errors'] || null;
      } else {
        message = exceptionResponse;
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      message = this.handlePrismaError(exception);
    }
    
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      errors,
      requestId: request.headers['x-request-id'] || 'unknown',
    };
    
    // Log error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : '',
    );
    
    response.status(status).json(errorResponse);
  }
  
  private handlePrismaError(error: PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002':
        const field = error.meta?.target;
        return `Duplicate value for ${field}`;
      case 'P2003':
        return 'Foreign key constraint failed';
      case 'P2025':
        return 'Record not found';
      default:
        return 'Database operation failed';
    }
  }
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests for Validation

```typescript
// src/modules/material/material.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MaterialService } from './material.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateHeatDto } from './dto/create-heat.dto';

describe('MaterialService', () => {
  let service: MaterialService;
  let prisma: PrismaService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaterialService, PrismaService],
    }).compile();
    
    service = module.get<MaterialService>(MaterialService);
    prisma = module.get<PrismaService>(PrismaService);
  });
  
  describe('createHeat', () => {
    it('should create heat with valid data', async () => {
      const dto: CreateHeatDto = {
        heatNo: 'HT-2024-001',
        supplierId: '550e8400-e29b-41d4-a716-446655440000',
        materialGrade: 'ASTM A105',
        receivedOn: '2024-01-15',
        quantity: 1500.5,
        unit: 'KG',
      };
      
      const mockHeat = { id: '123', ...dto };
      jest.spyOn(prisma.heat, 'create').mockResolvedValue(mockHeat);
      
      const result = await service.createHeat(dto);
      
      expect(result).toEqual(mockHeat);
      expect(prisma.heat.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          heatNo: 'HT-2024-001',
        }),
      });
    });
    
    it('should reject duplicate heat number', async () => {
      const dto: CreateHeatDto = {
        heatNo: 'HT-2024-001',
        supplierId: '550e8400-e29b-41d4-a716-446655440000',
        materialGrade: 'ASTM A105',
        receivedOn: '2024-01-15',
        quantity: 1500.5,
        unit: 'KG',
      };
      
      jest.spyOn(prisma.heat, 'create').mockRejectedValue(
        new Error('Unique constraint failed')
      );
      
      await expect(service.createHeat(dto)).rejects.toThrow();
    });
  });
});
```

### 9.2 E2E Tests

```typescript
// test/material.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Material Controller (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
    
    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    authToken = loginResponse.body.token;
  });
  
  describe('/materials/heats (POST)', () => {
    it('should create heat with valid data', () => {
      return request(app.getHttpServer())
        .post('/materials/heats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          heatNo: 'HT-2024-TEST-001',
          supplierId: '550e8400-e29b-41d4-a716-446655440000',
          materialGrade: 'ASTM A105',
          receivedOn: '2024-01-15',
          quantity: 1500.5,
          unit: 'KG',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.heatNo).toBe('HT-2024-TEST-001');
        });
    });
    
    it('should reject invalid heat number format', () => {
      return request(app.getHttpServer())
        .post('/materials/heats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          heatNo: 'INVALID@#$',
          supplierId: '550e8400-e29b-41d4-a716-446655440000',
          materialGrade: 'ASTM A105',
          receivedOn: '2024-01-15',
          quantity: 1500.5,
          unit: 'KG',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.errors).toHaveProperty('heatNo');
        });
    });
  });
  
  afterAll(async () => {
    await app.close();
  });
});
```

---

## 10. Deployment Configuration

### 10.1 Docker Configuration

```dockerfile
# Dockerfile.backend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build
RUN npx prisma generate

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 4000

CMD ["npm", "run", "start:prod"]
```

```dockerfile
# Dockerfile.frontend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/.next/static /usr/share/nginx/html/_next/static
COPY --from=builder /app/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 10.2 Environment Variables

```env
# .env.production
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/qlmts

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Auth
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# SAP Integration
SAP_BASE_URL=https://sap.company.com
SAP_CLIENT_ID=qlmts-client
SAP_CLIENT_SECRET=secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@company.com
SMTP_PASS=password

# Storage
S3_BUCKET=qlmts-files
S3_REGION=us-east-1
S3_ACCESS_KEY=key
S3_SECRET_KEY=secret

# Frontend
NEXT_PUBLIC_API_URL=https://api.qlmts.company.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://api.qlmts.company.com
```

---

## 11. Project Structure

```
qlmts/
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── materials/
│   │   │   ├── testing/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   └── api/
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── tables/
│   │   └── charts/
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   ├── validations/
│   │   └── utils/
│   └── public/
│
├── backend/
│   ├── src/
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── middleware/
│   │   │   └── pipes/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── material/
│   │   │   ├── testing/
│   │   │   ├── reports/
│   │   │   ├── workflow/
│   │   │   └── integration/
│   │   ├── prisma/
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── test/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

This implementation guide provides comprehensive details for building the QLMTS MVP with modern UI aesthetics and robust validation at every layer. All validation rules, business logic, and security measures are clearly defined for consistent implementation.