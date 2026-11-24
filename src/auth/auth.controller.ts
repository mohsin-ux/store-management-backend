import {
  Controller,
  Body,
  Post,
  Get,
  BadRequestException,
  Delete,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleName } from 'generated/prisma/enums';
import { Roles } from 'src/common/decorators/roles.decorator';

//========== controller for auth ============
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //========== api for login ============
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } =
      await this.authService.login(dto);

    // Access token cookie — 15 min
    res.cookie('accessToken', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    // Refresh token cookie — 7 days, only sent to /auth/refresh
    res.cookie('refreshToken', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { user }; // ❌ no tokens in body
  }

  //========== api for getting logged-in user info ============
  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the logged in user details' })
  @ApiResponse({
    status: 200,
    description: 'user details fetched successfully',
  })
  getUserInfo(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.getUserInfo(user.id);
  }

  //========== api for refreshing token ============
  @Post('refresh')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(RoleName.ADMIN)
  // @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'your-refresh-token-here',
        },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'refresh token seccessfully',
    schema: {
      example: {
        refreshToken: '2344234234234234234',
      },
    },
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const { access_token, refresh_token: newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    // New access token cookie
    res.cookie('accessToken', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    // New (rotated) refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Refreshed' };
  }

  // ==================== LOGOUT ====================
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.['refreshToken'];

    // Revoke in DB (best-effort — never throws)
    await this.authService.logout(refreshToken);

    // Clear both cookies (must match original paths)
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/auth/refresh' });

    return { message: 'Logged out successfully' };
  }

  //========== api for deleting user ============
  @Delete('delete')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          example: 'Enter the required user id here',
        },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'deleted user successfully',
    schema: {
      example: {
        userId: '2344234234234234234',
      },
    },
  })
  deleteUser(@Body() body: { userId: string }) {
    return this.authService.deleteUser(body.userId);
  }
}
