import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleName } from 'generated/prisma/enums';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('employees')
  @ApiOperation({
    summary: 'Create a new employee (Store Admin only)',
    description: 'Admin creates an employee in their own store',
  })
  create(@Body() dto: CreateEmployeeDto, @Req() req: Request) {
    const user = req.user as any;
    return this.usersService.createEmployee(dto, user.storeId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users in own store (Admin only)' })
  findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.usersService.findAll(user.storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID in own store (Admin only)' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.usersService.findOne(id, user.storeId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user in own store (Admin only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.usersService.update(id, dto, user.storeId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user in own store (Admin only)' })
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;

    if (user.id === id) {
      throw new ForbiddenException('You cannot delete yourself');
    }

    return this.usersService.remove(id, user.storeId);
  }
}
