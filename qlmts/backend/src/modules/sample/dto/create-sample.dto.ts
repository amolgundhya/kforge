import { 
  IsString, IsIn, IsOptional, 
  Length, IsEnum
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SourceType {
  HEAT = 'HEAT',
  PRODUCT = 'PRODUCT',
  BATCH = 'BATCH'
}

export enum Priority {
  HIGH = 'HIGH',
  NORMAL = 'NORMAL', 
  LOW = 'LOW'
}

export class CreateSampleDto {
  @ApiProperty({ 
    enum: SourceType,
    description: 'Type of source material'
  })
  @IsEnum(SourceType)
  sourceType: SourceType;

  @ApiProperty({ 
    example: 'cm1abc123def456',
    description: 'Source material ID (heat, product, or batch ID) - CUID format'
  })
  @IsString({ message: 'Source ID must be a string' })
  @Length(24, 30, { message: 'Invalid source ID format' })
  sourceId: string;

  @ApiProperty({ 
    enum: Priority,
    description: 'Sample priority level'
  })
  @IsEnum(Priority)
  priority: Priority;

  @ApiProperty({ 
    example: 'lab.tech@qlmts.com',
    description: 'Email of person requesting the sample'
  })
  @IsString()
  @Length(1, 100, { message: 'Requested by must be 1-100 characters' })
  @Transform(({ value }) => value?.trim())
  requestedBy: string;

  @ApiPropertyOptional({ 
    example: 'Standard quality verification for production release',
    description: 'Additional notes about the sample'
  })
  @IsOptional()
  @IsString()
  @Length(1, 500, { message: 'Notes must be 1-500 characters' })
  @Transform(({ value }) => value?.trim())
  notes?: string;
}