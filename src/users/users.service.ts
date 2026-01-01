import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, userId: string, companyId: string): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(`User with email '${createUserDto.email}' already exists`);
    }

    const role = await this.prisma.role.findUnique({
      where: { id: createUserDto.roleId, companyId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${createUserDto.roleId}' not found`);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        companyId,
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash,
        roleId: createUserDto.roleId,
        status: UserStatus.Active,
        createdById: userId,
        updatedById: userId,
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'passwordHash'>;
  }

  async findAll(page: number = 1, limit: number = 10, companyId: string) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { companyId },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { companyId } }),
    ]);

    return {
      results: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as Omit<User, 'passwordHash'>;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, userId: string, companyId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.findOne(id, companyId);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException(`User with email '${updateUserDto.email}' already exists`);
      }
    }

    if (updateUserDto.roleId && updateUserDto.roleId !== user.roleId) {
      const role = await this.prisma.role.findFirst({
        where: { id: updateUserDto.roleId, companyId },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID '${updateUserDto.roleId}' not found`);
      }
    }

    const updateData: any = {
      ...updateUserDto,
      updatedById: userId,
    };

    if (updateUserDto.password) {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
      delete updateData.password;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as Omit<User, 'passwordHash'>;
  }

  async remove(id: string, companyId: string): Promise<void> {
    const user = await this.findOne(id, companyId);
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}

