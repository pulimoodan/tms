import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRolePermissionDto, UpdateRolePermissionDto } from './dto/role-permission.dto';
import { Role, RolePermission } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto, userId: string, companyId: string): Promise<Role> {
    const existingRole = await this.prisma.role.findFirst({
      where: { name: createRoleDto.name, companyId },
    });

    if (existingRole) {
      throw new ConflictException(`Role with name '${createRoleDto.name}' already exists`);
    }

    return this.prisma.role.create({
      data: {
        companyId,
        name: createRoleDto.name,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10, companyId: string) {
    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where: { companyId },
        skip,
        take: limit,
        include: {
          permissions: true,
          _count: {
            select: { users: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.role.count({ where: { companyId } }),
    ]);

    return {
      results: roles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<Role> {
    const role = await this.prisma.role.findFirst({
      where: { id, companyId },
      include: {
        permissions: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, userId: string, companyId: string): Promise<Role> {
    const role = await this.findOne(id, companyId);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.prisma.role.findFirst({
        where: { name: updateRoleDto.name, companyId, id: { not: id } },
      });

      if (existingRole) {
        throw new ConflictException(`Role with name '${updateRoleDto.name}' already exists`);
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        ...updateRoleDto,
        updatedById: userId,
      },
    });
  }

  async remove(id: string, companyId: string): Promise<void> {
    const role = await this.findOne(id, companyId);

    const userCount = await this.prisma.user.count({
      where: { roleId: id, companyId },
    });

    if (userCount > 0) {
      throw new ConflictException(
        `Cannot delete role. There are ${userCount} user(s) assigned to this role.`,
      );
    }

    await this.prisma.role.delete({
      where: { id },
    });
  }

  async addPermission(
    roleId: string,
    createPermissionDto: CreateRolePermissionDto,
    userId: string,
    companyId: string,
  ): Promise<RolePermission> {
    await this.findOne(roleId, companyId);

    const existingPermission = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_module: {
          roleId,
          module: createPermissionDto.module,
        },
      },
    });

    if (existingPermission) {
      throw new ConflictException(
        `Permission for module '${createPermissionDto.module}' already exists for this role`,
      );
    }

    return this.prisma.rolePermission.create({
      data: {
        companyId,
        roleId,
        module: createPermissionDto.module,
        permissions: createPermissionDto.permissions,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async updatePermission(
    roleId: string,
    module: string,
    updatePermissionDto: UpdateRolePermissionDto,
    userId: string,
    companyId: string,
  ): Promise<RolePermission> {
    await this.findOne(roleId, companyId);

    const existingPermission = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_module: {
          roleId,
          module,
        },
      },
    });

    if (!existingPermission) {
      throw new NotFoundException(`Permission for module '${module}' not found for this role`);
    }

    return this.prisma.rolePermission.update({
      where: { id: existingPermission.id },
      data: {
        permissions: updatePermissionDto.permissions,
        updatedById: userId,
      },
    });
  }

  async removePermission(roleId: string, module: string, companyId: string): Promise<void> {
    await this.findOne(roleId, companyId);

    const permission = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_module: {
          roleId,
          module,
        },
      },
    });

    if (!permission) {
      throw new NotFoundException(`Permission for module '${module}' not found for this role`);
    }

    await this.prisma.rolePermission.delete({
      where: { id: permission.id },
    });
  }
}
