// import { AuthUser } from '@common/types';
// import { Injectable } from '@nestjs/common';
// import { CreatePickupDto } from '@src/waste-management/pickup/dto/createPickup.dto';
// import { PickupService } from '@src/waste-management/pickup/pickup.service';

// @Injectable()
// export class WasteManagementService {
//   constructor(private readonly pickupService: PickupService) {}

//   async getWasteManagements() {}

//   async getAllPickups(accountId: string) {
//     return this.pickupService.getCorporatePickups(accountId);
//   }

//   async createPickup(param: CreatePickupDto & Partial<AuthUser>) {
//     return this.pickupService.createPickup({
//       accountId: param.accountId,
//       accountType: param.accountType,
//       applicationData: { ...param },
//     });
//   }
// }
