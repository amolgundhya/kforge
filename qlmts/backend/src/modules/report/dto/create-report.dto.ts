import { IsString, IsOptional, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ 
    example: 'cm1abc123def456',
    description: 'Sample ID (CUID format) for which the report is being generated'
  })
  @IsString({ message: 'Sample ID must be a string' })
  @Length(24, 30, { message: 'Invalid sample ID format' })
  sampleId: string;

  @ApiProperty({ 
    example: 'Additional notes about the report',
    description: 'Optional notes or comments',
    required: false
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  notes?: string;
}