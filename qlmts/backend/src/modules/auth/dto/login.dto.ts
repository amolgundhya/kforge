import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({ 
    example: 'admin@qlmts.com',
    description: 'User email address'
  })
  @IsEmail({}, { message: 'Valid email required' })
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @ApiProperty({ 
    example: 'Admin@123',
    description: 'User password'
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(50, { message: 'Password too long' })
  password: string;
}