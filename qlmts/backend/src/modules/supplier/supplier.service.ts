import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierQueryDto } from './dto/query-params.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SupplierService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createSupplier(createSupplierDto: CreateSupplierDto, userId: string) {
    // Check if supplier code already exists
    const existingSupplier = await this.prisma.supplier.findUnique({
      where: { code: createSupplierDto.code },
    });

    if (existingSupplier) {
      throw new BadRequestException('Supplier code already exists');
    }

    try {
      const supplier = await this.prisma.supplier.create({
        data: createSupplierDto,
        include: {
          _count: {
            select: {
              heats: true,
            },
          },
        },
      });

      return supplier;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Supplier code already exists');
      }
      throw error;
    }
  }

  async findAllSuppliers(query: SupplierQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where: Prisma.SupplierWhereInput = {};

    // Build where conditions
    if (query.code) {
      where.code = { contains: query.code, mode: 'insensitive' };
    }
    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    if (query.email) {
      where.email = { contains: query.email, mode: 'insensitive' };
    }
    if (query.phone) {
      where.phone = { contains: query.phone, mode: 'insensitive' };
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    // Build orderBy
    const orderBy: Prisma.SupplierOrderByWithRelationInput = {};
    orderBy[query.sortBy as keyof Prisma.SupplierOrderByWithRelationInput] = query.sortOrder;

    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        include: {
          _count: {
            select: {
              heats: true,
            },
          },
        },
        orderBy,
        skip,
        take: query.limit,
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data: suppliers,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findSupplierById(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        heats: {
          select: {
            id: true,
            heatNo: true,
            materialGrade: true,
            receivedOn: true,
            quantity: true,
            unit: true,
          },
          orderBy: {
            receivedOn: 'desc',
          },
        },
        _count: {
          select: {
            heats: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async updateSupplier(id: string, updateSupplierDto: UpdateSupplierDto, userId: string) {
    const existingSupplier = await this.findSupplierById(id);

    // Check if new code conflicts with another supplier
    if (updateSupplierDto.code && updateSupplierDto.code !== existingSupplier.code) {
      const conflictingSupplier = await this.prisma.supplier.findUnique({
        where: { code: updateSupplierDto.code },
      });

      if (conflictingSupplier) {
        throw new BadRequestException('Supplier code already exists');
      }
    }

    const updatedSupplier = await this.prisma.supplier.update({
      where: { id },
      data: updateSupplierDto,
      include: {
        _count: {
          select: {
            heats: true,
          },
        },
      },
    });

    return updatedSupplier;
  }

  async deleteSupplier(id: string, userId: string) {
    const supplier = await this.findSupplierById(id);

    // Check if supplier has any heat records
    const heatsCount = await this.prisma.heat.count({
      where: { supplierId: id },
    });

    if (heatsCount > 0) {
      throw new BadRequestException(
        'Cannot delete supplier with existing heat records'
      );
    }

    await this.prisma.supplier.delete({
      where: { id },
    });

    return { message: 'Supplier deleted successfully' };
  }
}