import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('me')
  async getMe(@Request() req: { user: { sub: string } }) {
    return this.usersService.getUserById(req.user.sub);
  }
}
