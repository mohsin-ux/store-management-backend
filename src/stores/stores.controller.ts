import { Controller,Body, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guards';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create a new store with owner (Super Admin only)',
    description: 'Super Admin creates a store and its owner in one transaction',
  })
  @ApiResponse({
    status: 201,
    description: 'Store and owner created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Owner email already registered',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only Super Admin can create stores',
  })
  createStore(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.createStore(createStoreDto);
  }
}
