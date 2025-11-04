import { IsOptional, IsString, IsInt, IsIn, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SupplierQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by supplier code (partial match)',
    example: 'SUP'
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Filter by supplier name (partial match)',
    example: 'Steel'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by email (partial match)',
    example: 'contact@'
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter by phone (partial match)',
    example: '555'
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

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
    enum: ['code', 'name', 'email', 'phone', 'createdAt', 'updatedAt']
  })
  @IsOptional()
  @IsString()
  @IsIn(['code', 'name', 'email', 'phone', 'createdAt', 'updatedAt'])
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