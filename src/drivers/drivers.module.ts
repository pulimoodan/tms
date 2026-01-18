import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { DriversMobileController } from './drivers-mobile.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DriversController, DriversMobileController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
