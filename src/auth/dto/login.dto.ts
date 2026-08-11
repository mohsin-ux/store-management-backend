import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  /**
   * User email address.
   * @example admin@store.com
   */
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  /**
   * User password (minimum 6 characters).
   * @example password123
   */
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
