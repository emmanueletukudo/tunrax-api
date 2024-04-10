import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
/**
 * Updated `RolesGuard` to get the specified role from
 * JWT token since all the role-specific routes require authentication.
 */
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const JwtToken = request.headers.authorization.split(' ')[1];
    const decodeToken = this.jwtService.verify(JwtToken, {
      secret: this.configService.get('JWT_SECRET'),
    });

    const userRole = decodeToken.role;
    return roles.includes(userRole);
  }
}
