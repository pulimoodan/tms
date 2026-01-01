import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID '${id}' not found`);
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, userId: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID '${id}' not found`);
    }

    if (updateCompanyDto.crNo && updateCompanyDto.crNo !== company.crNo) {
      const existingCompany = await this.prisma.company.findUnique({
        where: { crNo: updateCompanyDto.crNo },
      });

      if (existingCompany && existingCompany.id !== id) {
        throw new ConflictException(`Company with CR number '${updateCompanyDto.crNo}' already exists`);
      }
    }

    const updateData: any = {
      ...updateCompanyDto,
      updatedById: userId,
    };

    if (updateCompanyDto.crExpiryDate) {
      updateData.crExpiryDate = new Date(updateCompanyDto.crExpiryDate);
    }

    return await this.prisma.company.update({
      where: { id },
      data: updateData,
    });
  }
}

