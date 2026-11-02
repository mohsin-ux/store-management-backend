import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'generated/prisma/enums';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(AuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // ==================== SUMMARY ====================
  @Get('summary')
  @Roles(RoleName.ADMIN, RoleName.INVENTORY_MANAGER)
  @ApiOperation({ summary: 'Store KPI summary' })
  @ApiResponse({ status: 200, description: 'Summary metrics' })
  getSummary(@Req() req: Request) {
    const user = req.user as any;
    return this.dashboardService.getSummary(user.storeId);
  }

  // ==================== SALES TODAY ====================
  @Get('sales-today')
  @Roles(RoleName.ADMIN, RoleName.SALESMAN)
  @ApiOperation({ summary: "Today's sales metrics" })
  @ApiResponse({ status: 200, description: 'Sales today metrics' })
  getSalesToday(@Req() req: Request) {
    const user = req.user as any;
    return this.dashboardService.getSalesToday(user.storeId);
  }

  // ==================== LOW STOCK ====================
  @Get('low-stock')
  @Roles(RoleName.ADMIN, RoleName.INVENTORY_MANAGER)
  @ApiOperation({ summary: 'Products with low stock' })
  @ApiQuery({ name: 'threshold', required: false, example: 5 })
  @ApiResponse({ status: 200, description: 'Low stock products' })
  getLowStock(@Req() req: Request, @Query('threshold') threshold?: string) {
    const user = req.user as any;
    const thresholdNum = threshold ? parseInt(threshold, 10) : 5;
    return this.dashboardService.getLowStock(user.storeId, thresholdNum);
  }

  // ==================== TOP PRODUCTS ====================
  @Get('top-products')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Top-selling products' })
  @ApiQuery({ name: 'limit', required: false, example: 5 })
  @ApiResponse({ status: 200, description: 'Top products' })
  getTopProducts(@Req() req: Request, @Query('limit') limit?: string) {
    const user = req.user as any;
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getTopProducts(user.storeId, limitNum);
  }
}
