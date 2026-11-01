import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== CREATE SALE (TRANSACTION) ====================
  async createSale(dto: CreateSaleDto, userId: string, storeId: string) {
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      let totalQuantity = 0;
      const saleItems: {
        productId: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }[] = [];

      // 1. Process each item
      for (const item of dto.items) {
        // 1a. Find product (id + storeId for multi-tenant safety)
        const product = await tx.product.findFirst({
          where: {
            id: item.productId,
            storeId,
          },
        });

        if (!product) {
          throw new NotFoundException(
            `Product ${item.productId} not found in your store`,
          );
        }

        // 1b. Check stock
        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
          );
        }

        // 1c. Decrement stock
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        // 1d. Calculate subtotal (snapshot price at sale time)
        const unitPrice = Number(product.salePrice);
        const subtotal = unitPrice * item.quantity;

        totalAmount += subtotal;
        totalQuantity += item.quantity;

        saleItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        });
      }

      // 2. Create sale with nested items
      const sale = await tx.sale.create({
        data: {
          storeId,
          userId,
          totalAmount,
          totalQuantity,
          items: {
            create: saleItems,
          },
        },
        include: {
          items: true,
        },
      });

      return sale;
    });
  }
  // ==================== GET ALL SALES ====================
  async findAll(storeId: string) {
    return this.prisma.sale.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // ==================== GET ONE SALE ====================
  async findOne(id: string, storeId: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, storeId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  update(id: number, updateSaleDto: UpdateSaleDto) {
    return `This action updates a #${id} sale`;
  }

  remove(id: number) {
    return `This action removes a #${id} sale`;
  }
}
