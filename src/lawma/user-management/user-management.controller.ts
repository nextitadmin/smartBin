import { Controller, Get, Param, Put, Query, Req } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './user-management.service';
import { UserRole } from '@models/types';

@ApiTags('Admin/User-Managemnt')
@Controller('user-management')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  getUsers(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.usersService.getAllUsers(page, limit);
  }

  @Get(':id')
  @ApiQuery({ name: 'role', type: String, required: true })
  getUserDetails(@Param('id') userId: string, @Query('role') role: UserRole) {
    return this.usersService.getUserDetails(userId, role);
  }

  @Get('facility/:id')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getFacilityUsers(
    @Param('id') accountId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.usersService.getFacilityUsers(accountId, page, limit);
  }

  @Get('agent/:id')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getAgentUsers(
    @Param('id') agentId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.usersService.getAgentUsers(agentId, page, limit);
  }
}
