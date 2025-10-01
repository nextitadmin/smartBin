import { ApiProperty } from "@nestjs/swagger";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export const logStatement = {
  user_login: 'User Login',
  change_password: 'Change Password',
  add_psp: 'Add PSP',
  deactivate_psp: 'Deactivate PSP',
  add_team_member: 'Add Team Member',
  remove_team_member: 'Remove Team Member',
  change_status: 'Change Status',
};


export class AuditLogQueryDto {
  @ApiPropertyOptional({  type: String })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  startdate?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  enddate?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  activityType?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({  type: String })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  limit?: string;
}