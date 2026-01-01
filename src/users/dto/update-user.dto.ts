import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsUUID, MinLength, MaxLength, IsEnum } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'User email address' })
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'newpassword123',
    description: 'User password (min 8 characters)',
  })
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ example: 'uuid-here', description: 'Role ID', format: 'uuid' })
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional({ enum: UserStatus, description: 'User status' })
  @IsEnum(UserStatus)
  status?: UserStatus;
}
