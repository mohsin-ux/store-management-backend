import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClient, RoleName } from '../../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(createEmployeeDto: CreateEmployeeDto, storeId) {
    const { name, email, password, roleName } = createEmployeeDto;

    // 1. Validate role
    const isRoleNameValid = Object.values(RoleName).find(
      (value) => value === roleName,
    );
    if (!isRoleNameValid) {
      throw new BadRequestException('Role name is not valid string.');
    }

    // 2. Prevent creating another ADMIN (only owner should be ADMIN)
    if (roleName === RoleName.ADMIN) {
      throw new ForbiddenException('Cannot create another ADMIN');
    }

    // 3. Check email uniqueness
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    // creating the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isSuperAdmin: false,
        storeId,
        role: {
          connect: {
            name: roleName as RoleName,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        storeId: true,
        isSuperAdmin: true,
        role: { select: { name: true } },
        createdAt: true,
      },
    });
    return employee;
  }

  // ==================== FIND ALL ====================
  findAll(storeId: string) {
    return this.prisma.user.findMany({
      where: { storeId },
      select: {
        id: true,
        name: true,
        email: true,
        role: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== FIND ONE ====================
  async findOne(id: string, storeId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, storeId }, // ✅ findFirst, both fields
      select: {
        id: true,
        name: true,
        email: true,
        role: { select: { name: true } },
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ==================== UPDATE ====================
  async update(id: string, dto: UpdateUserDto, storeId: string) {
    // 1. Verify user exists in this store
    const user = await this.prisma.user.findFirst({
      where: { id, storeId },
    });
    if (!user) throw new NotFoundException('User not found');

    // 2. Prevent modifying owner / super admin
    if (user.isSuperAdmin) {
      throw new ForbiddenException('Cannot modify owner or super admin');
    }

    // 3. Prevent assigning ADMIN role
    if (dto.roleName === RoleName.ADMIN) {
      throw new ForbiddenException('Cannot assign ADMIN role');
    }

    // 4. Build safe update data
    const data: any = {};
    data.name = dto?.name;
    data.email = dto?.email;
    data.phone = dto?.phone;
    if (dto.roleName !== undefined) {
      data.role = { connect: { name: dto.roleName } }; // ✅ connect by name
    }

    // 5. Update
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: { select: { name: true } },
        updatedAt: true,
      },
    });
  }

  // ==================== REMOVE ====================
  async remove(id: string, storeId: string) {
    // 1. Verify user exists in this store
    const user = await this.prisma.user.findFirst({
      where: { id, storeId },
    });
    if (!user) throw new NotFoundException('User not found');

    // 2. Prevent deleting owner / super admin
    if (user.isSuperAdmin) {
      throw new ForbiddenException('Cannot delete owner or super admin');
    }

    // 3. Prevent deleting yourself
    // (handled in controller by comparing id with req.user.id)

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
