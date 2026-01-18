import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';

export class DriverLoginDto {
  @ApiProperty({ example: '+966501234567', description: 'Driver mobile number (required if iqamaNumber not provided)' })
  @IsString()
  @ValidateIf((o) => !o.iqamaNumber)
  @IsNotEmpty({ message: 'Either mobile number or iqama number is required' })
  mobile?: string;

  @ApiProperty({ example: '1234567890', description: 'Driver iqama number (required if mobile not provided)' })
  @IsString()
  @ValidateIf((o) => !o.mobile)
  @IsNotEmpty({ message: 'Either mobile number or iqama number is required' })
  iqamaNumber?: string;

  @ApiProperty({ example: 'password123', description: 'Driver password or PIN' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'device-uuid-123', description: 'Device identifier for push notifications', required: false })
  @IsString()
  @IsOptional()
  deviceId?: string;

  @ApiProperty({ example: 'fcm-token-123', description: 'FCM token for push notifications', required: false })
  @IsString()
  @IsOptional()
  fcmToken?: string;
}

