import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
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
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10, companyId: string) {
    const skip = (page - 1) * limit;

    const [drivers, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: { companyId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where: { companyId } }),
    ]);

    return {
      results: drivers,
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

    return this.prisma.driver.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.prisma.driver.delete({
      where: { id },
    });
  }
}
