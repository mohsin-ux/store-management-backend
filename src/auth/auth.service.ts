import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(  
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  // ==================== LOGIN USER ====================
  async login(loginUserDto: LoginDto) {
    const { email, password } = loginUserDto;

    // Check if user exists
    const isUserExist = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
    if (!isUserExist) {
      throw new UnauthorizedException('User not found');
    }

    // Check if password is valid
    const isPasswordValid = await bcrypt.compare(
      password,
      isUserExist.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Generate JWT token

    const payload = {
      sub: isUserExist.id,
      email: isUserExist.email,
      name: isUserExist.name,
      role: isUserExist.role?.name,
      storeId: isUserExist.storeId,
      isOwner: isUserExist.isOwner,
      isSuperAdmin: isUserExist.isSuperAdmin,
    };
    const token = await this.jwtService.signAsync(payload);

    const { sub, ...userData } = payload;

    return {
      access_token: token,
      user: {
        id: isUserExist.id,
        ...userData,
      },
    };
  }

  // ==================== VALIDATE USER FOR JWT ====================
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      storeId: user.storeId,
      isOwner: user.isOwner,
      isSuperAdmin: user.isSuperAdmin,
    };
  }
}
