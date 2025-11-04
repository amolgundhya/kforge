import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReportSignatureService {
  constructor(private prisma: PrismaService) {}

  async addSignature(reportId: string, signatureData: any): Promise<any> {
    return this.prisma.reportSignature.create({
      data: { reportId, ...signatureData }
    });
  }
}
