import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleCategory } from '@prisma/client';

export class UpdateContractRouteDto {
  @ApiPropertyOptional({ example: 'uuid-here', description: 'From location ID', format: 'uuid' })
  @IsUUID()
  fromId?: string;

  @ApiPropertyOptional({ example: 'uuid-here', description: 'To location ID', format: 'uuid' })
  @IsUUID()
  toId?: string;

  @ApiPropertyOptional({ example: 'TractorHead', description: 'Vehicle category', enum: VehicleCategory })
  @IsEnum(VehicleCategory)
  vehicleCategory?: VehicleCategory;

  @ApiPropertyOptional({ example: 1600.75, description: 'Route price', minimum: 0 })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price?: number;
}

