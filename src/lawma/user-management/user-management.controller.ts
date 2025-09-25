import { Controller, Get, Param, Put, Query, Req } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './user-management.service';
import { UserRole } from '@models/types';
import { AdminAuth } from '@common/decorators/auth.decorator';
import { GetUserDto } from './dto/dto';

@ApiTags('Admin/User-Managemnt')
@Controller({
  path: 'admin/users',
  version: '1',
})
@AdminAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @ApiQuery({ name: 'page', required: false, type: String })
  // @ApiQuery({ name: 'limit', required: false, type: String })
  getUsers(@Query() filter:GetUserDto) {
    return this.usersService.getAllUsers(filter);
  }

  @Get(':id')
  @ApiQuery({ name: 'role', type: String, required: true })
  getUserDetails(@Param('id') userId: string, @Query('role') role: UserRole) {
    return this.usersService.getUserById(userId, role);
  }

  @Get('facility/:id')
  getFacilityUsers(
    @Param('id') accountId: string,
    @Query() filter: GetUserDto,
  ) {
    return this.usersService.getFacilityUsers({accountId}, filter);
  }

  @Get('agent/:id')
  getAgentUsers(
    @Param('id') agentId: string,
    @Query() filter:GetUserDto
  ) {
    return this.usersService.getAgentRegisteredUsers({agentId}, filter);
  }
}
