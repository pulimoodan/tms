import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'Administrator', description: 'Role name' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;
}
