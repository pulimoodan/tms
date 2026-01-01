import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractRouteDto } from './dto/create-contract-route.dto';
import { UpdateContractRouteDto } from './dto/update-contract-route.dto';
import { ContractRoute } from '@prisma/client';

@Injectable()
export class ContractRoutesService {
  constructor(private prisma: PrismaService) {}

  async create(
    contractId: string,
    createRouteDto: CreateContractRouteDto,
    userId: string,
    companyId: string,
  ): Promise<ContractRoute> {
    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId, companyId },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID '${contractId}' not found`);
    }

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

    return this.prisma.contractRoute.create({
      data: {
        companyId,
        contractId: contractId,
        fromId: createRouteDto.fromId,
        toId: createRouteDto.toId,
        vehicleCategory: createRouteDto.vehicleCategory,
        price: createRouteDto.price,
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

  async findAll(contractId: string, companyId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId, companyId },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID '${contractId}' not found`);
    }

    const routes = await this.prisma.contractRoute.findMany({
      where: { contractId, companyId },
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
      orderBy: { createdAt: 'desc' },
    });

    return routes;
  }

  async findOne(id: string, companyId: string): Promise<ContractRoute> {
    const route = await this.prisma.contractRoute.findFirst({
      where: { id, companyId },
      include: {
        contract: {
          select: {
            id: true,
            contractNumber: true,
          },
        },
        from: true,
        to: true,
      },
    });

    if (!route) {
      throw new NotFoundException(`Contract route with ID '${id}' not found`);
    }

    return route;
  }

  async update(
    id: string,
    updateRouteDto: UpdateContractRouteDto,
    userId: string,
    companyId: string,
  ): Promise<ContractRoute> {
    const route = await this.findOne(id, companyId);

    if (updateRouteDto.fromId && updateRouteDto.toId) {
      if (updateRouteDto.fromId === updateRouteDto.toId) {
        throw new BadRequestException('From and To locations cannot be the same');
      }
    } else if (updateRouteDto.fromId && updateRouteDto.fromId === route.toId) {
      throw new BadRequestException('From and To locations cannot be the same');
    } else if (updateRouteDto.toId && updateRouteDto.toId === route.fromId) {
      throw new BadRequestException('From and To locations cannot be the same');
    }

    if (updateRouteDto.fromId) {
      const location = await this.prisma.location.findFirst({
        where: { id: updateRouteDto.fromId, companyId },
      });

      if (!location) {
        throw new NotFoundException(`Location with ID '${updateRouteDto.fromId}' not found`);
      }
    }

    if (updateRouteDto.toId) {
      const location = await this.prisma.location.findFirst({
        where: { id: updateRouteDto.toId, companyId },
      });

      if (!location) {
        throw new NotFoundException(`Location with ID '${updateRouteDto.toId}' not found`);
      }
    }

    const updateData: any = {
      updatedById: userId,
    };

    if (updateRouteDto.fromId !== undefined) updateData.fromId = updateRouteDto.fromId;
    if (updateRouteDto.toId !== undefined) updateData.toId = updateRouteDto.toId;
    if (updateRouteDto.vehicleCategory !== undefined) updateData.vehicleCategory = updateRouteDto.vehicleCategory;
    if (updateRouteDto.price !== undefined) updateData.price = updateRouteDto.price;

    return this.prisma.contractRoute.update({
      where: { id },
      data: updateData,
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

  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.prisma.contractRoute.delete({
      where: { id },
    });
  }
}
