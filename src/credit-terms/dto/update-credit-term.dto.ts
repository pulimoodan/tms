import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, Min, MaxLength, MinLength } from 'class-validator';

export class UpdateCreditTermDto {
  @ApiPropertyOptional({ example: 'Net 45', description: 'Credit term name' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    example: 'Payment due within 45 days',
    description: 'Credit term description',
  })
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 45,
    description: 'Number of days for payment',
    minimum: 1,
    maximum: 365,
  })
  @IsInt()
  @Min(1)
  paymentDays?: number;
}
