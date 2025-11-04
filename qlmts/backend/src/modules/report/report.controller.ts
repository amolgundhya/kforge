import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/query-params.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report/MTC' })
  @ApiResponse({
    status: 201,
    description: 'Report created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async createReport(
    @Body() createReportDto: CreateReportDto,
    @Request() req: any,
  ) {
    return this.reportService.createReport(createReportDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports with optional filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of reports retrieved successfully',
  })
  async findAllReports(@Query() query: ReportQueryDto) {
    return this.reportService.findAllReports(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific report by ID' })
  @ApiResponse({
    status: 200,
    description: 'Report retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  async findReportById(@Param('id') id: string) {
    return this.reportService.findReportById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a report' })
  @ApiResponse({
    status: 200,
    description: 'Report updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  async updateReport(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @Request() req: any,
  ) {
    return this.reportService.updateReport(id, updateReportDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a report' })
  @ApiResponse({
    status: 200,
    description: 'Report deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete released report',
  })
  async deleteReport(@Param('id') id: string, @Request() req: any) {
    return this.reportService.deleteReport(id, req.user.id);
  }

  @Post(':id/generate')
  @ApiOperation({ summary: 'Generate MTC PDF for a report' })
  @ApiResponse({
    status: 200,
    description: 'MTC generated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  async generateMTC(@Param('id') id: string, @Request() req: any) {
    return this.reportService.generateMTC(id, req.user.id);
  }

  @Post(':id/release')
  @ApiOperation({ summary: 'Release/Approve a report' })
  @ApiResponse({
    status: 200,
    description: 'Report released successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Report already released or not ready for release',
  })
  async releaseReport(@Param('id') id: string, @Request() req: any) {
    return this.reportService.releaseReport(id, req.user.id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download report PDF' })
  @ApiResponse({
    status: 200,
    description: 'PDF downloaded successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Report or PDF not found',
  })
  async downloadReport(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.reportService.downloadReport(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="MTC-${id}.pdf"`,
    });
    res.send(pdfBuffer);
  }
}