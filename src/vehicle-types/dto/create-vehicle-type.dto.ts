import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, MinLength, MaxLength } from 'class-validator';
import { VehicleType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateVehicleTypeDto {
  @ApiProperty({ example: '4T Flat Bed', description: 'Vehicle type name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 4.5, description: 'Vehicle capacity in tons', minimum: 0.01 })
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  capacity: number;

  @ApiProperty({
    example: 'FlatBed',
    description: 'Vehicle type category',
    enum: VehicleType,
  })
  @IsEnum(VehicleType)
  type: VehicleType;
}

