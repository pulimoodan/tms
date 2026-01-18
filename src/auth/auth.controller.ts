import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { DriverLoginDto } from './dto/driver-login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseDto<AuthResponseDto>> {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      result,
      message: 'Login successful',
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(): Promise<ApiResponseDto<null>> {
    return {
      success: true,
      result: null,
      message: 'Logout successful',
    };
  }

  @Public()
  @Post('driver-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Driver mobile app login' })
  @ApiResponse({ status: 200, description: 'Driver login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async driverLogin(@Body() loginDto: DriverLoginDto): Promise<ApiResponseDto<any>> {
    const result = await this.authService.driverLogin(loginDto);
    return {
      success: true,
      result,
      message: 'Driver login successful',
    };
  }
}
