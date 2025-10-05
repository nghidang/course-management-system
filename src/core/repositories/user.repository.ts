import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { User } from '../../users/schemas/user.schema';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel('User') model: Model<User>) {
    super(model);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.model.findOne({ email });
  }
}
