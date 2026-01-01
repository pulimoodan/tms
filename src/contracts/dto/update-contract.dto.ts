import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsDateString,
  IsInt,
  IsBoolean,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { ContractStatus } from '@prisma/client';

export class UpdateContractDto {
  @ApiPropertyOptional({ example: 'uuid-here', description: 'Customer ID', format: 'uuid' })
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ example: 'CNT-2024-002', description: 'Unique contract number' })
  @IsString()
  @MaxLength(50)
  contractNumber?: string;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Contract start date', format: 'date' })
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Contract end date', format: 'date' })
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'uuid-here', description: 'Credit term ID', format: 'uuid' })
  @IsUUID()
  creditTermId?: string;

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

  @ApiPropertyOptional({ example: false, description: 'Bank guarantee required' })
  @IsBoolean()
  bankGuarantee?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Insurance required' })
  @IsBoolean()
  insurance?: boolean;

  @ApiPropertyOptional({
    example: 'Active',
    description: 'Contract status',
    enum: ContractStatus,
  })
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}

