import { 
  IsString, IsUUID, IsDateString, IsNumber, IsIn,
  Length, Matches, Min, Max, IsOptional, ValidateIf
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const UNITS = ['KG', 'MT', 'LBS', 'PCS'] as const;

export class CreateHeatDto {
  @ApiProperty({ 
    example: 'HT-2024-001234',
    description: 'Unique heat number from supplier'
  })
  @IsString()
  @Length(1, 50, { message: 'Heat number must be 1-50 characters' })
  @Matches(/^[A-Za-z0-9\-\/\.]+$/, {
    message: 'Heat number can only contain letters, numbers, hyphens, slashes, and dots'
  })
  @Transform(({ value }) => value?.toUpperCase().trim())
  heatNo: string;

  @ApiProperty({ 
    example: 'cm1abc123def456',
    description: 'Supplier ID (CUID format)'
  })
  @IsString({ message: 'Supplier ID must be a string' })
  @Length(24, 30, { message: 'Invalid supplier ID format' })
  supplierId: string;

  @ApiProperty({ 
    example: 'ASTM A105',
    description: 'Material grade specification'
  })
  @IsString()
  @Length(1, 100, { message: 'Material grade must be 1-100 characters' })
  @Transform(({ value }) => value?.trim())
  materialGrade: string;

  @ApiProperty({ 
    example: '2024-01-15',
    description: 'Date material was received'
  })
  @IsDateString()
  @ValidateIf((object, value) => {
    const date = new Date(value);
    const now = new Date();
    if (date > now) {
      throw new Error('Received date cannot be in the future');
    }
    return true;
  })
  receivedOn: string;

  @ApiProperty({ 
    example: 1500.5,
    description: 'Quantity received',
    minimum: 0.001,
    maximum: 999999.999
  })
  @IsNumber({ maxDecimalPlaces: 3 }, { message: 'Maximum 3 decimal places allowed' })
  @Min(0.001, { message: 'Quantity must be greater than 0' })
  @Max(999999.999, { message: 'Quantity too large' })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ 
    enum: UNITS,
    description: 'Unit of measurement'
  })
  @IsIn(UNITS, { message: 'Invalid unit. Must be KG, MT, LBS, or PCS' })
  unit: string;

  @ApiPropertyOptional({ 
    example: 'PO-2024-1001',
    description: 'Purchase order number'
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'PO number must be 1-50 characters' })
  @Transform(({ value }) => value?.trim())
  poNumber?: string;

  @ApiPropertyOptional({ 
    example: 'GRN-2024-5678',
    description: 'Goods receipt note number'
  })
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'GRN number must be 1-50 characters' })
  @Transform(({ value }) => value?.trim())
  grnNumber?: string;
}