import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { VehicleType, VehicleCategory, VehicleStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'Truck-001', description: 'Vehicle name' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    example: 'Vehicle',
    description: 'Vehicle type',
    enum: VehicleType,
  })
  @IsEnum(VehicleType)
  @IsOptional()
  type?: VehicleType;

  @ApiPropertyOptional({
    example: 'TractorHead',
    description: 'Vehicle category',
    enum: VehicleCategory,
  })
  @IsEnum(VehicleCategory)
  @IsOptional()
  category?: VehicleCategory;

  @ApiPropertyOptional({ example: 'ABC123', description: 'Plate number' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  plateNumber?: string;

  @ApiPropertyOptional({ example: 'أ ب ج ١٢٣', description: 'Arabic plate number' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  plateNumberArabic?: string;

  @ApiPropertyOptional({ example: 'CH123456789', description: 'Chassis number' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  chassisNo?: string;

  @ApiPropertyOptional({ example: '001', description: 'Door number' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  doorNo?: string;

  @ApiPropertyOptional({ example: 'ASSET001', description: 'Asset number' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  asset?: string;

  @ApiPropertyOptional({ example: 'SEQ001', description: 'Sequence number' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  sequenceNo?: string;

  @ApiPropertyOptional({ example: 'Cummins ISX', description: 'Engine model' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  engineModel?: string;

  @ApiPropertyOptional({ example: 'EQ123456', description: 'Equipment number' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  equipmentNo?: string;

  @ApiPropertyOptional({ example: 'Crane', description: 'Equipment type' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  equipmentType?: string;

  @ApiPropertyOptional({ example: 500, description: 'Horse power', minimum: 0 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  horsePower?: number;

  @ApiPropertyOptional({ example: 2020, description: 'Manufacturing year', minimum: 1900, maximum: 2100 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(1900)
  manufacturingYear?: number;

  @ApiPropertyOptional({ example: 'Mercedes', description: 'Vehicle make' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  make?: string;

  @ApiPropertyOptional({ example: 'Actros', description: 'Vehicle model' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  model?: string;

  @ApiPropertyOptional({ example: 'ENG123456789', description: 'Engine serial number' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  engineSerialNo?: string;

  @ApiPropertyOptional({ example: '10 Ton', description: 'Capacity' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  capacity?: string;

  @ApiPropertyOptional({ example: 'HeavyDuty', description: 'Tractor category' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  tractorCategory?: string;

  @ApiPropertyOptional({ example: 'FlatBed', description: 'Trailer category' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  trailerCategory?: string;

  @ApiPropertyOptional({ example: 'Agent Name', description: 'Agent' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  agent?: string;

  @ApiPropertyOptional({ example: false, description: 'Has built-in trailer', default: false })
  @IsBoolean()
  @IsOptional()
  builtInTrailer?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Has built-in reefer', default: false })
  @IsBoolean()
  @IsOptional()
  builtInReefer?: boolean;

  @ApiPropertyOptional({
    example: 'Active',
    description: 'Vehicle status',
    enum: VehicleStatus,
  })
  @IsEnum(VehicleStatus)
  @IsOptional()
  status?: VehicleStatus;
}

