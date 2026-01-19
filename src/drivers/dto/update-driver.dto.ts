import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { DriverStatus, DriverPosition, DriverOwnershipType } from '@prisma/client';

export class UpdateDriverDto {
  @ApiPropertyOptional({ example: '7706', description: 'Badge number' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  badgeNo?: string;

  @ApiPropertyOptional({ example: 'Ahmed Ali', description: 'Driver full name' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '1234567890', description: 'Iqama number (10 digits)' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{10}$/, { message: 'Iqama number must be exactly 10 digits' })
  iqamaNumber?: string;

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

  @ApiPropertyOptional({ example: 'Saudi Arabia', description: 'Driver nationality' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  nationality?: string;

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
    example: 'OnTrip',
    description: 'Driver status',
    enum: DriverStatus,
  })
  @IsEnum(DriverStatus)
  @IsOptional()
  status?: DriverStatus;

  @ApiPropertyOptional({
    example: 'CompanyOwned',
    description: 'Driver ownership type',
    enum: DriverOwnershipType,
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

  @ApiPropertyOptional({
    example: 'password123',
    description: 'Password for mobile app login (will be hashed). Leave empty to keep existing password.',
    minLength: 4,
  })
  @IsString()
  @IsOptional()
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  @MaxLength(100)
  password?: string;
}
