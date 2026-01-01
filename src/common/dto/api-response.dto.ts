import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  result?: T;

  @ApiProperty()
  message?: string;
}

export class ApiListResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: [Object] })
  results?: T[];

  @ApiProperty()
  message?: string;

  @ApiProperty()
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
