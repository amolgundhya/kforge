import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { MaterialModule } from './modules/material/material.module';
import { SampleModule } from './modules/sample/sample.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { ReportModule } from './modules/report/report.module';
import { ReportAutomationModule } from './modules/report-automation/report-automation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    PrismaModule,
    AuthModule,
    MaterialModule,
    SampleModule,
    SupplierModule,
    ReportModule,
    ReportAutomationModule,
  ],
})
export class AppModule {}