import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ContractRoutesService } from './contract-routes.service';
import { CreateContractRouteDto } from './dto/create-contract-route.dto';
import { UpdateContractRouteDto } from './dto/update-contract-route.dto';
import { ApiResponseDto, ApiListResponseDto } from '../common/dto/api-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Contract Routes')
@ApiBearerAuth('JWT-auth')
@Controller('contracts/:contractId/routes')
export class ContractRoutesController {
  constructor(private readonly contractRoutesService: ContractRoutesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a route to a contract' })
  @ApiParam({ name: 'contractId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Route added successfully' })
  @ApiResponse({ status: 400, description: 'From and To locations cannot be the same' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Contract, location or vehicle type not found' })
  async create(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Body() createRouteDto: CreateContractRouteDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const route = await this.contractRoutesService.create(
      contractId,
      createRouteDto,
      currentUser.id,
      currentUser.companyId,
    );
    return {
      success: true,
      result: route,
      message: 'Route added successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all routes for a contract' })
  @ApiParam({ name: 'contractId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of routes retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async findAll(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @CurrentUser() currentUser: any,
  ): Promise<ApiListResponseDto<any>> {
    const routes = await this.contractRoutesService.findAll(contractId, currentUser.companyId);
    return {
      success: true,
      results: routes,
      message: 'Routes retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contract route by ID' })
  @ApiParam({ name: 'contractId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Route retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Route not found' })
  async findOne(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const route = await this.contractRoutesService.findOne(id, currentUser.companyId);
    return {
      success: true,
      result: route,
      message: 'Route retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contract route' })
  @ApiParam({ name: 'contractId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Route updated successfully' })
  @ApiResponse({ status: 400, description: 'From and To locations cannot be the same' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Route, location or vehicle type not found' })
  async update(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRouteDto: UpdateContractRouteDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const route = await this.contractRoutesService.update(id, updateRouteDto, currentUser.id, currentUser.companyId);
    return {
      success: true,
      result: route,
      message: 'Route updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a contract route' })
  @ApiParam({ name: 'contractId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Route deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Route not found' })
  async remove(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    await this.contractRoutesService.remove(id, currentUser.companyId);
  }
}

