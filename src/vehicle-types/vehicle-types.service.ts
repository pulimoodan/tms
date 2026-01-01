import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import { VehicleType } from '@prisma/client';

@Injectable()
export class VehicleTypesService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleTypeDto: CreateVehicleTypeDto, userId: string, companyId: string): Promise<VehicleType> {
    return this.prisma.vehicleType.create({
      data: {
        companyId,
        name: createVehicleTypeDto.name,
        capacity: createVehicleTypeDto.capacity,
        type: createVehicleTypeDto.type,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10, companyId: string) {
    const skip = (page - 1) * limit;

    const [vehicleTypes, total] = await Promise.all([
      this.prisma.vehicleType.findMany({
        where: { companyId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicleType.count({ where: { companyId } }),
    ]);

    return {
      results: vehicleTypes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<VehicleType> {
    const vehicleType = await this.prisma.vehicleType.findFirst({
      where: { id, companyId },
    });

    if (!vehicleType) {
      throw new NotFoundException(`Vehicle type with ID '${id}' not found`);
    }

    return vehicleType;
  }

  async update(
    id: string,
    updateVehicleTypeDto: UpdateVehicleTypeDto,
    userId: string,
    companyId: string,
  ): Promise<VehicleType> {
    await this.findOne(id, companyId);

    return this.prisma.vehicleType.update({
      where: { id },
      data: {
        ...updateVehicleTypeDto,
        updatedById: userId,
      },
    });
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.prisma.vehicleType.delete({
      where: { id },
    });
  }
}

