import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CorporateService } from '../corporate.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedCorporate, CorporateAuth } from '@common/decorators/auth.decorator';
import { Corporate } from '@models/users/corporate.model';
import { CorporateUser } from '@common/types';
import { SuccessResponse } from '@common/http';
import { UserRole } from '@models/types';


@ApiTags('Corporate-Branch')
@Controller({
    path: 'corporates/branch',
    version: '1',
})
export class CorporateBranchController {
    constructor(private readonly branchervice: CorporateService) {}

    @Get()
    async getCorporateBranch(
        @AuthenticatedCorporate() branch: CorporateUser,
    ) {
        return this.branchervice.fetchBranches(branch.id)
    }

    @Post(':branchId/create')
    async AddCorporateBranch(
        @AuthenticatedCorporate() branch: CorporateUser,
        @Body() body,
        @Param('branch')
        branchId: string
    ) {
        const userId = branch.id
        return this.branchervice.addBranch(userId, body)   
    }

}

