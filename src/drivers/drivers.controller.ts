import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { ApiResponseDto, ApiListResponseDto } from '../common/dto/api-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Drivers')
@ApiBearerAuth('JWT-auth')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new driver' })
  @ApiResponse({ status: 201, description: 'Driver created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Driver with this iqama number already exists' })
  async create(
    @Body() createDriverDto: CreateDriverDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const driver = await this.driversService.create(createDriverDto, currentUser.id, currentUser.companyId);
    return {
      success: true,
      result: driver,
      message: 'Driver created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all drivers with pagination' })
  @ApiResponse({ status: 200, description: 'List of drivers retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiListResponseDto<any>> {
    const { page = 1, limit = 10, excludeOrderId } = paginationDto as any;
    const result = await this.driversService.findAll(
      page,
      limit,
      currentUser.companyId,
      excludeOrderId,
    );
    return {
      success: true,
      results: result.results,
      pagination: result.pagination,
      message: 'Drivers retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a driver by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Driver retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const driver = await this.driversService.findOne(id, currentUser.companyId);
    return {
      success: true,
      result: driver,
      message: 'Driver retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a driver' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Driver updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  @ApiResponse({ status: 409, description: 'Driver with this iqama number already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDriverDto: UpdateDriverDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const driver = await this.driversService.update(id, updateDriverDto, currentUser.id, currentUser.companyId);
    return {
      success: true,
      result: driver,
      message: 'Driver updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a driver' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Driver deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    await this.driversService.remove(id, currentUser.companyId);
  }
}
