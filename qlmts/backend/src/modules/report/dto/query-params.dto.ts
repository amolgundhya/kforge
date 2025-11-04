import { IsOptional, IsString, IsInt, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReportQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by report number (partial match)',
    example: 'MTC-2024'
  })
  @IsOptional()
  @IsString()
  reportNo?: string;

  @ApiPropertyOptional({
    description: 'Filter by sample ID',
    example: 'cm1abc123def456'
  })
  @IsOptional()
  @IsString()
  sampleId?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['DRAFT', 'REVIEW', 'RELEASED', 'CANCELLED']
  })
  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'REVIEW', 'RELEASED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by date from (ISO 8601)',
    example: '2024-01-01'
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by date to (ISO 8601)',
    example: '2024-12-31'
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    default: 'createdAt',
    enum: ['reportNo', 'createdAt', 'releasedAt', 'status']
  })
  @IsOptional()
  @IsString()
  @IsIn(['reportNo', 'createdAt', 'releasedAt', 'status'])
  sortBy: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    default: 'desc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}