import { Module } from '@nestjs/common';
// import { ReportService } from './report.service';
// import { ReportController } from './report.controller';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * @deprecated This module uses the legacy "Report" model from the basic schema.
 *
 * If using schema-report-automation.prisma or schema-complex.prisma,
 * use the report-automation module instead.
 *
 * See DEPRECATED.md for more information.
 */
@Module({
  imports: [PrismaModule],
  controllers: [], // [ReportController] - Disabled for extended schema compatibility
  providers: [], // [ReportService] - Disabled for extended schema compatibility
  exports: [], // [ReportService] - Disabled for extended schema compatibility
})
export class ReportModule {}