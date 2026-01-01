import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateCustomerRouteDto } from './dto/create-customer-route.dto';
import { Customer, CustomerRoute } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto, userId: string, companyId: string): Promise<Customer> {
    return this.prisma.customer.create({
      data: {
        companyId,
        name: createCustomerDto.name,
        nameArabic: createCustomerDto.nameArabic,
        buildingNo: createCustomerDto.buildingNo,
        secondaryNo: createCustomerDto.secondaryNo,
        street: createCustomerDto.street,
        streetArabic: createCustomerDto.streetArabic,
        district: createCustomerDto.district,
        districtArabic: createCustomerDto.districtArabic,
        postalCode: createCustomerDto.postalCode,
        country: createCustomerDto.country,
        city: createCustomerDto.city,
        crNo: createCustomerDto.crNo,
        crExpiryDate: createCustomerDto.crExpiryDate
          ? new Date(createCustomerDto.crExpiryDate)
          : null,
        vatNo: createCustomerDto.vatNo,
        nationalAddress: createCustomerDto.nationalAddress,
        crCertificate: createCustomerDto.crCertificate,
        vatCertificate: createCustomerDto.vatCertificate,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10, companyId: string) {
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: { companyId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              routes: true,
            },
          },
        },
      }),
      this.prisma.customer.count({ where: { companyId } }),
    ]);

    const customersWithRouteCount = customers.map((customer) => ({
      ...customer,
      routeCount: customer._count.routes,
    }));

    return {
      results: customersWithRouteCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<Customer> {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID '${id}' not found`);
    }

    return customer;
  }

  async findRoutes(customerId: string, companyId: string) {
    await this.findOne(customerId, companyId);

    const routes = await this.prisma.customerRoute.findMany({
      where: {
        customerId,
        companyId,
      },
      include: {
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
      },
      orderBy: [
        { from: { name: 'asc' } },
        { to: { name: 'asc' } },
      ],
    });

    return routes;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    userId: string,
    companyId: string,
  ): Promise<Customer> {
    await this.findOne(id, companyId);

    const updateData: any = {
      ...updateCustomerDto,
      updatedById: userId,
    };

    if (updateCustomerDto.crExpiryDate) {
      updateData.crExpiryDate = new Date(updateCustomerDto.crExpiryDate);
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.prisma.customer.delete({
      where: { id },
    });
  }

  async createRoute(
    customerId: string,
    createRouteDto: CreateCustomerRouteDto,
    userId: string,
    companyId: string,
  ): Promise<CustomerRoute> {
    await this.findOne(customerId, companyId);

    if (createRouteDto.fromId === createRouteDto.toId) {
      throw new BadRequestException('From and To locations cannot be the same');
    }

    const fromLocation = await this.prisma.location.findFirst({
      where: { id: createRouteDto.fromId, companyId },
    });

    if (!fromLocation) {
      throw new NotFoundException(`Location with ID '${createRouteDto.fromId}' not found`);
    }

    const toLocation = await this.prisma.location.findFirst({
      where: { id: createRouteDto.toId, companyId },
    });

    if (!toLocation) {
      throw new NotFoundException(`Location with ID '${createRouteDto.toId}' not found`);
    }

    const existingRoute = await this.prisma.customerRoute.findFirst({
      where: {
        customerId,
        companyId,
        fromId: createRouteDto.fromId,
        toId: createRouteDto.toId,
      },
    });

    if (existingRoute) {
      throw new BadRequestException('This route already exists for this customer');
    }

    return this.prisma.customerRoute.create({
      data: {
        companyId,
        customerId,
        fromId: createRouteDto.fromId,
        toId: createRouteDto.toId,
        createdById: userId,
        updatedById: userId,
      },
      include: {
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
      },
    });
  }

  async removeRoute(routeId: string, customerId: string, companyId: string): Promise<void> {
    await this.findOne(customerId, companyId);

    const route = await this.prisma.customerRoute.findFirst({
      where: {
        id: routeId,
        customerId,
        companyId,
      },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID '${routeId}' not found`);
    }

    await this.prisma.customerRoute.delete({
      where: { id: routeId },
    });
  }
}

