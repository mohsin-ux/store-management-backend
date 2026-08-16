import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { RoleName } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  async createStore(createStoreDto: CreateStoreDto) {
    const { name, phone, address, ownerName, ownerEmail, ownerPassword } =
      createStoreDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email: ownerEmail,
      },
    });

    if (user) {
      throw new BadRequestException('Owner email already exists');
    }

    const adminRole = await this.prisma.role.findUnique({
      where: {
        name: RoleName.ADMIN,
      },
    });

    if (!adminRole) {
      throw new BadRequestException(
        'Admin role not found. Please add the role first.',
      );
    }

    const result = this.prisma.$transaction(async (tx) => {
      // Create store
      const store = await tx.store.create({
        data: {
          name,
          phone,
          address,
        },
      });
      // Create owner user
      const hashPassword = await bcrypt.hash(ownerPassword, 10);
      const owner = await tx.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          password: hashPassword,
          roleId: adminRole.id,
          storeId: store.id,
        },
      });
      return { store, owner };
    });

    return result;
  }
}
