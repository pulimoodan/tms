import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCreditTermDto } from './dto/create-credit-term.dto';
import { UpdateCreditTermDto } from './dto/update-credit-term.dto';
import { CreditTerm } from '@prisma/client';

@Injectable()
export class CreditTermsService {
  constructor(private prisma: PrismaService) {}

  async create(createCreditTermDto: CreateCreditTermDto, userId: string, companyId: string): Promise<CreditTerm> {
    const existingCreditTerm = await this.prisma.creditTerm.findFirst({
      where: { name: createCreditTermDto.name, companyId },
    });

    if (existingCreditTerm) {
      throw new ConflictException(
        `Credit term with name '${createCreditTermDto.name}' already exists`,
      );
    }

    return this.prisma.creditTerm.create({
      data: {
        companyId,
        name: createCreditTermDto.name,
        description: createCreditTermDto.description,
        paymentDays: createCreditTermDto.paymentDays,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10, companyId: string) {
    const skip = (page - 1) * limit;

    const [creditTerms, total] = await Promise.all([
      this.prisma.creditTerm.findMany({
        where: { companyId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.creditTerm.count({ where: { companyId } }),
    ]);

    return {
      results: creditTerms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<CreditTerm> {
    const creditTerm = await this.prisma.creditTerm.findFirst({
      where: { id, companyId },
    });

    if (!creditTerm) {
      throw new NotFoundException(`Credit term with ID '${id}' not found`);
    }

    return creditTerm;
  }

  async update(
    id: string,
    updateCreditTermDto: UpdateCreditTermDto,
    userId: string,
    companyId: string,
  ): Promise<CreditTerm> {
    const creditTerm = await this.findOne(id, companyId);

    if (updateCreditTermDto.name && updateCreditTermDto.name !== creditTerm.name) {
      const existingCreditTerm = await this.prisma.creditTerm.findFirst({
        where: { name: updateCreditTermDto.name, companyId, id: { not: id } },
      });

      if (existingCreditTerm) {
        throw new ConflictException(
          `Credit term with name '${updateCreditTermDto.name}' already exists`,
        );
      }
    }

    return this.prisma.creditTerm.update({
      where: { id },
      data: {
        ...updateCreditTermDto,
        updatedById: userId,
      },
    });
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.findOne(id, companyId);

    await this.prisma.creditTerm.delete({
      where: { id },
    });
  }
}
