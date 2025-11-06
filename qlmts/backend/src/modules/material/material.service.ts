import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHeatDto } from './dto/create-heat.dto';
import { UpdateHeatDto } from './dto/update-heat.dto';
import { HeatQueryDto } from './dto/query-params.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MaterialService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // Heat Management
  async createHeat(createHeatDto: CreateHeatDto, userId: string) {
    // Check if heat number already exists
    const existingHeat = await this.prisma.heat.findFirst({
      where: {
        heatNo: createHeatDto.heatNo,
      },
    });

    if (existingHeat) {
      throw new ConflictException(
        `Heat number ${createHeatDto.heatNo} already exists`
      );
    }

    // Validate supplier exists and is active
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: createHeatDto.supplierId },
    });

    if (!supplier || !supplier.isActive) {
      throw new BadRequestException('Invalid or inactive supplier');
    }

    try {
      const heat = await this.prisma.heat.create({
        data: {
          ...createHeatDto,
          receivedOn: new Date(createHeatDto.receivedOn),
        },
        include: {
          supplier: {
            select: { id: true, name: true, code: true }
          },
        },
      });

      return heat;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Heat with this number already exists');
        }
      }
      throw error;
    }
  }

  async findAllHeats(query: HeatQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where: Prisma.HeatWhereInput = {};

    // Build where conditions
    if (query.heatNo) {
      where.heatNo = { contains: query.heatNo, mode: 'insensitive' };
    }
    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }
    if (query.materialGrade) {
      where.materialGrade = { contains: query.materialGrade, mode: 'insensitive' };
    }
    if (query.receivedFrom || query.receivedTo) {
      where.receivedOn = {};
      if (query.receivedFrom) {
        where.receivedOn.gte = new Date(query.receivedFrom);
      }
      if (query.receivedTo) {
        where.receivedOn.lte = new Date(query.receivedTo);
      }
    }
    if (query.poNumber) {
      where.purchaseOrder = {
        poNumber: { contains: query.poNumber, mode: 'insensitive' }
      };
    }
    if (query.grnNumber) {
      where.grnNumber = { contains: query.grnNumber, mode: 'insensitive' };
    }
    if (query.unit) {
      where.unit = query.unit;
    }

    // Build orderBy
    const orderBy: Prisma.HeatOrderByWithRelationInput = {};
    if (query.sortBy === 'supplier') {
      orderBy.supplier = { name: query.sortOrder };
    } else {
      orderBy[query.sortBy as keyof Prisma.HeatOrderByWithRelationInput] = query.sortOrder;
    }

    const [heats, total] = await Promise.all([
      this.prisma.heat.findMany({
        where,
        include: {
          supplier: {
            select: { id: true, name: true, code: true }
          },
          samples: {
            select: { id: true, code: true, state: true }
          },
        },
        orderBy,
        skip,
        take: query.limit,
      }),
      this.prisma.heat.count({ where }),
    ]);

    return {
      data: heats,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findHeatById(id: string) {
    const heat = await this.prisma.heat.findUnique({
      where: { id },
      include: {
        supplier: {
          select: { id: true, name: true, code: true, email: true, phone: true }
        },
        samples: {
          select: {
            id: true,
            code: true,
            state: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!heat) {
      throw new NotFoundException('Heat not found');
    }

    return heat;
  }

  async updateHeat(id: string, updateHeatDto: UpdateHeatDto, userId: string) {
    const existingHeat = await this.findHeatById(id);

    const updatedHeat = await this.prisma.heat.update({
      where: { id },
      data: {
        ...updateHeatDto,
        receivedOn: updateHeatDto.receivedOn ? new Date(updateHeatDto.receivedOn) : undefined,
      },
      include: {
        supplier: {
          select: { id: true, name: true, code: true }
        },
      },
    });

    return updatedHeat;
  }

  async deleteHeat(id: string, userId: string) {
    const heat = await this.findHeatById(id);

    // Check if heat has any samples
    const samplesCount = await this.prisma.sample.count({
      where: { heatId: id },
    });

    if (samplesCount > 0) {
      throw new BadRequestException(
        'Cannot delete heat with existing samples'
      );
    }

    await this.prisma.heat.delete({
      where: { id },
    });

    return { message: 'Heat deleted successfully' };
  }

  // Supplier Management
  async findAllSuppliers() {
    const suppliers = await this.prisma.supplier.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        contactPerson: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      data: suppliers,
      meta: {
        total: suppliers.length,
      },
    };
  }
}