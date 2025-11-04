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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MaterialService } from './material.service';
import { CreateHeatDto } from './dto/create-heat.dto';
import { UpdateHeatDto } from './dto/update-heat.dto';
import { HeatQueryDto } from './dto/query-params.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Materials & Traceability')
@Controller('api/materials')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  // Heat Management Endpoints
  @Post('heats')
  @ApiOperation({ summary: 'Create new heat record' })
  @ApiResponse({ status: 201, description: 'Heat created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Heat number already exists' })
  async createHeat(@Body() createHeatDto: CreateHeatDto, @Request() req) {
    return this.materialService.createHeat(createHeatDto, req.user.id);
  }

  @Get('heats')
  @ApiOperation({ summary: 'Get all heat records with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Heat records retrieved successfully' })
  async findAllHeats(@Query() query: HeatQueryDto) {
    return this.materialService.findAllHeats(query);
  }

  @Get('heats/:id')
  @ApiOperation({ summary: 'Get heat record by ID' })
  @ApiResponse({ status: 200, description: 'Heat record found' })
  @ApiResponse({ status: 404, description: 'Heat record not found' })
  async findHeatById(@Param('id', ParseUUIDPipe) id: string) {
    return this.materialService.findHeatById(id);
  }

  @Patch('heats/:id')
  @ApiOperation({ summary: 'Update heat record' })
  @ApiResponse({ status: 200, description: 'Heat record updated successfully' })
  @ApiResponse({ status: 404, description: 'Heat record not found' })
  async updateHeat(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHeatDto: UpdateHeatDto,
    @Request() req,
  ) {
    return this.materialService.updateHeat(id, updateHeatDto, req.user.id);
  }

  @Delete('heats/:id')
  @ApiOperation({ summary: 'Delete heat record' })
  @ApiResponse({ status: 200, description: 'Heat record deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete heat with existing samples' })
  @ApiResponse({ status: 404, description: 'Heat record not found' })
  async deleteHeat(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.materialService.deleteHeat(id, req.user.id);
  }

  // Supplier Management Endpoints
  @Get('suppliers')
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  async findAllSuppliers() {
    return this.materialService.findAllSuppliers();
  }
}