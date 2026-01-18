import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';

export class UpdateLocationDto {
  @ApiProperty({ example: 24.7136, description: 'Latitude' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 46.6753, description: 'Longitude' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ example: 10.5, description: 'Accuracy in meters', required: false })
  @IsNumber()
  @IsOptional()
  accuracy?: number;

  @ApiProperty({ example: 45, description: 'Heading in degrees (0-360)', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(360)
  heading?: number;

  @ApiProperty({ example: 60.5, description: 'Speed in km/h', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  speed?: number;

  @ApiProperty({ example: 'order-uuid', description: 'Order ID if tracking for specific order', required: false })
  @IsUUID()
  @IsOptional()
  orderId?: string;
}

