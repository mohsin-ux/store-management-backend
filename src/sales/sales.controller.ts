import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request } from 'express';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // ==================== CREATE SALE ====================
  @Post()
  @Roles('ADMIN', 'SALESMAN')
  @ApiOperation({
    summary: 'Create a new sale',
    description:
      'Creates a sale with multiple items, decrements stock, and calculates totals atomically.',
  })
  @ApiResponse({ status: 201, description: 'Sale created successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  async createSale(@Body() dto: CreateSaleDto, @Req() req: Request) {
    const user = req.user as any;

    return this.salesService.createSale(
      dto,
      user.id, // From JWT
      user.storeId, // From JWT
    );
  }

  // ==================== GET ALL SALES ====================
  @Get()
  @Roles('ADMIN', 'SALESMAN', 'INVENTORY_MANAGER')
  @ApiOperation({ summary: 'Get all sales for the current store' })
  @ApiResponse({ status: 200, description: 'List of sales' })
  async findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.salesService.findAll(user.storeId);
  }

  // ==================== GET ONE SALE ====================
  @Get(':id')
  @Roles('ADMIN', 'SALESMAN', 'INVENTORY_MANAGER')
  @ApiOperation({ summary: 'Get a single sale by ID' })
  @ApiResponse({ status: 200, description: 'Sale details' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.salesService.findOne(id, user.storeId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(+id);
  }
}
