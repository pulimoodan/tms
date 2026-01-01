import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { VehicleStatus, VehicleType, VehicleCategory } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: '4X2 MAN TRACTOR HEAD MOD', description: 'Vehicle name/description' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Vehicle', description: 'Vehicle type', enum: VehicleType })
  @IsEnum(VehicleType)
  @IsOptional()
  type?: VehicleType;

  @ApiPropertyOptional({ example: 'TractorHead', description: 'Vehicle category', enum: VehicleCategory })
  @IsEnum(VehicleCategory)
  @IsOptional()
  category?: VehicleCategory;

  @ApiPropertyOptional({ example: 'MH0162', description: 'Asset number' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  asset?: string;

  @ApiPropertyOptional({ example: 'FF16013', description: 'Door number' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  doorNo?: string;

  @ApiPropertyOptional({ example: 'XYZ-5678', description: 'Vehicle plate number' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @IsOptional()
  plateNumber?: string;

  @ApiPropertyOptional({ example: 'أ ب ج - ١٢٣٤', description: 'Vehicle plate number in Arabic' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  plateNumberArabic?: string;

  @ApiPropertyOptional({ example: 'CHS-789012', description: 'Chassis number' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  chassisNo?: string;

  @ApiPropertyOptional({ example: '731708210', description: 'Sequence number' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  sequenceNo?: string;

  @ApiPropertyOptional({ example: 'Cummins ISX15', description: 'Engine model' })
  @IsString()
  @MaxLength(100)
  engineModel?: string;

  @ApiPropertyOptional({ example: 'EQ-001', description: 'Equipment number' })
  @IsString()
  @MaxLength(50)
  equipmentNo?: string;

  @ApiPropertyOptional({ example: 'Trailer', description: 'Equipment type' })
  @IsString()
  @MaxLength(50)
  equipmentType?: string;

  @ApiPropertyOptional({ example: 450, description: 'Horse power', minimum: 1, maximum: 10000 })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(10000)
  horsePower?: number;

  @ApiPropertyOptional({
    example: 2020,
    description: 'Manufacturing year',
    minimum: 1900,
    maximum: 2100,
  })
  @IsInt()
  @Type(() => Number)
  @Min(1900)
  @Max(2100)
  manufacturingYear?: number;

  @ApiPropertyOptional({ example: 'Mercedes', description: 'Vehicle make/brand' })
  @IsString()
  @MaxLength(50)
  make?: string;

  @ApiPropertyOptional({ example: 'Actros', description: 'Vehicle model' })
  @IsString()
  @MaxLength(50)
  model?: string;

  @ApiPropertyOptional({ example: 'ENG-123456', description: 'Engine serial number' })
  @IsString()
  @MaxLength(100)
  engineSerialNo?: string;

  @ApiPropertyOptional({
    example: 'InMaintenance',
    description: 'Vehicle status',
    enum: VehicleStatus,
  })
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}

