import { Module } from '@nestjs/common';
import { CreditTermsService } from './credit-terms.service';
import { CreditTermsController } from './credit-terms.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CreditTermsController],
  providers: [CreditTermsService],
  exports: [CreditTermsService],
})
export class CreditTermsModule {}
