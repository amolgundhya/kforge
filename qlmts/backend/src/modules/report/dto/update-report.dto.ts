import { PartialType } from '@nestjs/swagger';
import { CreateReportDto } from './create-report.dto';
import { IsOptional, IsIn, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @ApiPropertyOptional({
    description: 'Report status',
    enum: ['DRAFT', 'REVIEW', 'RELEASED', 'CANCELLED'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'REVIEW', 'RELEASED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({
    description: 'File URL for the generated PDF',
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}