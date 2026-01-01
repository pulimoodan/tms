import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, Min, MinLength, MaxLength } from 'class-validator';
import { VehicleType } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateVehicleTypeDto {
  @ApiPropertyOptional({ example: '5T Flat Bed', description: 'Vehicle type name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 5.0, description: 'Vehicle capacity in tons', minimum: 0.01 })
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  capacity?: number;

  @ApiPropertyOptional({
    example: 'LowBed',
    description: 'Vehicle type category',
    enum: VehicleType,
  })
  @IsEnum(VehicleType)
  type?: VehicleType;
}

