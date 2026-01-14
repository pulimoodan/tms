import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Update vehicle status based on active orders
   * Sets vehicle to 'OnTrip' if it has any InProgress orders, otherwise sets to 'Active'
   */
  private async updateVehicleStatus(vehicleId: string | null, companyId: string): Promise<void> {
    if (!vehicleId) return;

    const hasActiveOrders = await this.prisma.order.findFirst({
      where: {
        companyId,
        vehicleId,
        status: 'InProgress',
      },
    });

    await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: hasActiveOrders ? 'OnTrip' : 'Active',
      },
    });
  }

  /**
   * Update attachment status based on active orders
   */
  private async updateAttachmentStatus(attachmentId: string | null, companyId: string): Promise<void> {
    if (!attachmentId) return;

    const hasActiveOrders = await this.prisma.order.findFirst({
      where: {
        companyId,
        attachmentId,
        status: 'InProgress',
      },
    });

    await this.prisma.vehicle.update({
      where: { id: attachmentId },
      data: {
        status: hasActiveOrders ? 'OnTrip' : 'Active',
      },
    });
  }

  private async generateOrderNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const prefix = `AFWB-${year}-`;

    const lastOrder = await this.prisma.order.findFirst({
      where: {
        companyId,
        orderNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNo.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(5, '0')}`;
  }

  async create(createOrderDto: CreateOrderDto, userId: string, companyId: string): Promise<Order> {
    if (createOrderDto.fromId === createOrderDto.toId) {
      throw new BadRequestException('From and To locations cannot be the same');
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id: createOrderDto.customerId, companyId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID '${createOrderDto.customerId}' not found`);
    }

    if (createOrderDto.contractId) {
      const contract = await this.prisma.contract.findFirst({
        where: { id: createOrderDto.contractId, companyId },
      });

      if (!contract) {
        throw new NotFoundException(`Contract with ID '${createOrderDto.contractId}' not found`);
      }
    }

    const fromLocation = await this.prisma.location.findFirst({
      where: { id: createOrderDto.fromId, companyId },
    });

    if (!fromLocation) {
      throw new NotFoundException(`Location with ID '${createOrderDto.fromId}' not found`);
    }

    const toLocation = await this.prisma.location.findFirst({
      where: { id: createOrderDto.toId, companyId },
    });

    if (!toLocation) {
      throw new NotFoundException(`Location with ID '${createOrderDto.toId}' not found`);
    }

    const customerRoutesCount = await this.prisma.customerRoute.count({
      where: {
        customerId: createOrderDto.customerId,
        companyId,
      },
    });

    if (customerRoutesCount > 0) {
      const customerRoute = await this.prisma.customerRoute.findFirst({
        where: {
          customerId: createOrderDto.customerId,
          companyId,
          fromId: createOrderDto.fromId,
          toId: createOrderDto.toId,
        },
      });

      if (!customerRoute) {
        throw new BadRequestException(
          `Route from ${fromLocation.name} to ${toLocation.name} is not available for this customer`,
        );
      }
    }

    // Track duplicated resources (but allow creation)
    const duplicatedResources: string[] = [];
    let duplicationNotes = '';

    if (createOrderDto.vehicleId) {
      const vehicle = await this.prisma.vehicle.findFirst({
        where: { id: createOrderDto.vehicleId, companyId },
      });

      if (!vehicle) {
        throw new NotFoundException(`Vehicle with ID '${createOrderDto.vehicleId}' not found`);
      }

      // Check if vehicle is already assigned to an in-progress order
      const pendingOrderWithVehicle = await this.prisma.order.findFirst({
        where: {
          companyId,
          vehicleId: createOrderDto.vehicleId,
          status: 'InProgress',
        },
      });

      if (pendingOrderWithVehicle) {
        duplicatedResources.push(
          `Vehicle (${vehicle.name || vehicle.plateNumber || vehicle.asset || 'N/A'})`,
        );
        duplicationNotes += `Vehicle is already assigned to order ${pendingOrderWithVehicle.orderNo}. `;
      }
    }

    if (createOrderDto.driverId) {
      const driver = await this.prisma.driver.findFirst({
        where: { id: createOrderDto.driverId, companyId },
      });

      if (!driver) {
        throw new NotFoundException(`Driver with ID '${createOrderDto.driverId}' not found`);
      }

      // Check if driver is already assigned to an in-progress order
      const pendingOrderWithDriver = await this.prisma.order.findFirst({
        where: {
          companyId,
          driverId: createOrderDto.driverId,
          status: 'InProgress',
        },
      });

      if (pendingOrderWithDriver) {
        duplicatedResources.push(`Driver (${driver.name})`);
        duplicationNotes += `Driver is already assigned to order ${pendingOrderWithDriver.orderNo}. `;
      }
    }

    if (createOrderDto.attachmentId) {
      // Check if attachment is already assigned to an in-progress order
      const pendingOrderWithAttachment = await this.prisma.order.findFirst({
        where: {
          companyId,
          attachmentId: createOrderDto.attachmentId,
          status: 'InProgress',
        },
      });

      if (pendingOrderWithAttachment) {
        const attachment = await this.prisma.vehicle.findFirst({
          where: { id: createOrderDto.attachmentId, companyId },
        });
        duplicatedResources.push(
          `Attachment (${attachment?.name || attachment?.plateNumber || attachment?.asset || 'N/A'})`,
        );
        duplicationNotes += `Attachment is already assigned to order ${pendingOrderWithAttachment.orderNo}. `;
      }
    }

    if (createOrderDto.accessoryIds && createOrderDto.accessoryIds.length > 0) {
      const accessories = await this.prisma.vehicle.findMany({
        where: {
          id: { in: createOrderDto.accessoryIds },
          companyId,
          type: 'Accessory',
        },
      });

      if (accessories.length !== createOrderDto.accessoryIds.length) {
        const foundIds = accessories.map((a) => a.id);
        const missingIds = createOrderDto.accessoryIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(
          `One or more accessories not found or not of type Accessory: ${missingIds.join(', ')}`,
        );
      }

      // Check for duplicated accessories
      for (const accessory of accessories) {
        const pendingOrderWithAccessory = await this.prisma.order.findFirst({
          where: {
            companyId,
            status: 'InProgress',
            accessories: {
              some: {
                id: accessory.id,
              },
            },
          },
        });

        if (pendingOrderWithAccessory) {
          duplicatedResources.push(
            `Accessory (${accessory.name || accessory.plateNumber || 'N/A'})`,
          );
          duplicationNotes += `Accessory is already assigned to order ${pendingOrderWithAccessory.orderNo}. `;
        }
      }
    }

    const orderNo = await this.generateOrderNumber(companyId);

    const order = await this.prisma.order.create({
      data: {
        companyId,
        orderNo,
        customerId: createOrderDto.customerId,
        contractId: createOrderDto.contractId,
        fromId: createOrderDto.fromId,
        toId: createOrderDto.toId,
        weight: createOrderDto.weight,
        volume: createOrderDto.volume,
        value: createOrderDto.value,
        vehicleId: createOrderDto.vehicleId,
        attachmentId: createOrderDto.attachmentId || null,
        driverId: createOrderDto.driverId,
        status: 'InProgress',
        tripNumber: createOrderDto.tripNumber || null,
        cargoDescription: createOrderDto.cargoDescription || null,
        sealNumber: createOrderDto.sealNumber || null,
        startKms: createOrderDto.startKms,
        kmOut: createOrderDto.kmOut ?? null,
        kmIn: createOrderDto.kmIn ?? null,
        runKm: createOrderDto.runKm ?? null,
        eta: createOrderDto.eta && createOrderDto.eta.trim() ? new Date(createOrderDto.eta) : null,
        requestedDate:
          createOrderDto.requestedDate && createOrderDto.requestedDate.trim()
            ? new Date(createOrderDto.requestedDate)
            : null,
        requestedTime:
          createOrderDto.requestedTime && createOrderDto.requestedTime.trim()
            ? createOrderDto.requestedTime
            : null,
        arrivalAtLoading:
          createOrderDto.arrivalAtLoading && createOrderDto.arrivalAtLoading.trim()
            ? new Date(createOrderDto.arrivalAtLoading)
            : null,
        completedLoading:
          createOrderDto.completedLoading && createOrderDto.completedLoading.trim()
            ? new Date(createOrderDto.completedLoading)
            : null,
        dispatchFromLoading:
          createOrderDto.dispatchFromLoading && createOrderDto.dispatchFromLoading.trim()
            ? new Date(createOrderDto.dispatchFromLoading)
            : null,
        arrivalAtOffloading:
          createOrderDto.arrivalAtOffloading && createOrderDto.arrivalAtOffloading.trim()
            ? new Date(createOrderDto.arrivalAtOffloading)
            : null,
        completedUnloading:
          createOrderDto.completedUnloading && createOrderDto.completedUnloading.trim()
            ? new Date(createOrderDto.completedUnloading)
            : null,
        remarks:
          createOrderDto.remarks && createOrderDto.remarks.trim() ? createOrderDto.remarks : null,
        recipientAcknowledgment:
          createOrderDto.recipientAcknowledgment && createOrderDto.recipientAcknowledgment.trim()
            ? createOrderDto.recipientAcknowledgment
            : null,
        bookingNumber:
          createOrderDto.bookingNumber && createOrderDto.bookingNumber.trim()
            ? createOrderDto.bookingNumber
            : null,
        vesselName:
          createOrderDto.vesselName && createOrderDto.vesselName.trim()
            ? createOrderDto.vesselName
            : null,
        croNumber:
          createOrderDto.croNumber && createOrderDto.croNumber.trim()
            ? createOrderDto.croNumber
            : null,
        customerContact:
          createOrderDto.customerContact && createOrderDto.customerContact.trim()
            ? createOrderDto.customerContact
            : null,
        transporter:
          createOrderDto.transporter && createOrderDto.transporter.trim()
            ? createOrderDto.transporter
            : null,
        portOfLoading:
          createOrderDto.portOfLoading && createOrderDto.portOfLoading.trim()
            ? createOrderDto.portOfLoading
            : null,
        shippingLine:
          createOrderDto.shippingLine && createOrderDto.shippingLine.trim()
            ? createOrderDto.shippingLine
            : null,
        containerNumber:
          createOrderDto.containerNumber && createOrderDto.containerNumber.trim()
            ? createOrderDto.containerNumber
            : null,
        containerSize:
          createOrderDto.containerSize && createOrderDto.containerSize.trim()
            ? createOrderDto.containerSize
            : null,
        weightUom:
          createOrderDto.weightUom && createOrderDto.weightUom.trim()
            ? createOrderDto.weightUom
            : null,
        tareWeight: createOrderDto.tareWeight ?? null,
        trailerNumber:
          createOrderDto.trailerNumber && createOrderDto.trailerNumber.trim()
            ? createOrderDto.trailerNumber
            : null,
        temperature:
          createOrderDto.temperature && createOrderDto.temperature.trim()
            ? createOrderDto.temperature
            : null,
        hasDuplicatedResources: duplicatedResources.length > 0,
        duplicationNotes: duplicationNotes.trim() || null,
        accessories:
          createOrderDto.accessoryIds && createOrderDto.accessoryIds.length > 0
            ? {
                connect: createOrderDto.accessoryIds.map((id) => ({ id })),
              }
            : undefined,
        cargoItems: (() => {
          // Handle cargoItems array if provided
          if (createOrderDto.cargoItems && createOrderDto.cargoItems.length > 0) {
            return {
              create: createOrderDto.cargoItems.map((item, index) => ({
                description: item.description || '',
                weight: item.weight ? new Prisma.Decimal(item.weight) : null,
                weightUom: item.weightUom || 'TON',
                volume: item.volume ? new Prisma.Decimal(item.volume) : null,
                value: item.value ? new Prisma.Decimal(item.value) : null,
                sequence: index,
              })),
            };
          }
          // Fallback to single cargo for backward compatibility
          if (createOrderDto.cargoDescription) {
            return {
              create: [
                {
                  description: createOrderDto.cargoDescription,
                  weight: createOrderDto.weight ? new Prisma.Decimal(createOrderDto.weight) : null,
                  weightUom: createOrderDto.weightUom || 'TON',
                  volume: createOrderDto.volume ? new Prisma.Decimal(createOrderDto.volume) : null,
                  value: createOrderDto.value ? new Prisma.Decimal(createOrderDto.value) : null,
                  sequence: 0,
                },
              ],
            };
          }
          return undefined;
        })(),
        createdById: userId,
        updatedById: userId,
      },
      include: {
        cargoItems: {
          orderBy: { sequence: 'asc' },
        },
        customer: {
          select: {
            id: true,
            name: true,
            nameArabic: true,
          },
        },
        contract: {
          select: {
            id: true,
            contractNumber: true,
            status: true,
          },
        },
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
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            plateNumberArabic: true,
            chassisNo: true,
          },
        },
        accessories: {
          select: {
            id: true,
            name: true,
            plateNumber: true,
            plateNumberArabic: true,
            doorNo: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            mobile: true,
          },
        },
      },
    });

    // Update vehicle and attachment status to 'OnTrip' since order is InProgress
    if (order.vehicleId) {
      await this.updateVehicleStatus(order.vehicleId, companyId);
    }
    if (order.attachmentId) {
      await this.updateAttachmentStatus(order.attachmentId, companyId);
    }

    return order;
  }

  async findAll(page: number = 1, limit: number = 10, companyId: string) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
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
          contract: {
            select: {
              id: true,
              contractNumber: true,
            },
          },
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
          vehicle: {
            select: {
              id: true,
              plateNumber: true,
              doorNo: true,
            },
          },
          attachment: {
            select: {
              id: true,
              name: true,
              plateNumber: true,
              doorNo: true,
            },
          },
          accessories: {
            select: {
              id: true,
              name: true,
              plateNumber: true,
              plateNumberArabic: true,
              doorNo: true,
            },
          },
          driver: {
            select: {
              id: true,
              name: true,
              mobile: true,
              badgeNo: true,
              iqamaNumber: true,
            },
          },
          cargoItems: {
            orderBy: { sequence: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { companyId } }),
    ]);

    return {
      results: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string): Promise<Order> {
    const orderBase = await this.prisma.order.findFirst({
      where: { id, companyId },
      select: {
        id: true,
        vehicleId: true,
        attachmentId: true,
        driverId: true,
        contractId: true,
      },
    });

    if (!orderBase) {
      throw new NotFoundException(`Order with ID '${id}' not found`);
    }

    try {
      const order = await this.prisma.order.findFirst({
        where: { id, companyId },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              nameArabic: true,
              street: true,
              district: true,
              city: true,
              country: true,
              buildingNo: true,
              secondaryNo: true,
              crNo: true,
              vatNo: true,
            },
          },
          contract: orderBase.contractId
            ? {
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
                      paymentDays: true,
                    },
                  },
                },
              }
            : false,
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
          vehicle: orderBase.vehicleId
            ? {
                select: {
                  id: true,
                  name: true,
                  plateNumber: true,
                  plateNumberArabic: true,
                  doorNo: true,
                  type: true,
                  category: true,
                  make: true,
                  model: true,
                  chassisNo: true,
                },
              }
            : false,
          attachment: orderBase.attachmentId
            ? {
                select: {
                  id: true,
                  name: true,
                  plateNumber: true,
                  plateNumberArabic: true,
                  doorNo: true,
                  type: true,
                  category: true,
                  make: true,
                  model: true,
                  chassisNo: true,
                },
              }
            : false,
          accessories: {
            select: {
              id: true,
              name: true,
              plateNumber: true,
              plateNumberArabic: true,
              doorNo: true,
              type: true,
              category: true,
              make: true,
              model: true,
              chassisNo: true,
            },
          },
          driver: orderBase.driverId
            ? {
                select: {
                  id: true,
                  name: true,
                  mobile: true,
                  iqamaNumber: true,
                  badgeNo: true,
                  nationality: true,
                },
              }
            : false,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          cargoItems: {
            orderBy: { sequence: 'asc' },
          },
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID '${id}' not found`);
      }

      return order;
    } catch (error: any) {
      if (error.message?.includes('null') && error.message?.includes('name')) {
        throw new NotFoundException(
          `Order with ID '${id}' has invalid related data. Please check customer, vehicle, driver, or location records.`,
        );
      }
      throw error;
    }
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId: string,
    companyId: string,
  ): Promise<Order> {
    const order = (await this.findOne(id, companyId)) as any;

    if (updateOrderDto.fromId && updateOrderDto.toId) {
      if (updateOrderDto.fromId === updateOrderDto.toId) {
        throw new BadRequestException('From and To locations cannot be the same');
      }
    } else if (updateOrderDto.fromId && updateOrderDto.fromId === order.toId) {
      throw new BadRequestException('From and To locations cannot be the same');
    } else if (updateOrderDto.toId && updateOrderDto.toId === order.fromId) {
      throw new BadRequestException('From and To locations cannot be the same');
    }

    if (updateOrderDto.customerId && updateOrderDto.customerId !== order.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: updateOrderDto.customerId, companyId },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID '${updateOrderDto.customerId}' not found`);
      }
    }

    if (updateOrderDto.contractId !== undefined) {
      if (updateOrderDto.contractId && updateOrderDto.contractId !== order.contractId) {
        const contract = await this.prisma.contract.findFirst({
          where: { id: updateOrderDto.contractId, companyId },
        });

        if (!contract) {
          throw new NotFoundException(`Contract with ID '${updateOrderDto.contractId}' not found`);
        }
      }
    }

    if (updateOrderDto.fromId) {
      const location = await this.prisma.location.findFirst({
        where: { id: updateOrderDto.fromId, companyId },
      });

      if (!location) {
        throw new NotFoundException(`Location with ID '${updateOrderDto.fromId}' not found`);
      }
    }

    if (updateOrderDto.toId) {
      const location = await this.prisma.location.findFirst({
        where: { id: updateOrderDto.toId, companyId },
      });

      if (!location) {
        throw new NotFoundException(`Location with ID '${updateOrderDto.toId}' not found`);
      }
    }

    // Track duplicated resources (but allow update)
    const duplicatedResources: string[] = [];
    let duplicationNotes = order.duplicationNotes || '';

    if (updateOrderDto.vehicleId !== undefined) {
      if (updateOrderDto.vehicleId && updateOrderDto.vehicleId !== order.vehicleId) {
        const vehicle = await this.prisma.vehicle.findFirst({
          where: { id: updateOrderDto.vehicleId, companyId },
        });

        if (!vehicle) {
          throw new NotFoundException(`Vehicle with ID '${updateOrderDto.vehicleId}' not found`);
        }

        // Check if vehicle is already assigned to another pending order
        const pendingOrderWithVehicle = await this.prisma.order.findFirst({
          where: {
            companyId,
            vehicleId: updateOrderDto.vehicleId,
            status: 'InProgress',
            id: { not: id }, // Exclude current order
          },
        });

        if (pendingOrderWithVehicle) {
          duplicatedResources.push(`Vehicle (${vehicle.name || vehicle.plateNumber || 'N/A'})`);
          duplicationNotes += `Vehicle is already assigned to order ${pendingOrderWithVehicle.orderNo}. `;
        }
      }
    }

    if (updateOrderDto.driverId !== undefined) {
      if (updateOrderDto.driverId && updateOrderDto.driverId !== order.driverId) {
        const driver = await this.prisma.driver.findFirst({
          where: { id: updateOrderDto.driverId, companyId },
        });

        if (!driver) {
          throw new NotFoundException(`Driver with ID '${updateOrderDto.driverId}' not found`);
        }

        // Check if driver is already assigned to another pending order
        const pendingOrderWithDriver = await this.prisma.order.findFirst({
          where: {
            companyId,
            driverId: updateOrderDto.driverId,
            status: 'InProgress',
            id: { not: id }, // Exclude current order
          },
        });

        if (pendingOrderWithDriver) {
          duplicatedResources.push(`Driver (${driver.name || 'N/A'})`);
          duplicationNotes += `Driver is already assigned to order ${pendingOrderWithDriver.orderNo}. `;
        }
      }
    }

    if (updateOrderDto.attachmentId !== undefined) {
      if (updateOrderDto.attachmentId && updateOrderDto.attachmentId !== order.attachmentId) {
        // Check if attachment is already assigned to another pending order (track but allow)
        const pendingOrderWithAttachment = await this.prisma.order.findFirst({
          where: {
            companyId,
            attachmentId: updateOrderDto.attachmentId,
            status: 'InProgress',
            id: { not: id }, // Exclude current order
          },
        });

        if (pendingOrderWithAttachment) {
          const attachment = await this.prisma.vehicle.findFirst({
            where: { id: updateOrderDto.attachmentId, companyId },
          });
          duplicatedResources.push(
            `Attachment (${attachment?.name || attachment?.plateNumber || 'N/A'})`,
          );
          duplicationNotes += `Attachment is already assigned to order ${pendingOrderWithAttachment.orderNo}. `;
        }
      }
    }

    if (updateOrderDto.accessoryIds !== undefined) {
      if (updateOrderDto.accessoryIds && updateOrderDto.accessoryIds.length > 0) {
        const accessories = await this.prisma.vehicle.findMany({
          where: {
            id: { in: updateOrderDto.accessoryIds },
            companyId,
            type: 'Accessory',
          },
        });

        if (accessories.length !== updateOrderDto.accessoryIds.length) {
          const foundIds = accessories.map((a) => a.id);
          const missingIds = updateOrderDto.accessoryIds.filter((id) => !foundIds.includes(id));
          throw new NotFoundException(
            `One or more accessories not found or not of type Accessory: ${missingIds.join(', ')}`,
          );
        }

        // Check for duplicated accessories
        for (const accessory of accessories) {
          const pendingOrderWithAccessory = await this.prisma.order.findFirst({
            where: {
              companyId,
              status: 'InProgress',
              id: { not: id },
              accessories: {
                some: {
                  id: accessory.id,
                },
              },
            },
          });
          if (pendingOrderWithAccessory) {
            duplicatedResources.push(
              `Accessory (${accessory.name || accessory.plateNumber || 'N/A'})`,
            );
            duplicationNotes += `Accessory is already assigned to order ${pendingOrderWithAccessory.orderNo}. `;
          }
        }
      }
    }

    const updateData: any = {
      updatedById: userId,
      hasDuplicatedResources: duplicatedResources.length > 0 || order.hasDuplicatedResources,
      duplicationNotes: duplicationNotes.trim() || null,
    };

    // Only include fields that are provided and not empty
    if (updateOrderDto.customerId !== undefined) {
      updateData.customerId = updateOrderDto.customerId;
    }
    if (updateOrderDto.contractId !== undefined) {
      updateData.contractId =
        updateOrderDto.contractId && updateOrderDto.contractId.trim()
          ? updateOrderDto.contractId
          : null;
    }
    if (updateOrderDto.fromId !== undefined) {
      updateData.fromId = updateOrderDto.fromId;
    }
    if (updateOrderDto.toId !== undefined) {
      updateData.toId = updateOrderDto.toId;
    }
    if (updateOrderDto.weight !== undefined) {
      updateData.weight = updateOrderDto.weight ?? null;
    }
    if (updateOrderDto.volume !== undefined) {
      updateData.volume = updateOrderDto.volume ?? null;
    }
    if (updateOrderDto.value !== undefined) {
      updateData.value = updateOrderDto.value ?? null;
    }
    if (updateOrderDto.vehicleId !== undefined) {
      updateData.vehicleId =
        updateOrderDto.vehicleId && updateOrderDto.vehicleId.trim()
          ? updateOrderDto.vehicleId
          : null;
    }
    if (updateOrderDto.attachmentId !== undefined) {
      updateData.attachmentId =
        updateOrderDto.attachmentId && updateOrderDto.attachmentId.trim()
          ? updateOrderDto.attachmentId
          : null;
    }
    if (updateOrderDto.driverId !== undefined) {
      updateData.driverId =
        updateOrderDto.driverId && updateOrderDto.driverId.trim() ? updateOrderDto.driverId : null;
    }
    if (updateOrderDto.status !== undefined) {
      updateData.status = updateOrderDto.status;
    }
    if (updateOrderDto.tripNumber !== undefined) {
      updateData.tripNumber =
        updateOrderDto.tripNumber && updateOrderDto.tripNumber.trim()
          ? updateOrderDto.tripNumber
          : null;
    }
    if (updateOrderDto.cargoDescription !== undefined) {
      updateData.cargoDescription =
        updateOrderDto.cargoDescription && updateOrderDto.cargoDescription.trim()
          ? updateOrderDto.cargoDescription
          : null;
    }
    if (updateOrderDto.sealNumber !== undefined) {
      updateData.sealNumber =
        updateOrderDto.sealNumber && updateOrderDto.sealNumber.trim()
          ? updateOrderDto.sealNumber
          : null;
    }
    if (updateOrderDto.startKms !== undefined) {
      updateData.startKms = updateOrderDto.startKms ?? null;
    }
    if (updateOrderDto.kmOut !== undefined) {
      updateData.kmOut = updateOrderDto.kmOut ?? null;
    }
    if (updateOrderDto.kmIn !== undefined) {
      updateData.kmIn = updateOrderDto.kmIn ?? null;
    }
    if (updateOrderDto.runKm !== undefined) {
      updateData.runKm = updateOrderDto.runKm ?? null;
    }
    if (updateOrderDto.eta !== undefined) {
      updateData.eta =
        updateOrderDto.eta && updateOrderDto.eta.trim() ? new Date(updateOrderDto.eta) : null;
    }
    if (updateOrderDto.requestedDate !== undefined) {
      updateData.requestedDate =
        updateOrderDto.requestedDate && updateOrderDto.requestedDate.trim()
          ? new Date(updateOrderDto.requestedDate)
          : null;
    }
    if (updateOrderDto.requestedTime !== undefined) {
      updateData.requestedTime =
        updateOrderDto.requestedTime && updateOrderDto.requestedTime.trim()
          ? updateOrderDto.requestedTime
          : null;
    }
    if (updateOrderDto.arrivalAtLoading !== undefined) {
      updateData.arrivalAtLoading =
        updateOrderDto.arrivalAtLoading && updateOrderDto.arrivalAtLoading.trim()
          ? new Date(updateOrderDto.arrivalAtLoading)
          : null;
    }
    if (updateOrderDto.completedLoading !== undefined) {
      updateData.completedLoading =
        updateOrderDto.completedLoading && updateOrderDto.completedLoading.trim()
          ? new Date(updateOrderDto.completedLoading)
          : null;
    }
    if (updateOrderDto.dispatchFromLoading !== undefined) {
      updateData.dispatchFromLoading =
        updateOrderDto.dispatchFromLoading && updateOrderDto.dispatchFromLoading.trim()
          ? new Date(updateOrderDto.dispatchFromLoading)
          : null;
    }
    if (updateOrderDto.arrivalAtOffloading !== undefined) {
      updateData.arrivalAtOffloading =
        updateOrderDto.arrivalAtOffloading && updateOrderDto.arrivalAtOffloading.trim()
          ? new Date(updateOrderDto.arrivalAtOffloading)
          : null;
    }
    if (updateOrderDto.completedUnloading !== undefined) {
      updateData.completedUnloading =
        updateOrderDto.completedUnloading && updateOrderDto.completedUnloading.trim()
          ? new Date(updateOrderDto.completedUnloading)
          : null;
    }
    if (updateOrderDto.remarks !== undefined) {
      updateData.remarks =
        updateOrderDto.remarks && updateOrderDto.remarks.trim() ? updateOrderDto.remarks : null;
    }
    if (updateOrderDto.recipientAcknowledgment !== undefined) {
      updateData.recipientAcknowledgment =
        updateOrderDto.recipientAcknowledgment && updateOrderDto.recipientAcknowledgment.trim()
          ? updateOrderDto.recipientAcknowledgment
          : null;
    }
    if (updateOrderDto.bookingNumber !== undefined) {
      updateData.bookingNumber =
        updateOrderDto.bookingNumber && updateOrderDto.bookingNumber.trim()
          ? updateOrderDto.bookingNumber
          : null;
    }
    if (updateOrderDto.vesselName !== undefined) {
      updateData.vesselName =
        updateOrderDto.vesselName && updateOrderDto.vesselName.trim()
          ? updateOrderDto.vesselName
          : null;
    }
    if (updateOrderDto.croNumber !== undefined) {
      updateData.croNumber =
        updateOrderDto.croNumber && updateOrderDto.croNumber.trim()
          ? updateOrderDto.croNumber
          : null;
    }
    if (updateOrderDto.customerContact !== undefined) {
      updateData.customerContact =
        updateOrderDto.customerContact && updateOrderDto.customerContact.trim()
          ? updateOrderDto.customerContact
          : null;
    }
    if (updateOrderDto.transporter !== undefined) {
      updateData.transporter =
        updateOrderDto.transporter && updateOrderDto.transporter.trim()
          ? updateOrderDto.transporter
          : null;
    }
    if (updateOrderDto.portOfLoading !== undefined) {
      updateData.portOfLoading =
        updateOrderDto.portOfLoading && updateOrderDto.portOfLoading.trim()
          ? updateOrderDto.portOfLoading
          : null;
    }
    if (updateOrderDto.shippingLine !== undefined) {
      updateData.shippingLine =
        updateOrderDto.shippingLine && updateOrderDto.shippingLine.trim()
          ? updateOrderDto.shippingLine
          : null;
    }
    if (updateOrderDto.containerNumber !== undefined) {
      updateData.containerNumber =
        updateOrderDto.containerNumber && updateOrderDto.containerNumber.trim()
          ? updateOrderDto.containerNumber
          : null;
    }
    if (updateOrderDto.containerSize !== undefined) {
      updateData.containerSize =
        updateOrderDto.containerSize && updateOrderDto.containerSize.trim()
          ? updateOrderDto.containerSize
          : null;
    }
    if (updateOrderDto.weightUom !== undefined) {
      updateData.weightUom =
        updateOrderDto.weightUom && updateOrderDto.weightUom.trim()
          ? updateOrderDto.weightUom
          : null;
    }
    if (updateOrderDto.tareWeight !== undefined) {
      updateData.tareWeight = updateOrderDto.tareWeight ?? null;
    }
    if (updateOrderDto.trailerNumber !== undefined) {
      updateData.trailerNumber =
        updateOrderDto.trailerNumber && updateOrderDto.trailerNumber.trim()
          ? updateOrderDto.trailerNumber
          : null;
    }
    if (updateOrderDto.temperature !== undefined) {
      updateData.temperature =
        updateOrderDto.temperature && updateOrderDto.temperature.trim()
          ? updateOrderDto.temperature
          : null;
    }
    if (updateOrderDto.podNumber !== undefined) {
      updateData.podNumber =
        updateOrderDto.podNumber && updateOrderDto.podNumber.trim()
          ? updateOrderDto.podNumber
          : null;
    }
    if (updateOrderDto.podSubmitted !== undefined) {
      updateData.podSubmitted = updateOrderDto.podSubmitted;
    }
    if (updateOrderDto.podDocument !== undefined) {
      updateData.podDocument =
        updateOrderDto.podDocument && updateOrderDto.podDocument.trim()
          ? updateOrderDto.podDocument
          : null;
    }
    if (updateOrderDto.accessoryIds !== undefined) {
      updateData.accessories = {
        set:
          updateOrderDto.accessoryIds.length > 0
            ? updateOrderDto.accessoryIds.map((id) => ({ id }))
            : [],
      };
    }

    // Handle cargoItems update
    if (updateOrderDto.cargoItems !== undefined) {
      // Delete existing cargo items and create new ones
      await this.prisma.cargoItem.deleteMany({
        where: { orderId: id },
      });

      if (updateOrderDto.cargoItems.length > 0) {
        updateData.cargoItems = {
          create: updateOrderDto.cargoItems.map((item, index) => ({
            description: item.description || '',
            weight: item.weight ? new Prisma.Decimal(item.weight) : null,
            weightUom: item.weightUom || 'TON',
            volume: item.volume ? new Prisma.Decimal(item.volume) : null,
            value: item.value ? new Prisma.Decimal(item.value) : null,
            sequence: index,
          })),
        };
      }
    } else if (updateOrderDto.cargoDescription !== undefined) {
      // Fallback: if cargoDescription is provided but cargoItems is not, create single cargo item
      await this.prisma.cargoItem.deleteMany({
        where: { orderId: id },
      });

      if (updateOrderDto.cargoDescription) {
        updateData.cargoItems = {
          create: [
            {
              description: updateOrderDto.cargoDescription,
              weight: updateOrderDto.weight ? new Prisma.Decimal(updateOrderDto.weight) : null,
              weightUom: updateOrderDto.weightUom || 'TON',
              volume: updateOrderDto.volume ? new Prisma.Decimal(updateOrderDto.volume) : null,
              value: updateOrderDto.value ? new Prisma.Decimal(updateOrderDto.value) : null,
              sequence: 0,
            },
          ],
        };
      }
    }

    // Track old vehicle and attachment IDs before update
    const oldVehicleId = order.vehicleId;
    const oldAttachmentId = order.attachmentId;

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        cargoItems: {
          orderBy: { sequence: 'asc' },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        contract: {
          select: {
            id: true,
            contractNumber: true,
          },
        },
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
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
          },
        },
        accessories: {
          select: {
            id: true,
            name: true,
            plateNumber: true,
            plateNumberArabic: true,
            doorNo: true,
            type: true,
            category: true,
          },
        },
      },
    });

    // Update vehicle status based on order changes
    const newVehicleId = updatedOrder.vehicleId;
    const newAttachmentId = updatedOrder.attachmentId;
    const newStatus = updatedOrder.status;

    // If vehicle changed, update old and new vehicle status
    if (oldVehicleId !== newVehicleId) {
      if (oldVehicleId) {
        await this.updateVehicleStatus(oldVehicleId, companyId);
      }
      if (newVehicleId) {
        await this.updateVehicleStatus(newVehicleId, companyId);
      }
    } else if (newVehicleId) {
      // Vehicle didn't change, but status might have
      await this.updateVehicleStatus(newVehicleId, companyId);
    }

    // If attachment changed, update old and new attachment status
    if (oldAttachmentId !== newAttachmentId) {
      if (oldAttachmentId) {
        await this.updateAttachmentStatus(oldAttachmentId, companyId);
      }
      if (newAttachmentId) {
        await this.updateAttachmentStatus(newAttachmentId, companyId);
      }
    } else if (newAttachmentId) {
      // Attachment didn't change, but status might have
      await this.updateAttachmentStatus(newAttachmentId, companyId);
    }

    return updatedOrder;
  }

  async remove(id: string, companyId: string): Promise<void> {
    const order = await this.findOne(id, companyId);

    await this.prisma.order.delete({
      where: { id },
    });

    // Update vehicle and attachment status after order deletion
    if (order.vehicleId) {
      await this.updateVehicleStatus(order.vehicleId, companyId);
    }
    if (order.attachmentId) {
      await this.updateAttachmentStatus(order.attachmentId, companyId);
    }
  }
}
