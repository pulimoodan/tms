import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle, VehicleType } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto, userId: string, companyId: string): Promise<Vehicle> {
    if (createVehicleDto.plateNumber) {
      const existingVehicle = await this.prisma.vehicle.findFirst({
        where: { plateNumber: createVehicleDto.plateNumber, companyId },
      });

      if (existingVehicle) {
        throw new ConflictException(
          `Vehicle with plate number '${createVehicleDto.plateNumber}' already exists`,
        );
      }
    }

    if (createVehicleDto.asset) {
      const existingVehicle = await this.prisma.vehicle.findFirst({
        where: { asset: createVehicleDto.asset, companyId },
      });

      if (existingVehicle) {
        throw new ConflictException(
          `Vehicle with asset '${createVehicleDto.asset}' already exists`,
        );
      }
    }

    return this.prisma.vehicle.create({
      data: {
        companyId,
        name: createVehicleDto.name,
        type: createVehicleDto.type,
        category: createVehicleDto.category,
        asset: createVehicleDto.asset || null,
        doorNo: createVehicleDto.doorNo || null,
        plateNumber: createVehicleDto.plateNumber || null,
        plateNumberArabic: createVehicleDto.plateNumberArabic || null,
        chassisNo: createVehicleDto.chassisNo || null,
        sequenceNo: createVehicleDto.sequenceNo || null,
        engineModel: createVehicleDto.engineModel || null,
        equipmentNo: createVehicleDto.equipmentNo || null,
        equipmentType: createVehicleDto.equipmentType || null,
        horsePower: createVehicleDto.horsePower || null,
        manufacturingYear: createVehicleDto.manufacturingYear || null,
        make: createVehicleDto.make || null,
        model: createVehicleDto.model || null,
        engineSerialNo: createVehicleDto.engineSerialNo || null,
        status: createVehicleDto.status || 'Active',
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    companyId: string,
    type?: VehicleType,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (type) {
      where.type = type;
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { plateNumber: { contains: searchTerm, mode: 'insensitive' } },
        { doorNo: { contains: searchTerm, mode: 'insensitive' } },
        { asset: { contains: searchTerm, mode: 'insensitive' } },
        { chassisNo: { contains: searchTerm, mode: 'insensitive' } },
        { equipmentNo: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      results: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, companyId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID '${id}' not found`);
    }

    return vehicle;
  }

  async findByPlateNumber(plateNumber: string, companyId: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findFirst({
      where: { plateNumber, companyId },
    });
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto, userId: string, companyId: string): Promise<Vehicle> {
    const vehicle = await this.findOne(id, companyId);

    if (updateVehicleDto.plateNumber && updateVehicleDto.plateNumber !== vehicle.plateNumber) {
      const existingVehicle = await this.prisma.vehicle.findFirst({
        where: { plateNumber: updateVehicleDto.plateNumber, companyId, id: { not: id } },
      });

      if (existingVehicle) {
        throw new ConflictException(
          `Vehicle with plate number '${updateVehicleDto.plateNumber}' already exists`,
        );
      }
    }

    if (updateVehicleDto.asset && updateVehicleDto.asset !== vehicle.asset) {
      const existingVehicle = await this.prisma.vehicle.findFirst({
        where: { asset: updateVehicleDto.asset, companyId, id: { not: id } },
      });

      if (existingVehicle) {
        throw new ConflictException(
          `Vehicle with asset '${updateVehicleDto.asset}' already exists`,
        );
      }
    }

    const updateData: any = {
      updatedById: userId,
    };

    if (updateVehicleDto.name !== undefined) updateData.name = updateVehicleDto.name;
    if (updateVehicleDto.type !== undefined) updateData.type = updateVehicleDto.type;
    if (updateVehicleDto.category !== undefined) updateData.category = updateVehicleDto.category;
    if (updateVehicleDto.asset !== undefined) updateData.asset = updateVehicleDto.asset || null;
    if (updateVehicleDto.doorNo !== undefined) updateData.doorNo = updateVehicleDto.doorNo || null;
    if (updateVehicleDto.plateNumber !== undefined) updateData.plateNumber = updateVehicleDto.plateNumber || null;
    if (updateVehicleDto.plateNumberArabic !== undefined) updateData.plateNumberArabic = updateVehicleDto.plateNumberArabic || null;
    if (updateVehicleDto.chassisNo !== undefined) updateData.chassisNo = updateVehicleDto.chassisNo || null;
    if (updateVehicleDto.sequenceNo !== undefined) updateData.sequenceNo = updateVehicleDto.sequenceNo || null;
    if (updateVehicleDto.engineModel !== undefined) updateData.engineModel = updateVehicleDto.engineModel || null;
    if (updateVehicleDto.equipmentNo !== undefined) updateData.equipmentNo = updateVehicleDto.equipmentNo || null;
    if (updateVehicleDto.equipmentType !== undefined) updateData.equipmentType = updateVehicleDto.equipmentType || null;
    if (updateVehicleDto.horsePower !== undefined) updateData.horsePower = updateVehicleDto.horsePower || null;
    if (updateVehicleDto.manufacturingYear !== undefined) updateData.manufacturingYear = updateVehicleDto.manufacturingYear || null;
    if (updateVehicleDto.make !== undefined) updateData.make = updateVehicleDto.make || null;
    if (updateVehicleDto.model !== undefined) updateData.model = updateVehicleDto.model || null;
    if (updateVehicleDto.engineSerialNo !== undefined) updateData.engineSerialNo = updateVehicleDto.engineSerialNo || null;
    if (updateVehicleDto.status !== undefined) updateData.status = updateVehicleDto.status;

    return this.prisma.vehicle.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.prisma.vehicle.delete({
      where: { id },
    });
  }
}

