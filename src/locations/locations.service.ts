import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from '@prisma/client';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto, userId: string, companyId: string): Promise<Location> {
    const existingLocation = await this.prisma.location.findFirst({
      where: { code: createLocationDto.code, companyId },
    });

    if (existingLocation) {
      throw new ConflictException(
        `Location with code '${createLocationDto.code}' already exists`,
      );
    }

    return this.prisma.location.create({
      data: {
        companyId,
        name: createLocationDto.name,
        code: createLocationDto.code,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10, companyId: string) {
    const skip = (page - 1) * limit;

    const [locations, total] = await Promise.all([
      this.prisma.location.findMany({
        where: { companyId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.location.count({ where: { companyId } }),
    ]);

    return {
      results: locations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<Location> {
    const location = await this.prisma.location.findFirst({
      where: { id, companyId },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID '${id}' not found`);
    }

    return location;
  }

  async findByCode(code: string, companyId: string): Promise<Location | null> {
    return this.prisma.location.findFirst({
      where: { code, companyId },
    });
  }

  async update(
    id: string,
    updateLocationDto: UpdateLocationDto,
    userId: string,
    companyId: string,
  ): Promise<Location> {
    const location = await this.findOne(id, companyId);

    if (updateLocationDto.code && updateLocationDto.code !== location.code) {
      const existingLocation = await this.prisma.location.findFirst({
        where: { code: updateLocationDto.code, companyId },
      });

      if (existingLocation) {
        throw new ConflictException(
          `Location with code '${updateLocationDto.code}' already exists`,
        );
      }
    }

    return this.prisma.location.update({
      where: { id },
      data: {
        ...updateLocationDto,
        updatedById: userId,
      },
    });
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.prisma.location.delete({
      where: { id },
    });
  }
}

