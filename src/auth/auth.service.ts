import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('User exists');
    const user = await this.usersService.create(dto);
    return { token: this.jwtService.sign({ sub: user._id, role: user.role }) };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || user.password !== dto.password)
      throw new BadRequestException('Invalid credentials');
    return { token: this.jwtService.sign({ sub: user._id, role: user.role }) };
  }
}
