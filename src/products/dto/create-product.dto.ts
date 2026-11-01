import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Product 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The SKU of the product',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({
    description: 'The sale price of the product',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiProperty({
    description: 'The stock quantity of the product',
    example: 100,
  })
  @IsInt()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({
    description: 'The store ID of the product',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  storeId: string;
}
