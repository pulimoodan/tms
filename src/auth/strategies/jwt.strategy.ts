import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    // Check if this is a driver token
    if (payload.type === 'driver') {
      const driver = await this.prisma.driver.findUnique({
        where: { id: payload.sub || payload.driverId },
        include: {
          company: true,
        },
      });

      if (!driver || driver.status !== 'Active') {
        throw new UnauthorizedException('Driver not found or inactive');
      }

      const { passwordHash, ...driverWithoutPassword } = driver;
      return {
        ...driverWithoutPassword,
        driverId: driver.id,
        companyId: driver.companyId,
      };
    }

    // Regular user authentication
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user || user.status !== 'Active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

