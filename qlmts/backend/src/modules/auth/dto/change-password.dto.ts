import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ 
    example: 'currentPassword123',
    description: 'Current password'
  })
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @ApiProperty({ 
    example: 'NewSecurePass@123',
    description: 'New password (min 8 chars, must contain uppercase, lowercase, number and special char)'
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(50, { message: 'Password too long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain uppercase, lowercase, number and special character' }
  )
  newPassword: string;
}