import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  // ==================== LOGIN USER ====================
  async login(loginUserDto: LoginDto) {
    const { email, password } = loginUserDto;

    // 1. Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found because the user is not exists', );
    }

    // 2. Check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // 3. Generate tokens
    const accessToken = await this.signAccessToken(user.id, user.email);
    const refreshToken = await this.signRefreshToken(user.id, user.email);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // ==================== LOGOUT USER ====================
  async logout(refreshToken: string) {
    const storedToken = await this.verifyRefreshToken(refreshToken);

    // Revoke old refresh token
    await this.prisma.refresh_token.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });
    return {
      message: 'Logout successful',
    };
  }

  // ==================== REFRESH TOKEN ====================
  async refreshToken(refreshToken: string) {
    const storedToken = await this.verifyRefreshToken(refreshToken);
    const accessToken = await this.signAccessToken(
      storedToken.user.id,
      storedToken.user.email,
    );
    const newRefreshToken = await this.signRefreshToken(
      storedToken.user.id,
      storedToken.user.email,
    );

    // Revoke old token
    await this.prisma.refresh_token.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });
    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  // ==================== DELETE THE USER BY USER ID ====================
  async deleteUser(userId: string) {
    const user = this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new UnauthorizedException('user not found');
    }

    this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
    return 'User is deleted now successfully';
  }

  // ==================== VALIDATE USER FOR JWT (FOR AUTH GUARD) ====================
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
      role: user.role?.name,
      storeId: user.storeId,
      isSuperAdmin: user.isSuperAdmin,
    };
  }

  // ==================== GENERATE ACCESS TOKEN ====================
  private async signAccessToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    return this.jwtService.signAsync(payload);
  }

  // ==================== GENERATE REFRESH TOKEN IN DATABASE ====================
  private async signRefreshToken(userId: string, email: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const refreshToken = await this.prisma.refresh_token.create({
      data: {
        userId: userId,
        token: randomBytes(32).toString('hex'),
        expiresAt: expiresAt,
      },
    });
    if (!refreshToken) {
      throw new UnauthorizedException('Failed to generate refresh token');
    }

    return { token: refreshToken.token };
  }

  // ==================== VERIFY REFRESH TOKEN ====================
  private async verifyRefreshToken(refreshToken: string) {
    const isTokenExist = await this.prisma.refresh_token.findFirst({
      where: {
        token: refreshToken,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });
    if (!isTokenExist) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return isTokenExist;
  }
}
