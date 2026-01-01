import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Acme Corp', description: 'Customer name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'شركة أكيمي', description: 'Customer name in Arabic' })
  @IsString()
  @MaxLength(100)
  nameArabic?: string;

  @ApiPropertyOptional({ example: '1234', description: 'Building number (4 digits)' })
  @IsString()
  @Matches(/^\d{4}$/, { message: 'Building number must be exactly 4 digits' })
  buildingNo?: string;

  @ApiPropertyOptional({ example: '5678', description: 'Secondary number (4 digits)' })
  @IsString()
  @Matches(/^\d{4}$/, { message: 'Secondary number must be exactly 4 digits' })
  secondaryNo?: string;

  @ApiPropertyOptional({ example: 'King Fahd Road', description: 'Street name' })
  @IsString()
  @MaxLength(200)
  street?: string;

  @ApiPropertyOptional({ example: 'طريق الملك فهد', description: 'Street name in Arabic' })
  @IsString()
  @MaxLength(200)
  streetArabic?: string;

  @ApiPropertyOptional({ example: 'Al Olaya', description: 'District name' })
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({ example: 'العليا', description: 'District name in Arabic' })
  @IsString()
  @MaxLength(100)
  districtArabic?: string;

  @ApiPropertyOptional({
    example: 123456,
    description: 'Postal code (6 digits)',
    minimum: 100000,
    maximum: 999999,
  })
  @IsInt()
  @Type(() => Number)
  @Min(100000)
  @Max(999999)
  postalCode?: number;

  @ApiPropertyOptional({ example: 'Saudi Arabia', description: 'Country' })
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 'Riyadh', description: 'City' })
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'CR1234567890', description: 'Commercial Registration number' })
  @IsString()
  @MaxLength(50)
  crNo?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Commercial Registration expiry date',
    format: 'date',
  })
  @IsDateString()
  crExpiryDate?: string;

  @ApiPropertyOptional({ example: 'VAT123456789', description: 'VAT number' })
  @IsString()
  @MaxLength(50)
  vatNo?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/docs/national-address.pdf',
    description: 'National address document URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  nationalAddress?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/docs/cr-certificate.pdf',
    description: 'CR certificate document URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  crCertificate?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/docs/vat-certificate.pdf',
    description: 'VAT certificate document URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  vatCertificate?: string;
}
