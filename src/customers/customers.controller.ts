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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateCustomerRouteDto } from './dto/create-customer-route.dto';
import { ApiResponseDto, ApiListResponseDto } from '../common/dto/api-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Customers')
@ApiBearerAuth('JWT-auth')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const customer = await this.customersService.create(createCustomerDto, currentUser.id, currentUser.companyId);
    return {
      success: true,
      result: customer,
      message: 'Customer created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers with pagination' })
  @ApiResponse({ status: 200, description: 'List of customers retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiListResponseDto<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const result = await this.customersService.findAll(page, limit, currentUser.companyId);
    return {
      success: true,
      results: result.results,
      pagination: result.pagination,
      message: 'Customers retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const customer = await this.customersService.findOne(id, currentUser.companyId);
    return {
      success: true,
      result: customer,
      message: 'Customer retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const customer = await this.customersService.update(id, updateCustomerDto, currentUser.id, currentUser.companyId);
    return {
      success: true,
      result: customer,
      message: 'Customer updated successfully',
    };
  }

  @Get(':id/routes')
  @ApiOperation({ summary: 'Get all routes for a customer' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Customer routes retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getRoutes(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<ApiListResponseDto<any>> {
    const routes = await this.customersService.findRoutes(id, currentUser.companyId);
    return {
      success: true,
      results: routes,
      message: 'Customer routes retrieved successfully',
    };
  }

  @Post(':id/routes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new route for a customer' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Customer route created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async createRoute(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createRouteDto: CreateCustomerRouteDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const route = await this.customersService.createRoute(
      id,
      createRouteDto,
      currentUser.id,
      currentUser.companyId,
    );
    return {
      success: true,
      result: route,
      message: 'Customer route created successfully',
    };
  }

  @Delete(':id/routes/:routeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a customer route' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'routeId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Customer route deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Route not found' })
  async removeRoute(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    await this.customersService.removeRoute(routeId, id, currentUser.companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    await this.customersService.remove(id, currentUser.companyId);
  }
}

