import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { CreditTermsModule } from './credit-terms/credit-terms.module';
import { LocationsModule } from './locations/locations.module';
// import { VehicleTypesModule } from './vehicle-types/vehicle-types.module';
import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { CustomersModule } from './customers/customers.module';
import { ContractsModule } from './contracts/contracts.module';
import { ContractRoutesModule } from './contract-routes/contract-routes.module';
import { OrdersModule } from './orders/orders.module';
import { CompaniesModule } from './companies/companies.module';
import { UploadModule } from './upload/upload.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    RolesModule,
    AuthModule,
    CreditTermsModule,
    LocationsModule,
    // VehicleTypesModule, // Removed - using enum instead
    DriversModule,
    VehiclesModule,
    CustomersModule,
    ContractsModule,
    ContractRoutesModule,
    OrdersModule,
    CompaniesModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
