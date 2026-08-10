import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, name, password } = registerUserDto;

    const isUserExist = await this.prisma.user.findUnique({
      where: { email },
    });

    if (isUserExist) {
      throw new ConflictException('User already exists');
    }

    return this.jwtService.signAsync({
      sub: registerUserDto.email,
      name: registerUserDto.name,
    });
  }
}
