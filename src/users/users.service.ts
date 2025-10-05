import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRepository } from '../core/repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new BadRequestException('User exists');
    const user = await this.userRepo.create({
      ...dto,
      role: dto.role || 'Student',
    });
    return { token: this.jwtService.sign({ sub: user._id, role: user.role }) };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user || user.password !== dto.password)
      throw new BadRequestException('Invalid credentials');
    return { token: this.jwtService.sign({ sub: user._id, role: user.role }) };
  }

  async getUserById(id: string) {
    return this.userRepo.findById(id);
  }
}
