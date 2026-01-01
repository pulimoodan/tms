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
import { VehicleTypesService } from './vehicle-types.service';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import { ApiResponseDto, ApiListResponseDto } from '../common/dto/api-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Vehicle Types')
@ApiBearerAuth('JWT-auth')
@Controller('vehicle-types')
export class VehicleTypesController {
  constructor(private readonly vehicleTypesService: VehicleTypesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new vehicle type' })
  @ApiResponse({ status: 201, description: 'Vehicle type created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createVehicleTypeDto: CreateVehicleTypeDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const vehicleType = await this.vehicleTypesService.create(
      createVehicleTypeDto,
      currentUser.id,
      currentUser.companyId,
    );
    return {
      success: true,
      result: vehicleType,
      message: 'Vehicle type created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicle types with pagination' })
  @ApiResponse({ status: 200, description: 'List of vehicle types retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiListResponseDto<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const result = await this.vehicleTypesService.findAll(page, limit, currentUser.companyId);
    return {
      success: true,
      results: result.results,
      pagination: result.pagination,
      message: 'Vehicle types retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vehicle type by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Vehicle type retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vehicle type not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const vehicleType = await this.vehicleTypesService.findOne(id, currentUser.companyId);
    return {
      success: true,
      result: vehicleType,
      message: 'Vehicle type retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vehicle type' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Vehicle type updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vehicle type not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleTypeDto: UpdateVehicleTypeDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const vehicleType = await this.vehicleTypesService.update(
      id,
      updateVehicleTypeDto,
      currentUser.id,
      currentUser.companyId,
    );
    return {
      success: true,
      result: vehicleType,
      message: 'Vehicle type updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a vehicle type' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Vehicle type deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vehicle type not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    await this.vehicleTypesService.remove(id, currentUser.companyId);
  }
}

