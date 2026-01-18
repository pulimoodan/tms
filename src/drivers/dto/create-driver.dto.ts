import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { DriverStatus, DriverPosition, DriverOwnershipType } from '@prisma/client';

export class CreateDriverDto {
  @ApiPropertyOptional({ example: '7706', description: 'Badge number' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  badgeNo?: string;

  @ApiProperty({ example: 'Ahmed Ali', description: 'Driver full name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '1234567890', description: 'Iqama number (10 digits)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/, { message: 'Iqama number must be exactly 10 digits' })
  iqamaNumber: string;

  @ApiPropertyOptional({
    example: 'HeavyDutyDriver',
    description: 'Driver position',
    enum: DriverPosition,
  })
  @IsEnum(DriverPosition)
  @IsOptional()
  position?: DriverPosition;

  @ApiPropertyOptional({
    example: 'Abdulla Fouad Contracting Co.',
    description: 'Sponsorship company',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  sponsorship?: string;

  @ApiProperty({ example: 'Saudi Arabia', description: 'Driver nationality' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nationality: string;

  @ApiPropertyOptional({
    example: '2025-12-22',
    description: 'Driver card expiry date (ISO date string)',
  })
  @IsDateString()
  @IsOptional()
  driverCardExpiry?: string;

  @ApiPropertyOptional({ example: '+966501234567', description: 'Mobile number' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  mobile?: string;

  @ApiPropertyOptional({ example: 'en', description: 'Preferred language code' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  preferredLanguage?: string;

  @ApiPropertyOptional({
    example: 'Active',
    description: 'Driver status',
    enum: DriverStatus,
    default: DriverStatus.Active,
  })
  @IsEnum(DriverStatus)
  @IsOptional()
  status?: DriverStatus;

  @ApiPropertyOptional({
    example: 'CompanyOwned',
    description: 'Driver ownership type',
    enum: DriverOwnershipType,
    default: DriverOwnershipType.CompanyOwned,
  })
  @IsEnum(DriverOwnershipType)
  @IsOptional()
  ownershipType?: DriverOwnershipType;

  @ApiPropertyOptional({
    example: 'ABC Transport Company',
    description: 'Outsourced company name (if driver is outsourced)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  outsourcedCompanyName?: string;

  @ApiPropertyOptional({
    example: 'TAAM123456789',
    description: 'TAAM ID for tracking traffic violations',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  taamId?: string;

  @ApiPropertyOptional({
    example: 'uuid-here',
    description: 'Assigned vehicle ID (only Vehicle type, not attachments/accessories)',
    format: 'uuid',
  })
  @IsString()
  @IsOptional()
  vehicleId?: string;
}
