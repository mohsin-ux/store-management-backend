import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== SUMMARY ====================
  async getSummary(storeId: string) {
    // 1. Count products + aggregate stock value
    const products = await this.prisma.product.findMany({
      where: { storeId },
      select: { salePrice: true, stockQuantity: true },
    });

    const totalProducts = products.length;
    const totalStockValue = products.reduce(
      (sum, p) => sum + Number(p.salePrice) * p.stockQuantity,
      0,
    );

    // 2. Aggregate sales
    const salesAgg = await this.prisma.sale.aggregate({
      where: { storeId },
      _count: { id: true },
      _sum: { totalAmount: true, totalQuantity: true },
    });

    // 3. Count users
    const totalUsers = await this.prisma.user.count({
      where: { storeId },
    });

    return {
      totalProducts,
      totalStockValue: Number(totalStockValue.toFixed(2)),
      totalSales: salesAgg._count.id,
      totalRevenue: Number(salesAgg._sum.totalAmount ?? 0),
      totalItemsSold: salesAgg._sum.totalQuantity ?? 0,
      totalUsers,
    };
  }

  // ==================== SALES TODAY ====================
  async getSalesToday(storeId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const agg = await this.prisma.sale.aggregate({
      where: {
        storeId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      _count: { id: true },
      _sum: { totalAmount: true, totalQuantity: true },
    });

    return {
      count: agg._count.id,
      revenue: Number(agg._sum.totalAmount ?? 0),
      itemsSold: agg._sum.totalQuantity ?? 0,
    };
  }

  // ==================== LOW STOCK ====================
  async getLowStock(storeId: string, threshold: number) {
    return this.prisma.product.findMany({
      where: {
        storeId,
        stockQuantity: { lte: threshold },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        salePrice: true,
      },
      orderBy: { stockQuantity: 'asc' },
    });
  }

  // ==================== TOP PRODUCTS ====================
  async getTopProducts(storeId: string, limit: number) {
    // Group saleItem by product, sum quantity + subtotal, filter by store
    const grouped = await this.prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: { storeId },
      },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    if (grouped.length === 0) return [];

    // Fetch product details for the top products
    const productIds = grouped.map((g) => g.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return grouped.map((g) => {
      const product = productMap.get(g.productId);
      return {
        productId: g.productId,
        name: product?.name ?? null,
        sku: product?.sku ?? null,
        quantitySold: g._sum.quantity ?? 0,
        revenue: Number(g._sum.subtotal ?? 0),
      };
    });
  }
}
