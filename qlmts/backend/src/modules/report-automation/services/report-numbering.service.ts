import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReportNumberingService {
  constructor(private prisma: PrismaService) {}

  async generateReportNumber(customerId: string, reportType: string): Promise<string> {
    const plant = 'PUNE';
    const year = new Date().getFullYear().toString().slice(-2);
    const seq = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `${plant}-${year}-${seq}`;
  }
}
