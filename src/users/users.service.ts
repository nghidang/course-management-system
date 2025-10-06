import { Injectable } from '@nestjs/common';
import { UserRepository } from '../core/repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepo: UserRepository) {}

  async getUserById(id: string) {
    return this.userRepo.findById(id);
  }

  async findByEmail(email: string) {
    return this.userRepo.findByEmail(email);
  }

  async create(userData: { email: string; password: string; role: string }) {
    return this.userRepo.create(userData);
  }
}
