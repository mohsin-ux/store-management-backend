import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, storeId: string) {
    const product = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku, storeId },
    });

    if (product) {
      throw new BadRequestException('Product already exists');
    }

    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(storeId: string) {
    return this.prisma.product.findMany({
      where: { storeId },
    });
  }

  async findOne(id: string, storeId: string) {
    return this.prisma.product.findUnique({
      where: { id, storeId },
    });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    storeId: string,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id, storeId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        storeId,
      },
      
    });
  }

  async remove(id: string, storeId: string) {
    // 1. Check if the product exists (and belongs to this store)
    const product = await this.prisma.product.findFirst({
      where: { id, storeId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // 2. Delete the product
    await this.prisma.product.delete({
      where: { id },
    });

    return { message: `Product ${id} deleted successfully` };
  }
}
