import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoleName } from '../../generated/prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // In controller
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.INVENTORY_MANAGER)
  @ApiBearerAuth()
  async createProduct(@Body() dto: CreateProductDto, @Req() req: any) {
    const storeId = (req.user as any).storeId; // ← From JWT
    return this.productsService.create(dto, storeId);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.INVENTORY_MANAGER)
  @ApiBearerAuth()
  async findAll(@Req() req: any) {
    const storeId = (req.user as any).storeId; // ← From JWT
    return this.productsService.findAll(storeId);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.INVENTORY_MANAGER)
  @ApiBearerAuth()
  async findOne(@Param('id') id: string, @Req() req: any) {
    const storeId = (req.user as any).storeId; // ← From JWT
    return this.productsService.findOne(id, storeId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.INVENTORY_MANAGER)
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: any,
  ) {
    const storeId = (req.user as any).storeId; // ← From JWT
    return this.productsService.update(id, updateProductDto, storeId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.INVENTORY_MANAGER)
  @ApiBearerAuth()
  remove(@Param('id') id: string, @Req() req: any) {
    const storeId = (req.user as any).storeId; // ← From JWT
    return this.productsService.remove(id, storeId);
  }
}
