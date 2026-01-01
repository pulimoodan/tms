import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsInt,
  IsBoolean,
  IsEnum,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { ContractStatus } from '@prisma/client';

export class CreateContractDto {
  @ApiProperty({ example: 'uuid-here', description: 'Customer ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: 'CNT-2024-001', description: 'Unique contract number' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  contractNumber: string;

  @ApiProperty({ example: '2024-01-01', description: 'Contract start date', format: 'date' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-12-31', description: 'Contract end date', format: 'date' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 'uuid-here', description: 'Credit term ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  creditTermId: string;

  @ApiPropertyOptional({ example: 'Construction Materials', description: 'Material type' })
  @IsString()
  @MaxLength(200)
  material?: string;

  @ApiPropertyOptional({ example: 24, description: 'Maximum waiting hours', minimum: 0 })
  @IsInt()
  @Min(0)
  maxWaitingHours?: number;

  @ApiPropertyOptional({ example: 100, description: 'Waiting charge per hour', minimum: 0 })
  @IsInt()
  @Min(0)
  waitingCharge?: number;

  @ApiPropertyOptional({ example: false, description: 'Bank guarantee required', default: false })
  @IsBoolean()
  bankGuarantee?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Insurance required', default: false })
  @IsBoolean()
  insurance?: boolean;

  @ApiPropertyOptional({
    example: 'Draft',
    description: 'Contract status',
    enum: ContractStatus,
    default: ContractStatus.Draft,
  })
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}

