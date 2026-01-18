import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { ApiResponseDto, ApiListResponseDto } from '../common/dto/api-response.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Drivers Mobile')
@ApiBearerAuth('JWT-auth')
@Controller('drivers/me')
@UseGuards(JwtAuthGuard)
export class DriversMobileController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @ApiOperation({ summary: 'Get current driver profile' })
  @ApiResponse({ status: 200, description: 'Driver profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() currentUser: any): Promise<ApiResponseDto<any>> {
    const driver = await this.driversService.findOne(currentUser.driverId || currentUser.sub, currentUser.companyId);
    return {
      success: true,
      result: driver,
      message: 'Driver profile retrieved successfully',
    };
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get current driver assigned orders/waybills' })
  @ApiResponse({ status: 200, description: 'Driver orders retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyOrders(@CurrentUser() currentUser: any): Promise<ApiListResponseDto<any>> {
    const result = await this.driversService.getDriverOrders(
      currentUser.driverId || currentUser.sub,
      currentUser.companyId,
    );
    return {
      success: true,
      results: result.orders,
      pagination: result.pagination,
      message: 'Driver orders retrieved successfully',
    };
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get specific waybill details' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Waybill details retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Waybill not found' })
  async getOrderDetails(
    @Param('id', ParseUUIDPipe) orderId: string,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const order = await this.driversService.getDriverOrderDetails(
      orderId,
      currentUser.driverId || currentUser.sub,
      currentUser.companyId,
    );
    return {
      success: true,
      result: order,
      message: 'Waybill details retrieved successfully',
    };
  }

  @Post('location')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update driver location' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateLocation(
    @Body() updateLocationDto: UpdateLocationDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const result = await this.driversService.updateLocation(
      currentUser.driverId || currentUser.sub,
      currentUser.companyId,
      updateLocationDto,
    );
    return {
      success: true,
      result,
      message: 'Location updated successfully',
    };
  }

  @Patch('fcm-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update FCM token for push notifications' })
  @ApiResponse({ status: 200, description: 'FCM token updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateFcmToken(
    @Body('fcmToken') fcmToken: string,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    await this.driversService.updateFcmToken(currentUser.driverId || currentUser.sub, fcmToken);
    return {
      success: true,
      result: null,
      message: 'FCM token updated successfully',
    };
  }
}

