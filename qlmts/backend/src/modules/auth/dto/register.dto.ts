import { IsEmail, IsString, MinLength, MaxLength, Matches, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const USER_ROLES = ['ADMIN', 'QC_MANAGER', 'LAB_TECH', 'QUALITY_ENGINEER'] as const;
type UserRole = typeof USER_ROLES[number];

export class RegisterDto {
  @ApiProperty({ 
    example: 'john.doe@qlmts.com',
    description: 'User email address'
  })
  @IsEmail({}, { message: 'Valid email required' })
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @ApiProperty({ 
    example: 'SecurePass@123',
    description: 'User password (min 8 chars, must contain uppercase, lowercase, number and special char)'
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(50, { message: 'Password too long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain uppercase, lowercase, number and special character' }
  )
  password: string;

  @ApiProperty({ 
    example: 'John Doe',
    description: 'User full name'
  })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name too long' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ 
    enum: USER_ROLES,
    example: 'LAB_TECH',
    description: 'User role'
  })
  @IsIn(USER_ROLES, { message: 'Invalid user role' })
  role: string;
}