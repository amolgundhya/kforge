import { IsOptional, IsString, IsUUID, IsDateString, IsIn, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

const UNITS = ['KG', 'MT', 'LBS', 'PCS'] as const;

export class HeatQueryDto {
  @ApiPropertyOptional({ description: 'Search by heat number' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  heatNo?: string;

  @ApiPropertyOptional({ description: 'Filter by supplier ID' })
  @IsOptional()
  @IsUUID('4')
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Filter by material grade' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  materialGrade?: string;

  @ApiPropertyOptional({ description: 'Filter by received date from (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  receivedFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by received date to (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  receivedTo?: string;

  @ApiPropertyOptional({ description: 'Filter by PO number' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  poNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by GRN number' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  grnNumber?: string;

  @ApiPropertyOptional({ enum: UNITS, description: 'Filter by unit' })
  @IsOptional()
  @IsIn(UNITS)
  unit?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ 
    description: 'Sort by field', 
    enum: ['heatNo', 'receivedOn', 'materialGrade', 'createdAt'],
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    description: 'Sort order', 
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class BatchQueryDto {
  @ApiPropertyOptional({ description: 'Search by batch number' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  batchNo?: string;

  @ApiPropertyOptional({ description: 'Filter by heat ID' })
  @IsOptional()
  @IsUUID('4')
  heatId?: string;

  @ApiPropertyOptional({ description: 'Filter by location' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  location?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ 
    description: 'Sort by field', 
    enum: ['batchNo', 'quantity', 'createdAt'],
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    description: 'Sort order', 
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}