import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z' })
  expiresIn: string;

  @ApiProperty({
    example: {
      id: 'uuid',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: {
        id: 'uuid',
        name: 'Admin',
      },
    },
  })
  user: {
    id: string;
    name: string;
    email: string;
    role: {
      id: string;
      name: string;
    };
  };
}

