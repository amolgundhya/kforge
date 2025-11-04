import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  StreamableFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReportGenerationService } from '../services/report-generation.service';
import { ReportDistributionService } from '../services/report-distribution.service';
import { ReportVerificationService } from '../services/report-verification.service';
import { ReportSignatureService } from '../services/report-signature.service';
import { ReportAuditService } from '../services/report-audit.service';
import {
  GenerateReportDto,
  BulkGenerateReportDto,
  ReissueReportDto,
  PreviewReportDto,
  ReleaseReportDto,
  SignReportDto,
  DistributeReportDto,
} from '../dto/report-automation.dto';

@ApiTags('Report Automation')
@Controller('api/reports/automation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportAutomationController {
  constructor(
    private readonly generationService: ReportGenerationService,
    private readonly distributionService: ReportDistributionService,
    private readonly verificationService: ReportVerificationService,
    private readonly signatureService: ReportSignatureService,
    private readonly auditService: ReportAuditService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new report' })
  @ApiResponse({ status: 201, description: 'Report generation initiated' })
  async generateReport(@Body() dto: GenerateReportDto, @Req() req: any) {
    return this.generationService.generateReport({
      ...dto,
      userId: req.user.id,
    });
  }

  @Post('bulk-generate')
  @ApiOperation({ summary: 'Generate multiple reports in bulk' })
  @ApiResponse({ status: 201, description: 'Bulk report generation initiated' })
  async bulkGenerate(@Body() dto: BulkGenerateReportDto, @Req() req: any) {
    return this.generationService.bulkGenerateReports(dto.reportIds, {
      ...dto.options,
      userId: req.user.id,
    });
  }

  @Post('reissue/:reportNo')
  @ApiOperation({ summary: 'Reissue an existing report with new version' })
  @ApiResponse({ status: 201, description: 'Report reissued successfully' })
  async reissueReport(
    @Param('reportNo') reportNo: string,
    @Body() dto: ReissueReportDto,
    @Req() req: any,
  ) {
    return this.generationService.reissueReport(
      reportNo,
      dto.reason,
      req.user.id,
      dto.options,
    );
  }

  @Post('preview')
  @ApiOperation({ summary: 'Preview a report before release' })
  @ApiResponse({ status: 200, description: 'Report preview generated' })
  async previewReport(@Body() dto: PreviewReportDto, @Req() req: any) {
    const report = await this.generationService.generateReport({
      ...dto,
      autoRelease: false,
      userId: req.user.id,
    });

    // Wait for generation to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Return preview URL
    return {
      reportId: report.reportId,
      previewUrl: `/api/reports/automation/${report.reportId}/preview`,
      status: 'PREVIEW',
    };
  }

  @Get(':reportId/preview')
  @ApiOperation({ summary: 'Get report preview' })
  @ApiResponse({ status: 200, description: 'Report preview file' })
  async getPreview(
    @Param('reportId') reportId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const report = await this.verificationService.getReport(reportId);
    
    if (!report || !report.fileUrl) {
      throw new NotFoundException('Report not found or not yet generated');
    }

    if (report.status !== 'PREVIEW' && report.status !== 'RELEASED') {
      throw new BadRequestException('Report is not available for preview');
    }

    // Get file buffer from storage
    const fileBuffer = await this.verificationService.getReportFile(report.fileUrl);

    // Set appropriate headers
    res.set({
      'Content-Type': this.getContentType(report.format),
      'Content-Disposition': `inline; filename="${report.reportNo}.${report.format.toLowerCase()}"`,
    });

    return new StreamableFile(fileBuffer);
  }

  @Put(':reportId/release')
  @ApiOperation({ summary: 'Release a report after approval' })
  @ApiResponse({ status: 200, description: 'Report released successfully' })
  async releaseReport(
    @Param('reportId') reportId: string,
    @Body() dto: ReleaseReportDto,
    @Req() req: any,
  ) {
    // Check if report exists and is in preview state
    const report = await this.verificationService.getReport(reportId);
    
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== 'PREVIEW') {
      throw new BadRequestException('Report must be in PREVIEW state to release');
    }

    // Add signatures if provided
    if (dto.signatures && dto.signatures.length > 0) {
      for (const sig of dto.signatures) {
        await this.signatureService.addSignature(reportId, {
          userId: req.user.id,
          role: sig.role,
          signatureType: sig.type,
          signatureData: sig.data,
        });
      }
    }

    // Update report status to released
    await this.verificationService.releaseReport(reportId, req.user.id);

    // Log activity
    await this.auditService.logActivity(reportId, req.user.id, 'RELEASED', {
      releasedBy: req.user.name,
      timestamp: new Date().toISOString(),
    });

    // Auto-distribute if configured
    if (dto.autoDistribute) {
      await this.distributionService.distribute(reportId, {
        channels: dto.distributionChannels || ['EMAIL'],
        recipients: dto.recipients,
      });
    }

    return {
      reportId,
      status: 'RELEASED',
      message: 'Report released successfully',
      distributionStatus: dto.autoDistribute ? 'INITIATED' : 'PENDING',
    };
  }

  @Post(':reportId/sign')
  @ApiOperation({ summary: 'Add digital signature to a report' })
  @ApiResponse({ status: 200, description: 'Signature added successfully' })
  async signReport(
    @Param('reportId') reportId: string,
    @Body() dto: SignReportDto,
    @Req() req: any,
  ) {
    const signature = await this.signatureService.addSignature(reportId, {
      userId: req.user.id,
      role: dto.role,
      signatureType: dto.type,
      signatureData: dto.signatureData,
      certificate: dto.certificate,
    });

    await this.auditService.logActivity(reportId, req.user.id, 'SIGNED', {
      role: dto.role,
      signatureType: dto.type,
    });

    return {
      signatureId: signature.id,
      message: 'Signature added successfully',
    };
  }

  @Post(':reportId/distribute')
  @ApiOperation({ summary: 'Distribute a released report' })
  @ApiResponse({ status: 200, description: 'Distribution initiated' })
  async distributeReport(
    @Param('reportId') reportId: string,
    @Body() dto: DistributeReportDto,
    @Req() req: any,
  ) {
    // Check if report is released
    const report = await this.verificationService.getReport(reportId);
    
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== 'RELEASED') {
      throw new BadRequestException('Only released reports can be distributed');
    }

    const distribution = await this.distributionService.distribute(reportId, {
      channels: dto.channels,
      recipients: dto.recipients,
      metadata: dto.metadata,
    });

    await this.auditService.logActivity(reportId, req.user.id, 'DISTRIBUTED', {
      channels: dto.channels,
      recipientCount: dto.recipients?.length || 0,
    });

    return distribution;
  }

  @Get(':reportId/status')
  @ApiOperation({ summary: 'Get report generation status' })
  @ApiResponse({ status: 200, description: 'Report status retrieved' })
  async getReportStatus(@Param('reportId') reportId: string) {
    const report = await this.verificationService.getReport(reportId);
    
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return {
      reportId: report.id,
      reportNo: report.reportNo,
      version: report.version,
      status: report.status,
      format: report.format,
      generatedAt: report.generatedAt,
      releasedAt: report.releasedAt,
      fileSize: report.fileSize,
      checksum: report.checksum,
    };
  }

  @Get(':reportId/activity')
  @ApiOperation({ summary: 'Get report activity log' })
  @ApiResponse({ status: 200, description: 'Activity log retrieved' })
  async getReportActivity(
    @Param('reportId') reportId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.auditService.getActivityLog(reportId, {
      limit: limit || 50,
      offset: offset || 0,
    });
  }

  @Get(':reportId/download')
  @ApiOperation({ summary: 'Download a released report' })
  @ApiResponse({ status: 200, description: 'Report file' })
  async downloadReport(
    @Param('reportId') reportId: string,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const report = await this.verificationService.getReport(reportId);
    
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== 'RELEASED') {
      throw new BadRequestException('Report is not available for download');
    }

    // Log download activity
    await this.auditService.logActivity(reportId, req.user.id, 'DOWNLOADED', {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Get file buffer from storage
    const fileBuffer = await this.verificationService.getReportFile(report.fileUrl);

    // Set appropriate headers
    res.set({
      'Content-Type': this.getContentType(report.format),
      'Content-Disposition': `attachment; filename="${report.reportNo}_v${report.version}.${report.format.toLowerCase()}"`,
      'Content-Length': String(report.fileSize),
      'X-Report-Checksum': report.checksum,
    });

    return new StreamableFile(fileBuffer);
  }

  @Get('verify/:verifyCode')
  @ApiOperation({ summary: 'Verify report authenticity using QR code' })
  @ApiResponse({ status: 200, description: 'Verification result' })
  async verifyReport(@Param('verifyCode') verifyCode: string) {
    return this.verificationService.verifyByCode(verifyCode);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search reports' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchReports(
    @Query('reportNo') reportNo?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.verificationService.searchReports({
      reportNo,
      customerId,
      status,
      fromDate,
      toDate,
      limit: limit || 50,
      offset: offset || 0,
    });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get report generation statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'monthly',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.auditService.getStatistics({
      period,
      fromDate,
      toDate,
    });
  }

  private getContentType(format: string): string {
    switch (format.toUpperCase()) {
      case 'PDF':
        return 'application/pdf';
      case 'DOCX':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'XLSX':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }
}