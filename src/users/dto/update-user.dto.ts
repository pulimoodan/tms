import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsUUID,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserStatus } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'User email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'currentpassword123',
    description: 'Current password (required when changing password)',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ValidateIf((o) => o.password !== undefined && o.password !== null && o.password !== '')
  @IsString()
  currentPassword?: string;

  @ApiPropertyOptional({
    example: 'newpassword123',
    description: 'User password (min 8 characters)',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ValidateIf((o) => o.password !== undefined && o.password !== null && o.password !== '')
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ example: 'uuid-here', description: 'Role ID', format: 'uuid' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  roleId?: string;

  @ApiPropertyOptional({ enum: UserStatus, description: 'User status' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEnum(UserStatus)
  status?: UserStatus;
}
