import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsDateString, MinLength, MaxLength, Min, Max } from 'class-validator';

export class UpdateCompanyDto {
  @ApiProperty({ example: 'Acme Corp', description: 'Company name', required: false })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @ApiProperty({ example: 'شركة أكمي', description: 'Company name in Arabic', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nameArabic?: string;

  @ApiProperty({ example: '1234', description: 'Building number (4 digits)', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(4)
  buildingNo?: string;

  @ApiProperty({ example: '5678', description: 'Secondary number (4 digits)', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(4)
  secondaryNo?: string;

  @ApiProperty({ example: 'King Fahd Road', description: 'Street name', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  street?: string;

  @ApiProperty({ example: 'طريق الملك فهد', description: 'Street name in Arabic', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  streetArabic?: string;

  @ApiProperty({ example: 'Al Olaya', description: 'District name', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string;

  @ApiProperty({ example: 'العليا', description: 'District name in Arabic', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  districtArabic?: string;

  @ApiProperty({ example: 12345, description: 'Postal code', required: false })
  @IsInt()
  @IsOptional()
  postalCode?: number;

  @ApiProperty({ example: 'Saudi Arabia', description: 'Country name', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ example: 'Riyadh', description: 'City name', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ example: 'CR1234567890', description: 'Commercial Registration number', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  crNo?: string;

  @ApiProperty({ example: '2025-12-31', description: 'CR expiry date', required: false })
  @IsDateString()
  @IsOptional()
  crExpiryDate?: string;

  @ApiProperty({ example: 'VAT123456789', description: 'VAT number', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  vatNo?: string;

  @ApiProperty({ example: 'https://example.com/national-address.pdf', description: 'National address document URL', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  nationalAddress?: string;

  @ApiProperty({ example: 'https://example.com/cr-certificate.pdf', description: 'CR certificate document URL', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  crCertificate?: string;

  @ApiProperty({ example: 'https://example.com/vat-certificate.pdf', description: 'VAT certificate document URL', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  vatCertificate?: string;
}

