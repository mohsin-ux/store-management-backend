import { IsEmail, IsString, MinLength, IsPhoneNumber } from 'class-validator';

export class CreateStoreDto {
  /**
   * Store name
   * example: My Store
   */
  @IsString()
  @MinLength(2, { message: 'Store name must be at least 2 characters' })
  name: string;

  /**
   * Store phone number
   * example: +1234567890
   */
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone: string;

  /**
   * Store address
   * example: 123 Main St, City, Country
   */
  @IsString()
  address: string;

  /**
   * Store owner name
   * example: John Doe
   */
  @IsString()
  @MinLength(2, { message: 'Owner name must be at least 2 characters' })
  ownerName: string;

  /**
   * Store owner email
   * example: owner@store.com
   */
  @IsEmail({}, { message: 'Please provide a valid email' })
  ownerEmail: string;

  /**
   * Store owner password
   * example: password123
   */
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  ownerPassword: string;
}
