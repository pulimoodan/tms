import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Contract } from '@prisma/client';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async create(createContractDto: CreateContractDto, userId: string, companyId: string): Promise<Contract> {
    const existingContract = await this.prisma.contract.findFirst({
      where: { contractNumber: createContractDto.contractNumber, companyId },
    });

    if (existingContract) {
      throw new ConflictException(
        `Contract with number '${createContractDto.contractNumber}' already exists`,
      );
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id: createContractDto.customerId, companyId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID '${createContractDto.customerId}' not found`);
    }

    const creditTerm = await this.prisma.creditTerm.findFirst({
      where: { id: createContractDto.creditTermId, companyId },
    });

    if (!creditTerm) {
      throw new NotFoundException(`Credit term with ID '${createContractDto.creditTermId}' not found`);
    }

    const startDate = new Date(createContractDto.startDate);
    const endDate = new Date(createContractDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    return this.prisma.contract.create({
      data: {
        companyId,
        customerId: createContractDto.customerId,
        contractNumber: createContractDto.contractNumber,
        startDate,
        endDate,
        creditTermId: createContractDto.creditTermId,
        material: createContractDto.material,
        maxWaitingHours: createContractDto.maxWaitingHours,
        waitingCharge: createContractDto.waitingCharge,
        bankGuarantee: createContractDto.bankGuarantee || false,
        insurance: createContractDto.insurance || false,
        status: createContractDto.status || 'Draft',
        createdById: userId,
        updatedById: userId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            nameArabic: true,
          },
        },
        creditTerm: {
          select: {
            id: true,
            name: true,
            paymentDays: true,
          },
        },
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10, companyId: string) {
    const skip = (page - 1) * limit;

    const [contracts, total] = await Promise.all([
      this.prisma.contract.findMany({
        where: { companyId },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          creditTerm: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: { routes: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contract.count({ where: { companyId } }),
    ]);

    return {
      results: contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<Contract> {
    const contract = await this.prisma.contract.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        creditTerm: true,
        routes: {
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
        },
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID '${id}' not found`);
    }

    return contract;
  }

  async update(id: string, updateContractDto: UpdateContractDto, userId: string, companyId: string): Promise<Contract> {
    const contract = await this.findOne(id, companyId);

    if (updateContractDto.contractNumber && updateContractDto.contractNumber !== contract.contractNumber) {
      const existingContract = await this.prisma.contract.findFirst({
        where: { contractNumber: updateContractDto.contractNumber, companyId },
      });

      if (existingContract) {
        throw new ConflictException(
          `Contract with number '${updateContractDto.contractNumber}' already exists`,
        );
      }
    }

    if (updateContractDto.customerId && updateContractDto.customerId !== contract.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: updateContractDto.customerId, companyId },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID '${updateContractDto.customerId}' not found`);
      }
    }

    if (updateContractDto.creditTermId && updateContractDto.creditTermId !== contract.creditTermId) {
      const creditTerm = await this.prisma.creditTerm.findFirst({
        where: { id: updateContractDto.creditTermId, companyId },
      });

      if (!creditTerm) {
        throw new NotFoundException(`Credit term with ID '${updateContractDto.creditTermId}' not found`);
      }
    }

    const updateData: any = {
      ...updateContractDto,
      updatedById: userId,
    };

    if (updateContractDto.startDate) {
      updateData.startDate = new Date(updateContractDto.startDate);
    }

    if (updateContractDto.endDate) {
      updateData.endDate = new Date(updateContractDto.endDate);
    }

    if (updateContractDto.startDate && updateContractDto.endDate) {
      const startDate = new Date(updateContractDto.startDate);
      const endDate = new Date(updateContractDto.endDate);
      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    return this.prisma.contract.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        creditTerm: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.prisma.contract.delete({
      where: { id },
    });
  }
}

