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
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ApiResponseDto, ApiListResponseDto } from '../common/dto/api-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Locations')
@ApiBearerAuth('JWT-auth')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Location with this code already exists' })
  async create(
    @Body() createLocationDto: CreateLocationDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const location = await this.locationsService.create(createLocationDto, currentUser.id, currentUser.companyId);
    return {
      success: true,
      result: location,
      message: 'Location created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all locations with pagination' })
  @ApiResponse({ status: 200, description: 'List of locations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiListResponseDto<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const result = await this.locationsService.findAll(page, limit, currentUser.companyId);
    return {
      success: true,
      results: result.results,
      pagination: result.pagination,
      message: 'Locations retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Location retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const location = await this.locationsService.findOne(id, currentUser.companyId);
    return {
      success: true,
      result: location,
      message: 'Location retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a location' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 409, description: 'Location with this code already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const location = await this.locationsService.update(id, updateLocationDto, currentUser.id, currentUser.companyId);
    return {
      success: true,
      result: location,
      message: 'Location updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a location' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Location deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    await this.locationsService.remove(id, currentUser.companyId);
  }
}

