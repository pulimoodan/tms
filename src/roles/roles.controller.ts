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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRolePermissionDto, UpdateRolePermissionDto } from './dto/role-permission.dto';
import { ApiResponseDto, ApiListResponseDto } from '../common/dto/api-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Role with this name already exists' })
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const role = await this.rolesService.create(createRoleDto, currentUser.id, currentUser.companyId);
    return {
      success: true,
      result: role,
      message: 'Role created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles with pagination' })
  @ApiResponse({ status: 200, description: 'List of roles retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiListResponseDto<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const result = await this.rolesService.findAll(page, limit, currentUser.companyId);
    return {
      success: true,
      results: result.results,
      pagination: result.pagination,
      message: 'Roles retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const role = await this.rolesService.findOne(id, currentUser.companyId);
    return {
      success: true,
      result: role,
      message: 'Role retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role with this name already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const role = await this.rolesService.update(id, updateRoleDto, currentUser.id, currentUser.companyId);
    return {
      success: true,
      result: role,
      message: 'Role updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete role with assigned users' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    await this.rolesService.remove(id, currentUser.companyId);
  }

  @Post(':id/permissions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add permissions to a role' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Permission added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Permission for this module already exists' })
  async addPermission(
    @Param('id', ParseUUIDPipe) roleId: string,
    @Body() createPermissionDto: CreateRolePermissionDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const permission = await this.rolesService.addPermission(
      roleId,
      createPermissionDto,
      currentUser.id,
      currentUser.companyId,
    );
    return {
      success: true,
      result: permission,
      message: 'Permission added successfully',
    };
  }

  @Patch(':id/permissions/:module')
  @ApiOperation({ summary: 'Update permissions for a role module' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'module', type: 'string' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  async updatePermission(
    @Param('id', ParseUUIDPipe) roleId: string,
    @Param('module') module: string,
    @Body() updatePermissionDto: UpdateRolePermissionDto,
    @CurrentUser() currentUser: any,
  ): Promise<ApiResponseDto<any>> {
    const permission = await this.rolesService.updatePermission(
      roleId,
      module,
      updatePermissionDto,
      currentUser.id,
      currentUser.companyId,
    );
    return {
      success: true,
      result: permission,
      message: 'Permission updated successfully',
    };
  }

  @Delete(':id/permissions/:module')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove permissions from a role module' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'module', type: 'string' })
  @ApiResponse({ status: 204, description: 'Permission removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  async removePermission(
    @Param('id', ParseUUIDPipe) roleId: string,
    @Param('module') module: string,
    @CurrentUser() currentUser: any,
  ): Promise<void> {
    await this.rolesService.removePermission(roleId, module, currentUser.companyId);
  }
}
