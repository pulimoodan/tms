import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Driver } from '@prisma/client';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDriverDto: CreateDriverDto,
    userId: string,
    companyId: string,
  ): Promise<Driver> {
    const existingDriver = await this.prisma.driver.findFirst({
      where: { iqamaNumber: createDriverDto.iqamaNumber, companyId },
    });

    if (existingDriver) {
      throw new ConflictException(
        `Driver with iqama number '${createDriverDto.iqamaNumber}' already exists`,
      );
    }

    // Validate vehicle if provided - must be Vehicle type only
    if (createDriverDto.vehicleId) {
      const vehicle = await this.prisma.vehicle.findFirst({
        where: { id: createDriverDto.vehicleId, companyId },
      });

      if (!vehicle) {
        throw new NotFoundException(`Vehicle with ID '${createDriverDto.vehicleId}' not found`);
      }

      if (vehicle.type !== 'Vehicle') {
        throw new BadRequestException(
          'Only Vehicle type can be assigned to driver. Attachments, Equipment, and Accessories cannot be assigned.',
        );
      }

      // Check if vehicle is already assigned to another driver
      const existingDriverWithVehicle = await this.prisma.driver.findFirst({
        where: { vehicleId: createDriverDto.vehicleId, companyId, id: { not: createDriverDto.vehicleId } },
      });

      if (existingDriverWithVehicle) {
        throw new ConflictException('This vehicle is already assigned to another driver');
      }
    }

    return this.prisma.driver.create({
      data: {
        companyId,
        badgeNo: createDriverDto.badgeNo || null,
        name: createDriverDto.name,
        iqamaNumber: createDriverDto.iqamaNumber,
        position: createDriverDto.position || null,
        sponsorship: createDriverDto.sponsorship || null,
        nationality: createDriverDto.nationality,
        driverCardExpiry: createDriverDto.driverCardExpiry
          ? new Date(createDriverDto.driverCardExpiry)
          : null,
        mobile: createDriverDto.mobile || null,
        preferredLanguage: createDriverDto.preferredLanguage || null,
        ownershipType: createDriverDto.ownershipType || 'CompanyOwned',
        outsourcedCompanyName: createDriverDto.outsourcedCompanyName || null,
        status: createDriverDto.status || 'Active',
        taamId: createDriverDto.taamId || null,
        vehicleId: createDriverDto.vehicleId || null,
        createdById: userId,
        updatedById: userId,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            plateNumber: true,
          },
        },
      },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    companyId: string,
    excludeOrderId?: string, // Exclude drivers assigned to pending orders, except this order (for edit mode)
  ) {
    const skip = (page - 1) * limit;

    // Find drivers assigned to pending orders
    const pendingOrders = await this.prisma.order.findMany({
      where: {
        companyId,
        status: 'InProgress',
        ...(excludeOrderId ? { id: { not: excludeOrderId } } : {}),
      },
      select: {
        driverId: true,
      },
    });

    const inUseDriverIds = pendingOrders
      .map((order) => order.driverId)
      .filter((id): id is string => id !== null);

    const where: any = {
      companyId,
      // Don't exclude - allow all drivers to be shown, but mark them as in use
    };

    const [drivers, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where }),
    ]);

    // Mark drivers as in use
    const driversWithInUseFlag = drivers.map((driver) => ({
      ...driver,
      isInUse: inUseDriverIds.includes(driver.id),
    }));

    return {
      results: driversWithInUseFlag,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<Driver> {
    const driver = await this.prisma.driver.findFirst({
      where: { id, companyId },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            plateNumber: true,
            type: true,
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID '${id}' not found`);
    }

    return driver;
  }

  async findByIqamaNumber(iqamaNumber: string, companyId: string): Promise<Driver | null> {
    return this.prisma.driver.findFirst({
      where: { iqamaNumber, companyId },
    });
  }

  async update(
    id: string,
    updateDriverDto: UpdateDriverDto,
    userId: string,
    companyId: string,
  ): Promise<Driver> {
    const driver = await this.findOne(id, companyId);

    if (updateDriverDto.iqamaNumber && updateDriverDto.iqamaNumber !== driver.iqamaNumber) {
      const existingDriver = await this.prisma.driver.findFirst({
        where: { iqamaNumber: updateDriverDto.iqamaNumber, companyId, id: { not: id } },
      });

      if (existingDriver) {
        throw new ConflictException(
          `Driver with iqama number '${updateDriverDto.iqamaNumber}' already exists`,
        );
      }
    }

    const updateData: any = {
      updatedById: userId,
    };

    if (updateDriverDto.badgeNo !== undefined) {
      updateData.badgeNo = updateDriverDto.badgeNo || null;
    }
    if (updateDriverDto.name !== undefined) {
      updateData.name = updateDriverDto.name;
    }
    if (updateDriverDto.iqamaNumber !== undefined) {
      updateData.iqamaNumber = updateDriverDto.iqamaNumber;
    }
    if (updateDriverDto.position !== undefined) {
      updateData.position = updateDriverDto.position || null;
    }
    if (updateDriverDto.sponsorship !== undefined) {
      updateData.sponsorship = updateDriverDto.sponsorship || null;
    }
    if (updateDriverDto.nationality !== undefined) {
      updateData.nationality = updateDriverDto.nationality;
    }
    if (updateDriverDto.driverCardExpiry !== undefined) {
      updateData.driverCardExpiry = updateDriverDto.driverCardExpiry
        ? new Date(updateDriverDto.driverCardExpiry)
        : null;
    }
    if (updateDriverDto.mobile !== undefined) {
      updateData.mobile = updateDriverDto.mobile || null;
    }
    if (updateDriverDto.preferredLanguage !== undefined) {
      updateData.preferredLanguage = updateDriverDto.preferredLanguage || null;
    }
    if (updateDriverDto.ownershipType !== undefined) {
      updateData.ownershipType = updateDriverDto.ownershipType;
    }
    if (updateDriverDto.outsourcedCompanyName !== undefined) {
      updateData.outsourcedCompanyName = updateDriverDto.outsourcedCompanyName || null;
    }
    if (updateDriverDto.status !== undefined) {
      updateData.status = updateDriverDto.status;
    }
    if (updateDriverDto.taamId !== undefined) {
      updateData.taamId = updateDriverDto.taamId || null;
    }
    if (updateDriverDto.vehicleId !== undefined) {
      if (updateDriverDto.vehicleId) {
        // Validate vehicle if provided - must be Vehicle type only
        const vehicle = await this.prisma.vehicle.findFirst({
          where: { id: updateDriverDto.vehicleId, companyId },
        });

        if (!vehicle) {
          throw new NotFoundException(`Vehicle with ID '${updateDriverDto.vehicleId}' not found`);
        }

        if (vehicle.type !== 'Vehicle') {
          throw new BadRequestException(
            'Only Vehicle type can be assigned to driver. Attachments, Equipment, and Accessories cannot be assigned.',
          );
        }

        // Check if vehicle is already assigned to another driver
        const existingDriverWithVehicle = await this.prisma.driver.findFirst({
          where: { vehicleId: updateDriverDto.vehicleId, companyId, id: { not: id } },
        });

        if (existingDriverWithVehicle) {
          throw new ConflictException('This vehicle is already assigned to another driver');
        }
      }
      updateData.vehicleId = updateDriverDto.vehicleId || null;
    }

    return this.prisma.driver.update({
      where: { id },
      data: updateData,
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            plateNumber: true,
            type: true,
          },
        },
      },
    });
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.prisma.driver.delete({
      where: { id },
    });
  }

  // Mobile app specific methods
  async getDriverOrders(driverId: string, companyId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        driverId,
        companyId,
        status: {
          in: ['Pending', 'InProgress', 'Dispatched'],
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            nameArabic: true,
          },
        },
        from: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        to: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            plateNumber: true,
          },
        },
        cargoItems: {
          select: {
            id: true,
            description: true,
            weight: true,
            sequence: true,
          },
          orderBy: {
            sequence: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      orders,
      pagination: {
        page: 1,
        limit: orders.length,
        total: orders.length,
        totalPages: 1,
      },
    };
  }

  async getDriverOrderDetails(orderId: string, driverId: string, companyId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        driverId,
        companyId,
      },
      include: {
        customer: true,
        from: true,
        to: true,
        vehicle: true,
        attachment: {
          select: {
            id: true,
            name: true,
            plateNumber: true,
          },
        },
        accessories: {
          select: {
            id: true,
            name: true,
            plateNumber: true,
          },
        },
        cargoItems: {
          orderBy: {
            sequence: 'asc',
          },
        },
        contract: {
          select: {
            id: true,
            contractNumber: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found or not assigned to this driver');
    }

    return order;
  }

  async updateLocation(
    driverId: string,
    companyId: string,
    updateLocationDto: UpdateLocationDto,
  ) {
    // Verify driver exists and belongs to company
    const driver = await this.findOne(driverId, companyId);

    // Update driver's last location
    await this.prisma.driver.update({
      where: { id: driverId },
      data: {
        lastLocationLat: updateLocationDto.latitude,
        lastLocationLng: updateLocationDto.longitude,
        lastLocationAt: new Date(),
      },
    });

    // Store location history
    const location = await this.prisma.driverLocation.create({
      data: {
        driverId,
        orderId: updateLocationDto.orderId || null,
        latitude: updateLocationDto.latitude,
        longitude: updateLocationDto.longitude,
        accuracy: updateLocationDto.accuracy || null,
        heading: updateLocationDto.heading || null,
        speed: updateLocationDto.speed || null,
      },
    });

    return location;
  }

  async updateFcmToken(driverId: string, fcmToken: string) {
    await this.prisma.driver.update({
      where: { id: driverId },
      data: {
        fcmToken,
      },
    });
  }
}
