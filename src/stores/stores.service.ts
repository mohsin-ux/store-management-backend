import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { RoleName } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async createStore(dto: CreateStoreDto) {
    const { name, phone, address, ownerName, ownerEmail, ownerPassword } = dto;

    // 1. Check duplicate email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: ownerEmail },
    });
    if (existingUser) {
      throw new ConflictException('Owner email already exists');
    }

    // 2. Get ADMIN role
    const adminRole = await this.prisma.role.findUnique({
      where: { name: RoleName.ADMIN },
    });
    if (!adminRole) {
      throw new InternalServerErrorException(
        'ADMIN role not seeded. Run seed script.',
      );
    }

    // 3. Create store + owner atomically
    return this.prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: { name, phone, address },
      });

      const hashedPassword = await bcrypt.hash(ownerPassword, 10);
      const owner = await tx.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          password: hashedPassword,
          roleId: adminRole.id,
          storeId: store.id,
          isSuperAdmin: false,
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

      return {
        store: {
          id: store.id,
          name: store.name,
          phone: store.phone,
          address: store.address,
        },
        owner,
      };
    });
  }

  // ==================== FIND ALL ====================
  async findAll() {
    return this.prisma.store.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true, products: true, sales: true },
        },
      },
    });
  }

  // ==================== FIND ONE ====================
  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        users: {
          where: { role: { name: RoleName.ADMIN } },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        _count: {
          select: { users: true, products: true, sales: true },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  // ==================== UPDATE ====================
  async update(id: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return this.prisma.store.update({
      where: { id },
      data: dto,
    });
  }

  // ==================== REMOVE ====================
  async remove(id: string) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    await this.prisma.store.delete({ where: { id } });

    return { message: 'Store deleted successfully' };
  }
}
