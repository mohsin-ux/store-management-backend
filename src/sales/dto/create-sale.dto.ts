import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class SaleItemDto {
  /**
   * Product ID being sold
   * example: clx123abc456def
   */
  @IsString()
  @IsNotEmpty()
  productId: string;

  /**
   * Quantity being sold
   * example: 2
   */
  @IsInt()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

export class CreateSaleDto {
  /**
   * List of items in the sale (at least one)
   * example: [{ "productId": "clx123", "quantity": 2 }]
   */
  @IsArray()
  @ArrayMinSize(1, { message: 'Sale must have at least one item' })
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
