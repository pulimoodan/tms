import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'Active') {
      throw new UnauthorizedException('User account is not active');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.usersService.updateLastLogin(user.id);

    const payload = { email: user.email, sub: user.id, roleId: user.roleId };
    const accessToken = this.jwtService.sign(payload);

    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const expirationDate = new Date();
    if (expiresIn.endsWith('h')) {
      const hours = parseInt(expiresIn.replace('h', ''));
      expirationDate.setHours(expirationDate.getHours() + hours);
    } else if (expiresIn.endsWith('d')) {
      const days = parseInt(expiresIn.replace('d', ''));
      expirationDate.setDate(expirationDate.getDate() + days);
    } else if (expiresIn.endsWith('m')) {
      const minutes = parseInt(expiresIn.replace('m', ''));
      expirationDate.setMinutes(expirationDate.getMinutes() + minutes);
    } else {
      expirationDate.setHours(expirationDate.getHours() + 24);
    }

    const { passwordHash, ...userWithoutPassword } = user;

    // Format permissions for frontend
    const permissions: Record<string, Record<string, boolean>> = {};
    if (user.role.permissions && Array.isArray(user.role.permissions)) {
      user.role.permissions.forEach((perm: any) => {
        if (perm.module && perm.permissions) {
          permissions[perm.module] = {
            Read: perm.permissions.includes('Read'),
            Write: perm.permissions.includes('Write'),
            Update: perm.permissions.includes('Update'),
            Delete: perm.permissions.includes('Delete'),
            Export: perm.permissions.includes('Export'),
          };
        }
      });
    }

    return {
      accessToken,
      expiresIn: expirationDate.toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: {
          id: user.role.id,
          name: user.role.name,
          permissions,
        },
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user || user.status !== 'Active') {
      return null;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

