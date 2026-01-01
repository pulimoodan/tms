import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateLocationDto {
  @ApiPropertyOptional({ example: 'Riyadh Central Warehouse', description: 'Location name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'RYD-CW-002', description: 'Unique location code' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code?: string;
}

