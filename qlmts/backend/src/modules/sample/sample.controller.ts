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
import { SampleService } from './sample.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleQueryDto } from './dto/query-params.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sample Management')
@Controller('api/samples')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Post()
  @ApiOperation({ summary: 'Create new sample' })
  @ApiResponse({ status: 201, description: 'Sample created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createSample(@Body() createSampleDto: CreateSampleDto, @Request() req) {
    return this.sampleService.createSample(createSampleDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all samples with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Samples retrieved successfully' })
  async findAllSamples(@Query() query: SampleQueryDto) {
    return this.sampleService.findAllSamples(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sample by ID' })
  @ApiResponse({ status: 200, description: 'Sample found' })
  @ApiResponse({ status: 404, description: 'Sample not found' })
  async findSampleById(@Param('id', ParseUUIDPipe) id: string) {
    return this.sampleService.findSampleById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sample' })
  @ApiResponse({ status: 200, description: 'Sample updated successfully' })
  @ApiResponse({ status: 404, description: 'Sample not found' })
  async updateSample(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSampleDto: UpdateSampleDto,
    @Request() req,
  ) {
    return this.sampleService.updateSample(id, updateSampleDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sample' })
  @ApiResponse({ status: 200, description: 'Sample deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete sample with existing tests' })
  @ApiResponse({ status: 404, description: 'Sample not found' })
  async deleteSample(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.sampleService.deleteSample(id, req.user.id);
  }

  @Post(':id/register')
  @ApiOperation({ summary: 'Register pending sample' })
  @ApiResponse({ status: 200, description: 'Sample registered successfully' })
  @ApiResponse({ status: 400, description: 'Only pending samples can be registered' })
  @ApiResponse({ status: 404, description: 'Sample not found' })
  async registerSample(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.sampleService.registerSample(id, req.user.id);
  }
}