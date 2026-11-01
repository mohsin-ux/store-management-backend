import {
  IsString,
  IsOptional,
  IsPhoneNumber,
  MinLength,
} from 'class-validator';

export class UpdateStoreDto {
  /**
   * Store name
   * example: My Store
   */
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Store name must be at least 2 characters' })
  name?: string;

  /**
   * Store phone number
   * example: +1234567890
   */
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone?: string;

  /**
   * Store address
   * example: 123 Main St, City, Country
   */
  @IsOptional()
  @IsString()
  address?: string;
}
