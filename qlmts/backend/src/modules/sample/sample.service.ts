import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleQueryDto } from './dto/query-params.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SampleService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createSample(createSampleDto: CreateSampleDto, userId: string) {
    // Validate source exists based on type
    if (createSampleDto.sourceType === 'HEAT') {
      const heat = await this.prisma.heat.findUnique({
        where: { id: createSampleDto.sourceId },
      });
      if (!heat) {
        throw new BadRequestException('Invalid heat ID provided');
      }
    }

    // Generate sample code
    const lastSample = await this.prisma.sample.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let sampleNumber = 1;
    if (lastSample && lastSample.code) {
      const match = lastSample.code.match(/S-\d{4}-(\d{6})$/);
      if (match) {
        sampleNumber = parseInt(match[1]) + 1;
      }
    }

    const year = new Date().getFullYear();
    const code = `S-${year}-${sampleNumber.toString().padStart(6, '0')}`;

    try {
      const sample = await this.prisma.sample.create({
        data: {
          code,
          ...createSampleDto,
          state: 'PENDING',
        },
        include: {
          tests: {
            include: {
              results: true,
            },
          },
        },
      });

      return sample;
    } catch (error) {
      throw error;
    }
  }

  async findAllSamples(query: SampleQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where: Prisma.SampleWhereInput = {};

    // Build where conditions
    if (query.code) {
      where.code = { contains: query.code, mode: 'insensitive' };
    }
    if (query.sourceType) {
      where.sourceType = query.sourceType;
    }
    if (query.sourceId) {
      where.sourceId = query.sourceId;
    }
    if (query.priority) {
      where.priority = query.priority;
    }
    if (query.state) {
      where.state = query.state;
    }
    if (query.requestedBy) {
      where.requestedBy = { contains: query.requestedBy, mode: 'insensitive' };
    }

    // Build orderBy
    const orderBy: Prisma.SampleOrderByWithRelationInput = {};
    orderBy[query.sortBy as keyof Prisma.SampleOrderByWithRelationInput] = query.sortOrder;

    const [samples, total] = await Promise.all([
      this.prisma.sample.findMany({
        where,
        include: {
          tests: {
            include: {
              results: true,
            },
          },
        },
        orderBy,
        skip,
        take: query.limit,
      }),
      this.prisma.sample.count({ where }),
    ]);

    // For HEAT source type, fetch heat information
    const enrichedSamples = await Promise.all(
      samples.map(async (sample) => {
        if (sample.sourceType === 'HEAT') {
          const heat = await this.prisma.heat.findUnique({
            where: { id: sample.sourceId },
            select: {
              heatNo: true,
              materialGrade: true,
            },
          });
          return {
            ...sample,
            heat,
          };
        }
        return sample;
      })
    );

    return {
      data: enrichedSamples,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findSampleById(id: string) {
    const sample = await this.prisma.sample.findUnique({
      where: { id },
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

    // Fetch source information if HEAT
    let enrichedSample = sample;
    if (sample.sourceType === 'HEAT') {
      const heat = await this.prisma.heat.findUnique({
        where: { id: sample.sourceId },
        select: {
          heatNo: true,
          materialGrade: true,
          supplier: {
            select: { name: true, code: true }
          }
        },
      });
      enrichedSample = {
        ...sample,
        heat,
      } as any;
    }

    return enrichedSample;
  }

  async updateSample(id: string, updateSampleDto: UpdateSampleDto, userId: string) {
    const existingSample = await this.findSampleById(id);

    const updatedSample = await this.prisma.sample.update({
      where: { id },
      data: updateSampleDto,
      include: {
        tests: {
          include: {
            results: true,
          },
        },
      },
    });

    return updatedSample;
  }

  async deleteSample(id: string, userId: string) {
    const sample = await this.findSampleById(id);

    // Check if sample has any tests
    const testsCount = await this.prisma.test.count({
      where: { sampleId: id },
    });

    if (testsCount > 0) {
      throw new BadRequestException(
        'Cannot delete sample with existing tests'
      );
    }

    await this.prisma.sample.delete({
      where: { id },
    });

    return { message: 'Sample deleted successfully' };
  }

  async registerSample(id: string, userId: string) {
    const sample = await this.findSampleById(id);

    if (sample.state !== 'PENDING') {
      throw new BadRequestException('Only pending samples can be registered');
    }

    const updatedSample = await this.prisma.sample.update({
      where: { id },
      data: {
        state: 'REGISTERED',
        registeredAt: new Date(),
      },
      include: {
        tests: {
          include: {
            results: true,
          },
        },
      },
    });

    return updatedSample;
  }
}