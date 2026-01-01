import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsEnum, ArrayNotEmpty } from 'class-validator';
import { Permission } from '@prisma/client';

export class CreateRolePermissionDto {
  @ApiProperty({ example: 'Customers', description: 'Module name' })
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiProperty({
    example: ['Read', 'Write', 'Update'],
    description: 'Array of permissions',
    enum: Permission,
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Permission, { each: true })
  permissions: Permission[];
}

export class UpdateRolePermissionDto {
  @ApiPropertyOptional({
    example: ['Read', 'Write', 'Update', 'Delete', 'Export'],
    description: 'Array of permissions',
    enum: Permission,
    isArray: true,
  })
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions?: Permission[];
}
