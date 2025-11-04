import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';
import { ReportTemplateService } from './report-template.service';
import { ReportNumberingService } from './report-numbering.service';
import { TemplateEngineService } from './template-engine.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { ExcelGeneratorService } from './excel-generator.service';
import { WordGeneratorService } from './word-generator.service';
import { QrCodeService } from './qr-code.service';
import { ChecksumService } from './checksum.service';
import { ReportAuditService } from './report-audit.service';
import { ReportSignatureService } from './report-signature.service';

export enum ReportType {
  COA = 'COA', // Certificate of Analysis
  MTC = 'MTC', // Mill Test Certificate
  HT_REPORT = 'HT_REPORT', // Heat Treatment Report
  DISPATCH = 'DISPATCH', // Final Dispatch Report
  PPAP = 'PPAP', // Production Part Approval Process
  CHARPY = 'CHARPY', // Charpy Impact Test
  UT_MAP = 'UT_MAP', // Ultrasonic Testing Map
}

export enum ReportFormat {
  PDF = 'PDF',
  DOCX = 'DOCX',
  XLSX = 'XLSX',
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  PREVIEW = 'PREVIEW',
  RELEASED = 'RELEASED',
  ARCHIVED = 'ARCHIVED',
}

export interface ReportGenerationOptions {
  reportType: ReportType;
  format: ReportFormat;
  templateId?: string;
  customerId: string;
  sampleId?: string;
  batchId?: string;
  poId?: string;
  isReissue?: boolean;
  reissueReason?: string;
  autoRelease?: boolean;
  userId: string;
}

export interface ReportMergeData {
  report_no: string;
  report_date: string;
  version: string;
  customer: {
    name: string;
    code: string;
    address?: string;
    logo?: string;
  };
  po?: {
    number: string;
    line?: string;
  };
  part?: {
    number: string;
    drawing_rev: string;
    description?: string;
  };
  trace: {
    heat_no: string;
    batch_no?: string;
    supplier: string;
    mtc_no?: string;
    production_order?: string;
  };
  chemistry?: Array<{
    element: string;
    min?: number;
    max?: number;
    result: number;
    verdict: string;
  }>;
  mechanical?: {
    UTS_MPa?: number;
    YS_MPa?: number;
    El_pct?: number;
    RA_pct?: number;
    spec?: string;
    verdict: string;
  };
  hardness?: Array<{
    scale: string;
    location: string;
    spec_min?: number;
    spec_max?: number;
    result: number;
    verdict: string;
  }>;
  impact?: Array<{
    temp: number;
    energy: number;
    spec: string;
    result: number;
    verdict: string;
  }>;
  ndt?: Array<{
    method: string;
    standard: string;
    class?: string;
    coverage: string;
    indications: string;
    disposition: string;
  }>;
  heat_treatment?: Array<{
    cycle: string;
    temperature: number;
    duration: number;
    cooling: string;
  }>;
  deviations?: Array<{
    parameter: string;
    original: number;
    deviation: number;
    concession_ref: string;
    approved_by: string;
  }>;
  signatures?: Array<{
    role: string;
    name: string;
    timestamp: string;
  }>;
  checksum?: string;
  qr_code?: string;
  qr_url?: string;
}

@Injectable()
export class ReportGenerationService {
  private readonly logger = new Logger(ReportGenerationService.name);

  constructor(
    private prisma: PrismaService,
    private templateService: ReportTemplateService,
    private numberingService: ReportNumberingService,
    private templateEngine: TemplateEngineService,
    private pdfGenerator: PdfGeneratorService,
    private excelGenerator: ExcelGeneratorService,
    private wordGenerator: WordGeneratorService,
    private qrCodeService: QrCodeService,
    private checksumService: ChecksumService,
    private auditService: ReportAuditService,
    private signatureService: ReportSignatureService,
    @InjectQueue('report-generation') private reportQueue: Queue,
  ) {}

  async generateReport(options: ReportGenerationOptions): Promise<any> {
    this.logger.log(`Generating ${options.reportType} report in ${options.format} format`);

    try {
      // 1. Validate input and check permissions
      await this.validateReportGeneration(options);

      // 2. Get or select template
      const template = await this.templateService.getTemplate(
        options.templateId,
        options.reportType,
        options.customerId,
      );

      // 3. Generate report number
      const reportNo = await this.numberingService.generateReportNumber(
        options.customerId,
        options.reportType,
      );

      // 4. Collect and prepare merge data
      const mergeData = await this.collectMergeData(options);

      // 5. Generate verification codes
      const verifyCode = this.generateVerificationCode();
      const qrUrl = this.generateVerificationUrl(reportNo, verifyCode);
      const qrCode = await this.qrCodeService.generate(qrUrl);

      // 6. Add system fields to merge data
      mergeData.report_no = reportNo;
      mergeData.report_date = new Date().toISOString().split('T')[0];
      mergeData.version = options.isReissue ? await this.getNextVersion(reportNo) : '1.0';
      mergeData.qr_code = qrCode;
      mergeData.qr_url = qrUrl;

      // 7. Create report record in database
      const report = await this.prisma.generatedReport.create({
        data: {
          reportNo,
          reportType: options.reportType,
          version: mergeData.version,
          revision: options.isReissue ? 1 : 0,
          isReissue: options.isReissue || false,
          reissueReason: options.reissueReason,
          templateId: template.id,
          customerId: options.customerId,
          poId: options.poId,
          batchId: options.batchId,
          sampleId: options.sampleId,
          status: ReportStatus.DRAFT,
          format: options.format,
          mergeData: mergeData as any,
          qrCode,
          qrUrl,
        },
      });

      // 8. Log activity
      await this.auditService.logActivity(report.id, options.userId, 'CREATED', {
        reportType: options.reportType,
        format: options.format,
      });

      // 9. Queue for async generation
      await this.reportQueue.add('generate', {
        reportId: report.id,
        template,
        mergeData,
        format: options.format,
        autoRelease: options.autoRelease,
        userId: options.userId,
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      return {
        reportId: report.id,
        reportNo,
        version: mergeData.version,
        status: 'GENERATING',
        message: 'Report generation initiated',
      };
    } catch (error) {
      this.logger.error(`Report generation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async processReportGeneration(jobData: any): Promise<void> {
    const { reportId, template, mergeData, format, autoRelease, userId } = jobData;

    try {
      // 1. Render template with merge data
      const renderedContent = await this.templateEngine.render(template, mergeData);

      // 2. Generate report file based on format
      let fileBuffer: Buffer;
      let mimeType: string;

      switch (format) {
        case ReportFormat.PDF:
          fileBuffer = await this.pdfGenerator.generate(renderedContent, mergeData);
          mimeType = 'application/pdf';
          break;
        case ReportFormat.DOCX:
          fileBuffer = await this.wordGenerator.generate(renderedContent, mergeData);
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case ReportFormat.XLSX:
          fileBuffer = await this.excelGenerator.generate(mergeData);
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // 3. Calculate checksum
      const checksum = this.checksumService.calculate(fileBuffer);

      // 4. Store file (to S3/MinIO)
      const fileUrl = await this.storeReportFile(reportId, fileBuffer, format);

      // 5. Update report record
      await this.prisma.generatedReport.update({
        where: { id: reportId },
        data: {
          fileUrl,
          fileSize: fileBuffer.length,
          checksum,
          status: autoRelease ? ReportStatus.RELEASED : ReportStatus.PREVIEW,
          generatedAt: new Date(),
          releasedAt: autoRelease ? new Date() : null,
        },
      });

      // 6. Create verification record
      await this.prisma.reportVerification.create({
        data: {
          reportNo: mergeData.report_no,
          version: mergeData.version,
          checksum,
          verifyCode: this.extractVerifyCode(mergeData.qr_url),
        },
      });

      // 7. Log activity
      await this.auditService.logActivity(reportId, userId, 'GENERATED', {
        format,
        fileSize: fileBuffer.length,
        checksum,
      });

      if (autoRelease) {
        await this.auditService.logActivity(reportId, userId, 'RELEASED', {
          autoRelease: true,
        });
      }

      this.logger.log(`Report ${reportId} generated successfully`);
    } catch (error) {
      this.logger.error(`Report processing failed for ${reportId}: ${error.message}`, error.stack);
      
      // Update report status to failed
      await this.prisma.generatedReport.update({
        where: { id: reportId },
        data: {
          status: 'FAILED' as any,
          metadata: {
            error: error.message,
            timestamp: new Date().toISOString(),
          },
        },
      });

      throw error;
    }
  }

  async bulkGenerateReports(
    reportIds: string[],
    options: Partial<ReportGenerationOptions>,
  ): Promise<any> {
    this.logger.log(`Bulk generating ${reportIds.length} reports`);

    const results = [];
    for (const id of reportIds) {
      try {
        const result = await this.generateReport({
          ...options,
          sampleId: id,
        } as ReportGenerationOptions);
        results.push({ id, status: 'success', result });
      } catch (error) {
        results.push({ id, status: 'error', error: error.message });
      }
    }

    return {
      total: reportIds.length,
      success: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      results,
    };
  }

  async reissueReport(
    reportNo: string,
    reason: string,
    userId: string,
    options?: Partial<ReportGenerationOptions>,
  ): Promise<any> {
    this.logger.log(`Reissuing report ${reportNo}`);

    // Get original report
    const originalReport = await this.prisma.generatedReport.findFirst({
      where: { reportNo },
      orderBy: { version: 'desc' },
    });

    if (!originalReport) {
      throw new NotFoundException(`Report ${reportNo} not found`);
    }

    // Generate new version
    const newOptions: ReportGenerationOptions = {
      reportType: originalReport.reportType as ReportType,
      format: originalReport.format as ReportFormat,
      templateId: originalReport.templateId,
      customerId: originalReport.customerId,
      sampleId: originalReport.sampleId,
      batchId: originalReport.batchId,
      poId: originalReport.poId,
      isReissue: true,
      reissueReason: reason,
      userId,
      ...options,
    };

    return this.generateReport(newOptions);
  }

  private async validateReportGeneration(options: ReportGenerationOptions): Promise<void> {
    // Check if sample is in released state
    if (options.sampleId) {
      const sample = await this.prisma.sample.findUnique({
        where: { id: options.sampleId },
        include: {
          tests: {
            include: {
              results: true,
            },
          },
        },
      });

      if (!sample) {
        throw new NotFoundException('Sample not found');
      }

      if (!['APPROVED', 'RELEASED'].includes(sample.state)) {
        throw new BadRequestException('Sample must be approved before report generation');
      }

      // Check if all mandatory tests passed
      const failedTests = sample.tests.filter(test => 
        test.results.some(result => result.verdict === 'FAIL' && !result.verdict.includes('DEVIATION'))
      );

      if (failedTests.length > 0) {
        throw new BadRequestException('Cannot generate report: Some mandatory tests failed');
      }
    }

    // Validate customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: options.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
  }

  private async collectMergeData(options: ReportGenerationOptions): Promise<ReportMergeData> {
    const mergeData: ReportMergeData = {
      report_no: '',
      report_date: '',
      version: '',
      customer: null,
      trace: null,
    };

    // Collect customer data
    const customer = await this.prisma.customer.findUnique({
      where: { id: options.customerId },
    });

    mergeData.customer = {
      name: customer.name,
      code: customer.code,
      address: customer.address,
      logo: customer.logo,
    };

    // Collect PO data
    if (options.poId) {
      const po = await this.prisma.purchaseOrder.findUnique({
        where: { id: options.poId },
      });

      mergeData.po = {
        number: po.poNumber,
        line: po.lineNumber,
      };

      mergeData.part = {
        number: po.partNumber,
        drawing_rev: po.drawingRev,
        description: po.description,
      };
    }

    // Collect sample and test data
    if (options.sampleId) {
      const sample = await this.prisma.sample.findUnique({
        where: { id: options.sampleId },
        include: {
          heat: {
            include: {
              supplier: true,
            },
          },
          batch: true,
          tests: {
            include: {
              results: true,
              htCycles: true,
              ndtResults: true,
            },
          },
          deviations: true,
        },
      });

      // Trace data
      mergeData.trace = {
        heat_no: sample.heat?.heatNo || '',
        batch_no: sample.batch?.batchNo,
        supplier: sample.heat?.supplier?.name || '',
        mtc_no: sample.heat?.mtcNumber,
        production_order: sample.heat?.productionOrder,
      };

      // Chemistry data
      const chemistryTests = sample.tests.filter(t => t.category === 'CHEMISTRY');
      if (chemistryTests.length > 0) {
        mergeData.chemistry = chemistryTests.flatMap(test =>
          test.results.map(result => ({
            element: result.parameter,
            min: result.minSpec,
            max: result.maxSpec,
            result: result.value,
            verdict: result.verdict,
          }))
        );
      }

      // Mechanical data
      const mechanicalTests = sample.tests.filter(t => t.category === 'MECHANICAL');
      if (mechanicalTests.length > 0) {
        const mechanicalResults = mechanicalTests[0].results;
        mergeData.mechanical = {
          UTS_MPa: mechanicalResults.find(r => r.parameter === 'UTS')?.value,
          YS_MPa: mechanicalResults.find(r => r.parameter === 'YS')?.value,
          El_pct: mechanicalResults.find(r => r.parameter === 'Elongation')?.value,
          RA_pct: mechanicalResults.find(r => r.parameter === 'ReductionArea')?.value,
          spec: mechanicalTests[0].standard,
          verdict: mechanicalResults.every(r => r.verdict === 'PASS') ? 'PASS' : 'FAIL',
        };
      }

      // Hardness data
      const hardnessTests = sample.tests.filter(t => t.category === 'HARDNESS');
      if (hardnessTests.length > 0) {
        mergeData.hardness = hardnessTests.flatMap(test =>
          test.results.map(result => ({
            scale: test.method,
            location: result.specimenId || 'Center',
            spec_min: result.minSpec,
            spec_max: result.maxSpec,
            result: result.value,
            verdict: result.verdict,
          }))
        );
      }

      // NDT data
      const ndtTests = sample.tests.filter(t => t.category === 'NDT');
      if (ndtTests.length > 0) {
        mergeData.ndt = ndtTests.flatMap(test =>
          test.ndtResults.map(ndt => ({
            method: ndt.method,
            standard: ndt.standard,
            class: ndt.class,
            coverage: `${ndt.coverage}%`,
            indications: ndt.indications ? JSON.stringify(ndt.indications) : 'Nil',
            disposition: ndt.disposition,
          }))
        );
      }

      // Heat treatment data
      const htTests = sample.tests.filter(t => t.category === 'HT');
      if (htTests.length > 0) {
        mergeData.heat_treatment = htTests.flatMap(test =>
          test.htCycles.map(cycle => ({
            cycle: cycle.cycleType,
            temperature: cycle.temperature,
            duration: cycle.duration,
            cooling: cycle.coolingMethod || 'Air',
          }))
        );
      }

      // Deviations
      if (sample.deviations.length > 0) {
        mergeData.deviations = sample.deviations.map(dev => ({
          parameter: dev.parameter,
          original: dev.originalValue,
          deviation: dev.deviatedValue,
          concession_ref: dev.concessionRef,
          approved_by: dev.approvedBy,
        }));
      }
    }

    return mergeData;
  }

  private generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  private generateVerificationUrl(reportNo: string, verifyCode: string): string {
    const baseUrl = process.env.REPORT_VERIFICATION_URL || 'https://reports.example.com/verify';
    return `${baseUrl}/${reportNo}?code=${verifyCode}`;
  }

  private extractVerifyCode(qrUrl: string): string {
    const match = qrUrl.match(/code=([A-Z0-9]+)/);
    return match ? match[1] : '';
  }

  private async getNextVersion(reportNo: string): string {
    const lastReport = await this.prisma.generatedReport.findFirst({
      where: { reportNo },
      orderBy: { version: 'desc' },
    });

    if (!lastReport) {
      return '1.0';
    }

    const [major, minor] = lastReport.version.split('.').map(Number);
    return `${major}.${minor + 1}`;
  }

  private async storeReportFile(reportId: string, buffer: Buffer, format: string): Promise<string> {
    // TODO: Implement S3/MinIO storage
    // For now, return a placeholder URL
    return `https://storage.example.com/reports/${reportId}.${format.toLowerCase()}`;
  }
}