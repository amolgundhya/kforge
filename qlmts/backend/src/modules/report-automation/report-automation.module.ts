import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '../../prisma/prisma.module';

// Controllers
import { ReportAutomationController } from './controllers/report-automation.controller';
import { ReportTemplateController } from './controllers/report-template.controller';
import { ReportVerificationController } from './controllers/report-verification.controller';

// Services
import { ReportGenerationService } from './services/report-generation.service';
import { ReportTemplateService } from './services/report-template.service';
import { ReportNumberingService } from './services/report-numbering.service';
import { ReportDistributionService } from './services/report-distribution.service';
import { ReportVerificationService } from './services/report-verification.service';
import { ReportSignatureService } from './services/report-signature.service';
import { ReportAuditService } from './services/report-audit.service';
import { TemplateEngineService } from './services/template-engine.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { ExcelGeneratorService } from './services/excel-generator.service';
import { WordGeneratorService } from './services/word-generator.service';
import { QrCodeService } from './services/qr-code.service';
import { ChecksumService } from './services/checksum.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    BullModule.registerQueue({
      name: 'report-generation',
    }),
    BullModule.registerQueue({
      name: 'report-distribution',
    }),
  ],
  controllers: [
    ReportAutomationController,
    ReportTemplateController,
    ReportVerificationController,
  ],
  providers: [
    ReportGenerationService,
    ReportTemplateService,
    ReportNumberingService,
    ReportDistributionService,
    ReportVerificationService,
    ReportSignatureService,
    ReportAuditService,
    TemplateEngineService,
    PdfGeneratorService,
    ExcelGeneratorService,
    WordGeneratorService,
    QrCodeService,
    ChecksumService,
  ],
  exports: [
    ReportGenerationService,
    ReportTemplateService,
    ReportVerificationService,
    ReportDistributionService,
  ],
})
export class ReportAutomationModule {}