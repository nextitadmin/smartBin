// import { Body, Controller, Get, Post } from '@nestjs/common';
// import { RbacService } from './rbac.service';
// import { SuccessResponse } from '@common/http';
// import { AddRoleDto } from './dto/rbac.dto';

// @Controller({
//   path: 'rbacs',
//   version: '1',
// })
// export class RbacController {
//   constructor(private readonly rbacService: RbacService) {}

//   @Get('roles')
//   async getRoles() {
//     const data = await this.rbacService.getRoles();
//     return new SuccessResponse('Roles fetched successfully', data);
//   }

//   @Post('roles')
//   async createRole(@Body() dto: AddRoleDto) {
//     const data = await this.rbacService.createRole(dto);
//     return new SuccessResponse('Role created successfully', data);
//   }
// }
