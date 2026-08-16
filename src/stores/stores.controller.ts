import { Controller, Body, Post, Req, ForbiddenException } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { RoleName } from 'generated/prisma/enums';
import { Request } from 'express';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new store with owner (Super Admin only)',
    description: 'Super Admin creates a store and its owner in one transaction',
  })
  @ApiResponse({
    status: 201,
    description: 'Store and owner created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT required',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid request body',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only Super Admin can create stores',
  })
  createStore(@Body() createStoreDto: CreateStoreDto, @Req() req: Request) {
    // Check if user is super admin
    if(!req.user?.isSuperAdmin) {
      throw new ForbiddenException('Only super admin can create stores');
    }
  
    // Check if user is super admin
    if (req.user.role !== RoleName.ADMIN) {
      throw new ForbiddenException('Only super admin can create stores');
    }

    return this.storesService.createStore(createStoreDto);
  }
}
