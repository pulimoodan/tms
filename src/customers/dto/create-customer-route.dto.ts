import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCustomerRouteDto {
  @ApiProperty({ example: 'uuid-here', description: 'From location ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  fromId: string;

  @ApiProperty({ example: 'uuid-here', description: 'To location ID', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  toId: string;
}

