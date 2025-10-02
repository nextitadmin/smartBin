// import { Controller } from '@nestjs/common';
// import { MessagePattern } from '@nestjs/microservices';
// import { ResidentService } from './resident.service';

// @Controller()
// export class AdminResidentController {
//   constructor(private readonly residentService: ResidentService) {}
//   @MessagePattern({
//     cmd: 'GET_APPLICATION_DETAILS',
//   })
//   async getAllResidents(payload: { page?: string; limit?: string }) {
//     console.log('Getting all resident bin applications', payload);

//     const pageNumber = parseInt(payload.page ?? '1', 10);
//     const limitNumber = parseInt(payload.limit ?? '10', 10);

//     return this.residentService.getAllResidents();
//   }
// }
