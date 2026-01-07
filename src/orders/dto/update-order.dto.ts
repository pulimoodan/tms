import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsNumber, IsString, IsOptional, Min, IsArray } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateOrderDto {
  @ApiPropertyOptional({ example: 'uuid-here', description: 'Customer ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ example: 'uuid-here', description: 'Contract ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  contractId?: string;

  @ApiPropertyOptional({ example: 'uuid-here', description: 'From location ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  fromId?: string;

  @ApiPropertyOptional({ example: 'uuid-here', description: 'To location ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  toId?: string;

  @ApiPropertyOptional({ example: 5000.5, description: 'Weight in kg', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 10.5, description: 'Volume in cubic meters', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ example: 50000.0, description: 'Consignment value in SAR', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  value?: number;

  @ApiPropertyOptional({ example: 'uuid-here', description: 'Vehicle ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @ApiPropertyOptional({ example: 'uuid-here', description: 'Attachment ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  attachmentId?: string;

  @ApiPropertyOptional({
    example: ['uuid-here-1', 'uuid-here-2'],
    description: 'Array of Accessory IDs',
    type: [String],
    format: 'uuid',
  })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  accessoryIds?: string[];

  @ApiPropertyOptional({ example: 'uuid-here', description: 'Driver ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  driverId?: string;

  @ApiPropertyOptional({
    example: 'Dispatched',
    description: 'Order status',
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ example: 'CW/002652/1', description: 'Trip number' })
  @IsOptional()
  @IsString()
  tripNumber?: string;

  @ApiPropertyOptional({ example: 'General Cargo', description: 'Cargo description' })
  @IsOptional()
  @IsString()
  cargoDescription?: string;

  @ApiPropertyOptional({ example: 'SEAL123456', description: 'Seal number' })
  @IsOptional()
  @IsString()
  sealNumber?: string;

  @ApiPropertyOptional({ example: 0, description: 'Start kilometers', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  startKms?: number;

  @ApiPropertyOptional({ example: 100, description: 'Kilometers out', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  kmOut?: number;

  @ApiPropertyOptional({ example: 500, description: 'Kilometers in', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  kmIn?: number;

  @ApiPropertyOptional({ example: 400, description: 'Run kilometers', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  runKm?: number;

  @ApiPropertyOptional({
    example: '2025-12-03T00:00:00Z',
    description: 'Estimated time of arrival',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  eta?: string;

  @ApiPropertyOptional({
    example: '2025-10-28',
    description: 'Requested date',
    type: 'string',
    format: 'date',
  })
  @IsOptional()
  @IsString()
  requestedDate?: string;

  @ApiPropertyOptional({ example: '08:00', description: 'Requested time' })
  @IsOptional()
  @IsString()
  requestedTime?: string;

  @ApiPropertyOptional({
    example: '2025-10-28T08:00:00Z',
    description: 'Arrival at loading point',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  arrivalAtLoading?: string;

  @ApiPropertyOptional({
    example: '2025-10-28T10:00:00Z',
    description: 'Completed loading',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  completedLoading?: string;

  @ApiPropertyOptional({
    example: '2025-10-28T10:30:00Z',
    description: 'Dispatch from loading point',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  dispatchFromLoading?: string;

  @ApiPropertyOptional({
    example: '2025-10-29T08:00:00Z',
    description: 'Arrival at offloading point',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  arrivalAtOffloading?: string;

  @ApiPropertyOptional({
    example: '2025-10-29T10:00:00Z',
    description: 'Completed unloading',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsString()
  completedUnloading?: string;

  @ApiPropertyOptional({ example: 'All items in good condition', description: 'Remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    example: 'Good',
    description: 'Recipient acknowledgment',
    enum: ['Good', 'Fully Received', 'Broken', 'Partially'],
  })
  @IsOptional()
  @IsString()
  recipientAcknowledgment?: string;

  @ApiPropertyOptional({ example: '808697556', description: 'Booking number' })
  @IsOptional()
  @IsString()
  bookingNumber?: string;

  @ApiPropertyOptional({ example: 'TBN', description: 'Vessel name' })
  @IsOptional()
  @IsString()
  vesselName?: string;

  @ApiPropertyOptional({ example: 'JED500366300', description: 'CRO number' })
  @IsOptional()
  @IsString()
  croNumber?: string;

  @ApiPropertyOptional({
    example: 'AMG.104127_CHUBB_ARABIA_COOPERATIVE_INSURANCE_CO',
    description: 'Customer contact',
  })
  @IsOptional()
  @IsString()
  customerContact?: string;

  @ApiPropertyOptional({ example: 'Transporter Name', description: 'Transporter' })
  @IsOptional()
  @IsString()
  transporter?: string;

  @ApiPropertyOptional({ example: 'JEDDAH', description: 'Port of loading' })
  @IsOptional()
  @IsString()
  portOfLoading?: string;

  @ApiPropertyOptional({ example: 'PCIU', description: 'Shipping line' })
  @IsOptional()
  @IsString()
  shippingLine?: string;

  @ApiPropertyOptional({ example: 'CONTAINER123456', description: 'Container number' })
  @IsOptional()
  @IsString()
  containerNumber?: string;

  @ApiPropertyOptional({ example: '40 Ft', description: 'Container size' })
  @IsOptional()
  @IsString()
  containerSize?: string;

  @ApiPropertyOptional({
    example: 'TON',
    description: 'Weight unit of measure',
    enum: ['TON', 'KG', 'LB'],
  })
  @IsOptional()
  @IsString()
  weightUom?: string;

  @ApiPropertyOptional({ example: 30.0, description: 'Tare weight', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  tareWeight?: number;

  @ApiPropertyOptional({ example: 'TRAILER123', description: 'Trailer number' })
  @IsOptional()
  @IsString()
  trailerNumber?: string;
}
