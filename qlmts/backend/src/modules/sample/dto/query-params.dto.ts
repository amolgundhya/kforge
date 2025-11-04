import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, IsIn, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SampleQueryDto {
  @ApiPropertyOptional({ 
    example: 1,
    description: 'Page number',
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ 
    example: 10,
    description: 'Items per page',
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ 
    example: 'S-2024-000001',
    description: 'Filter by sample code'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  code?: string;

  @ApiPropertyOptional({ 
    example: 'HEAT',
    description: 'Filter by source type'
  })
  @IsOptional()
  @IsIn(['HEAT', 'PRODUCT', 'BATCH'])
  sourceType?: string;

  @ApiPropertyOptional({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filter by source ID'
  })
  @IsOptional()
  @IsUUID('4')
  sourceId?: string;

  @ApiPropertyOptional({ 
    example: 'NORMAL',
    description: 'Filter by priority'
  })
  @IsOptional()
  @IsIn(['HIGH', 'NORMAL', 'LOW'])
  priority?: string;

  @ApiPropertyOptional({ 
    example: 'REGISTERED',
    description: 'Filter by sample state'
  })
  @IsOptional()
  @IsIn(['PENDING', 'REGISTERED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'])
  state?: string;

  @ApiPropertyOptional({ 
    example: 'lab.tech@qlmts.com',
    description: 'Filter by requester'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  requestedBy?: string;

  @ApiPropertyOptional({ 
    example: 'createdAt',
    description: 'Sort field'
  })
  @IsOptional()
  @IsIn(['createdAt', 'code', 'priority', 'state', 'requestedBy'])
  sortBy: string = 'createdAt';

  @ApiPropertyOptional({ 
    example: 'desc',
    description: 'Sort order'
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}