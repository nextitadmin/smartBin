import { Body, Controller, Get, Post, Put, Param, Delete } from '@nestjs/common';
import { TeamService } from './team.service';
import { ApiTags } from '@nestjs/swagger';
import { Auth, AuthenticatedUser } from '@common/decorators/auth.decorator';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from '@src/team/dto/team-member.dto';
import { SuccessResponse, PaginatedSuccessResponse } from '@common/http';
import { AuthUser } from '@common/types';

@ApiTags('Team')
@Auth()
@Controller({
    path: 'team-members',
    version: '1',
})
export class TeamController {
    constructor(private readonly teamService: TeamService) { }

    @Post('add-member')
    async addTeamMember(
        @AuthenticatedUser() user: AuthUser,
        @Body() dto: CreateTeamMemberDto,
    ) {
        const teamMember = await this.teamService.addTeamMember({
            userId: user.id,
            accountType: user.role,
            dto,
        });
        return new SuccessResponse('Team member added successfully', teamMember);
    }

    @Get()
    async getTeamMembers(@AuthenticatedUser() user: AuthUser) {
        const teamMembers = await this.teamService.getTeamMembersForUser(user);
        return new PaginatedSuccessResponse(
            'Team Members fetched successfully',
            teamMembers.data,
            teamMembers.paging,
        );
    }


    @Put(':id')
    async updateTeamMember(
        @Param('id') id: string,
        @AuthenticatedUser() user: AuthUser,
        @Body() dto: UpdateTeamMemberDto,
    ) {
        const updatedTeamMember = await this.teamService.updateTeamMemberInfo(
            id,
            user.id,
            dto,
        );
        return new SuccessResponse('Team member updated successfully', updatedTeamMember);
    }


    @Delete(':id')
    async deleteTeamMember(
        @Param('id') id: string,
        @AuthenticatedUser() user: AuthUser,
    ) {
        const deletedTeamMember = await this.teamService.deleteTeamMember(
            id,
            user.id,
        );
        return new SuccessResponse('Team member deleted successfully', deletedTeamMember);
    }


}
