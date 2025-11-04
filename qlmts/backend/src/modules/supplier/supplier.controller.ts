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
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierQueryDto } from './dto/query-params.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({
    status: 201,
    description: 'Supplier created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  async createSupplier(
    @Body() createSupplierDto: CreateSupplierDto,
    @Request() req: any,
  ) {
    return this.supplierService.createSupplier(createSupplierDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all suppliers with optional filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of suppliers retrieved successfully',
  })
  async findAllSuppliers(@Query() query: SupplierQueryDto) {
    return this.supplierService.findAllSuppliers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific supplier by ID' })
  @ApiResponse({
    status: 200,
    description: 'Supplier retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Supplier not found',
  })
  async findSupplierById(@Param('id') id: string) {
    return this.supplierService.findSupplierById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiResponse({
    status: 200,
    description: 'Supplier updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Supplier not found',
  })
  async updateSupplier(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @Request() req: any,
  ) {
    return this.supplierService.updateSupplier(id, updateSupplierDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiResponse({
    status: 200,
    description: 'Supplier deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Supplier not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete supplier with existing heat records',
  })
  async deleteSupplier(@Param('id') id: string, @Request() req: any) {
    return this.supplierService.deleteSupplier(id, req.user.id);
  }
}