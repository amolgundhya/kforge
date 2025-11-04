import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/query-params.dto';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ReportService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createReport(createReportDto: CreateReportDto, userId: string) {
    // Validate sample exists
    const sample = await this.prisma.sample.findUnique({
      where: { id: createReportDto.sampleId },
      include: {
        tests: {
          include: {
            results: true,
          },
        },
      },
    });

    if (!sample) {
      throw new BadRequestException('Sample not found');
    }

    // Check if sample has completed tests
    const hasCompletedTests = sample.tests.some(test => test.status === 'COMPLETED');
    if (!hasCompletedTests) {
      throw new BadRequestException('Sample must have at least one completed test');
    }

    // Generate report number
    const lastReport = await this.prisma.report.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let reportNumber = 1;
    if (lastReport && lastReport.reportNo) {
      const match = lastReport.reportNo.match(/MTC-\d{4}-(\\d{6})$/);
      if (match) {
        reportNumber = parseInt(match[1]) + 1;
      }
    }

    const year = new Date().getFullYear();
    const reportNo = `MTC-${year}-${reportNumber.toString().padStart(6, '0')}`;

    try {
      const report = await this.prisma.report.create({
        data: {
          reportNo,
          sampleId: createReportDto.sampleId,
          status: 'DRAFT',
          version: 1,
        },
        include: {
          sample: {
            include: {
              heat: {
                include: {
                  supplier: true,
                },
              },
              tests: {
                include: {
                  results: true,
                },
              },
            },
          },
        },
      });

      return report;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Report number already exists');
      }
      throw error;
    }
  }

  async findAllReports(query: ReportQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where: Prisma.ReportWhereInput = {};

    // Build where conditions
    if (query.reportNo) {
      where.reportNo = { contains: query.reportNo, mode: 'insensitive' };
    }
    if (query.sampleId) {
      where.sampleId = query.sampleId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) {
        where.createdAt.gte = new Date(query.fromDate);
      }
      if (query.toDate) {
        where.createdAt.lte = new Date(query.toDate);
      }
    }

    // Build orderBy
    const orderBy: Prisma.ReportOrderByWithRelationInput = {};
    orderBy[query.sortBy as keyof Prisma.ReportOrderByWithRelationInput] = query.sortOrder;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          sample: {
            include: {
              heat: {
                include: {
                  supplier: {
                    select: {
                      name: true,
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: query.limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findReportById(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        sample: {
          include: {
            heat: {
              include: {
                supplier: true,
              },
            },
            tests: {
              include: {
                results: true,
              },
              orderBy: {
                category: 'asc',
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async updateReport(id: string, updateReportDto: UpdateReportDto, userId: string) {
    const existingReport = await this.findReportById(id);

    // Prevent updating released reports
    if (existingReport.status === 'RELEASED') {
      throw new BadRequestException('Cannot update a released report');
    }

    // If status is changing, validate the transition
    if (updateReportDto.status && updateReportDto.status !== existingReport.status) {
      this.validateStatusTransition(existingReport.status, updateReportDto.status);
    }

    const updatedReport = await this.prisma.report.update({
      where: { id },
      data: {
        ...updateReportDto,
        version: existingReport.version + 1,
      },
      include: {
        sample: {
          include: {
            heat: {
              include: {
                supplier: true,
              },
            },
            tests: {
              include: {
                results: true,
              },
            },
          },
        },
      },
    });

    return updatedReport;
  }

  async deleteReport(id: string, userId: string) {
    const report = await this.findReportById(id);

    // Prevent deletion of released reports
    if (report.status === 'RELEASED') {
      throw new BadRequestException('Cannot delete a released report');
    }

    await this.prisma.report.delete({
      where: { id },
    });

    return { message: 'Report deleted successfully' };
  }

  async generateMTC(id: string, userId: string) {
    const report = await this.findReportById(id);

    // Generate checksum for data integrity
    const dataToHash = JSON.stringify({
      reportNo: report.reportNo,
      sampleId: report.sampleId,
      tests: report.sample.tests,
    });
    const checksum = crypto.createHash('sha256').update(dataToHash).digest('hex');

    // Update report with checksum
    const updatedReport = await this.prisma.report.update({
      where: { id },
      data: {
        checksum,
        status: report.status === 'DRAFT' ? 'REVIEW' : report.status,
      },
      include: {
        sample: {
          include: {
            heat: {
              include: {
                supplier: true,
              },
            },
            tests: {
              include: {
                results: true,
              },
            },
          },
        },
      },
    });

    // In a real implementation, this would generate a PDF
    // For now, we'll return the report data that would be used for PDF generation
    return {
      ...updatedReport,
      mtcData: this.formatMTCData(updatedReport),
    };
  }

  async releaseReport(id: string, userId: string) {
    const report = await this.findReportById(id);

    if (report.status === 'RELEASED') {
      throw new BadRequestException('Report is already released');
    }

    if (report.status === 'DRAFT') {
      throw new BadRequestException('Report must be reviewed before release');
    }

    // Check if all tests are completed
    const allTestsCompleted = report.sample.tests.every(test => test.status === 'COMPLETED');
    if (!allTestsCompleted) {
      throw new BadRequestException('All tests must be completed before releasing the report');
    }

    const releasedReport = await this.prisma.report.update({
      where: { id },
      data: {
        status: 'RELEASED',
        releasedAt: new Date(),
      },
      include: {
        sample: {
          include: {
            heat: {
              include: {
                supplier: true,
              },
            },
            tests: {
              include: {
                results: true,
              },
            },
          },
        },
      },
    });

    // Mark sample as completed
    await this.prisma.sample.update({
      where: { id: report.sampleId },
      data: {
        state: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return releasedReport;
  }

  async downloadReport(id: string): Promise<Buffer> {
    const report = await this.findReportById(id);

    if (!report.fileUrl) {
      // Generate a placeholder PDF content
      // In production, this would retrieve the actual PDF file
      const pdfContent = this.generatePDFContent(report);
      return Buffer.from(pdfContent, 'utf-8');
    }

    // In production, this would fetch the PDF from storage (S3, etc.)
    // For now, return a placeholder
    return Buffer.from('PDF content would be here', 'utf-8');
  }

  private validateStatusTransition(currentStatus: string, newStatus: string) {
    const validTransitions: Record<string, string[]> = {
      'DRAFT': ['REVIEW', 'CANCELLED'],
      'REVIEW': ['RELEASED', 'DRAFT', 'CANCELLED'],
      'RELEASED': [], // No transitions allowed from RELEASED
      'CANCELLED': ['DRAFT'], // Can be reopened
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  private formatMTCData(report: any) {
    return {
      certificateNo: report.reportNo,
      issueDate: report.createdAt,
      supplier: {
        name: report.sample.heat.supplier.name,
        code: report.sample.heat.supplier.code,
      },
      material: {
        heatNo: report.sample.heat.heatNo,
        grade: report.sample.heat.materialGrade,
        quantity: report.sample.heat.quantity,
        unit: report.sample.heat.unit,
      },
      chemicalComposition: report.sample.tests
        .filter((test: any) => test.category === 'CHEMICAL')
        .flatMap((test: any) => test.results),
      mechanicalProperties: report.sample.tests
        .filter((test: any) => test.category === 'MECHANICAL')
        .flatMap((test: any) => test.results),
      sampleDetails: {
        code: report.sample.code,
        registeredAt: report.sample.registeredAt,
        completedAt: report.sample.completedAt,
      },
    };
  }

  private generatePDFContent(report: any): string {
    // This is a simplified HTML representation
    // In production, use a PDF library like puppeteer or pdfkit
    const mtcData = this.formatMTCData(report);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mill Test Certificate - ${mtcData.certificateNo}</title>
        </head>
        <body>
          <h1>MILL TEST CERTIFICATE</h1>
          <h2>Certificate No: ${mtcData.certificateNo}</h2>
          
          <section>
            <h3>Material Information</h3>
            <p>Heat No: ${mtcData.material.heatNo}</p>
            <p>Grade: ${mtcData.material.grade}</p>
            <p>Quantity: ${mtcData.material.quantity} ${mtcData.material.unit}</p>
          </section>
          
          <section>
            <h3>Supplier Information</h3>
            <p>Name: ${mtcData.supplier.name}</p>
            <p>Code: ${mtcData.supplier.code}</p>
          </section>
          
          <section>
            <h3>Test Results</h3>
            <!-- Chemical and Mechanical test results would be formatted here -->
          </section>
          
          <footer>
            <p>Issue Date: ${new Date(mtcData.issueDate).toLocaleDateString()}</p>
            <p>This is a computer-generated certificate</p>
          </footer>
        </body>
      </html>
    `;
  }
}