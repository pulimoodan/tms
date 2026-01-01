import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleCategory } from '@prisma/client';

export class CreateContractRouteDto {
  @ApiProperty({ example: 'uuid-here', description: 'From location ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  fromId: string;

  @ApiProperty({ example: 'uuid-here', description: 'To location ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  toId: string;

  @ApiProperty({ example: 'TractorHead', description: 'Vehicle category', enum: VehicleCategory })
  @IsEnum(VehicleCategory)
  @IsNotEmpty()
  vehicleCategory: VehicleCategory;

  @ApiProperty({ example: 1500.5, description: 'Route price', minimum: 0 })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;
}
