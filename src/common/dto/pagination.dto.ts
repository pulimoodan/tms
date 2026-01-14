import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { VehicleType } from '@prisma/client';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: VehicleType, description: 'Filter vehicles by type' })
  @IsOptional()
  @IsEnum(VehicleType)
  type?: VehicleType;

  @ApiPropertyOptional({ description: 'Search query for filtering vehicles' })
  @IsOptional()
  @Type(() => String)
  search?: string;

  @ApiPropertyOptional({
    description: 'Exclude resources assigned to pending orders, except this order (for edit mode)',
    format: 'uuid',
  })
  @IsOptional()
  @Type(() => String)
  excludeOrderId?: string;
}
