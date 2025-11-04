import { 
  IsString, IsEmail, IsOptional, Length, Matches, IsBoolean
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ 
    example: 'SUP-001',
    description: 'Unique supplier code'
  })
  @IsString()
  @Length(1, 20, { message: 'Supplier code must be 1-20 characters' })
  @Matches(/^[A-Za-z0-9\-]+$/, {
    message: 'Supplier code can only contain letters, numbers, and hyphens'
  })
  @Transform(({ value }) => value?.toUpperCase().trim())
  code: string;

  @ApiProperty({ 
    example: 'ABC Steel Corporation',
    description: 'Supplier company name'
  })
  @IsString()
  @Length(1, 100, { message: 'Company name must be 1-100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({ 
    example: 'John Smith',
    description: 'Primary contact person'
  })
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Contact person must be 1-100 characters' })
  @Transform(({ value }) => value?.trim())
  contactPerson?: string;

  @ApiPropertyOptional({ 
    example: 'contact@abcsteel.com',
    description: 'Primary email address'
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiPropertyOptional({ 
    example: '+1-555-123-4567',
    description: 'Primary phone number'
  })
  @IsOptional()
  @IsString()
  @Length(1, 20, { message: 'Phone number must be 1-20 characters' })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @ApiPropertyOptional({ 
    example: '123 Industrial Ave, Steel City, ST 12345',
    description: 'Company address'
  })
  @IsOptional()
  @IsString()
  @Length(1, 500, { message: 'Address must be 1-500 characters' })
  @Transform(({ value }) => value?.trim())
  address?: string;

  @ApiPropertyOptional({ 
    example: true,
    description: 'Whether supplier is active',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}