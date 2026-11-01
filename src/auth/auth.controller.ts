import {
  Controller,
  Body,
  Post,
  BadRequestException,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
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
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
  refreshToken(@Body() body: { refreshToken: string }) {
    if (!body?.refreshToken) {
      throw new BadRequestException('refreshToken is required');
    }
    return this.authService.refreshToken(body.refreshToken);
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
