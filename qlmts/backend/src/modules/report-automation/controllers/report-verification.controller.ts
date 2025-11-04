import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportVerificationService } from '../services/report-verification.service';

@ApiTags('Report Verification')
@Controller('api/reports/verify')
export class ReportVerificationController {
  constructor(private readonly verificationService: ReportVerificationService) {}

  @Get(':code')
  @ApiOperation({ summary: 'Verify report authenticity' })
  async verify(@Param('code') code: string) {
    return this.verificationService.verifyByCode(code);
  }
}
