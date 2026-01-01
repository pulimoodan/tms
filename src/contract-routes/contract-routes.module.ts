import { Module } from '@nestjs/common';
import { ContractRoutesService } from './contract-routes.service';
import { ContractRoutesController } from './contract-routes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContractRoutesController],
  providers: [ContractRoutesService],
  exports: [ContractRoutesService],
})
export class ContractRoutesModule {}

