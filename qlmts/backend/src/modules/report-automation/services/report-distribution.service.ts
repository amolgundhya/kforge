import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReportDistributionService {
  constructor(private prisma: PrismaService) {}

  async distribute(reportId: string, options: any): Promise<any> {
    return { reportId, status: 'DISTRIBUTION_QUEUED', channels: options.channels };
  }
}
