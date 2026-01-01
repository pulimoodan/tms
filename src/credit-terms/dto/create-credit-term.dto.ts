import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, MaxLength, MinLength } from 'class-validator';

export class CreateCreditTermDto {
  @ApiProperty({ example: 'Net 30', description: 'Credit term name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    example: 'Payment due within 30 days',
    description: 'Credit term description',
  })
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 30, description: 'Number of days for payment', minimum: 1, maximum: 365 })
  @IsInt()
  @Min(1)
  paymentDays: number;
}
