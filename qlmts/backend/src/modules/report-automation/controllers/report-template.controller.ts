import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReportTemplateService } from '../services/report-template.service';

@ApiTags('Report Templates')
@Controller('api/reports/templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportTemplateController {
  constructor(private readonly templateService: ReportTemplateService) {}

  @Get()
  @ApiOperation({ summary: 'List all report templates' })
  async listTemplates() {
    return { templates: [] };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  async getTemplate(@Param('id') id: string) {
    return this.templateService.getTemplate(id);
  }
}
