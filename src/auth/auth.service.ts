import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { hashString } from '../utils/hash-string';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser({
    email,
    password,
  }: LoginDto): Promise<{ jwt_token: string }> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) return null;
    const comparePassword = await bcrypt.compare(password, user.password);

    if (comparePassword) {
      const { password, ...result } = user;
      return { jwt_token: this.jwtService.sign(result) };
    }

    return null;
  }

  async register(registerDto: CreateUserDto) {
    const hashPassword = await hashString(registerDto.password);
    const randomUUID = crypto.randomUUID();
    const hashedApiKey = await hashString(randomUUID);

    return this.userService.create({
      ...registerDto,
      password: hashPassword,
      api_key: hashedApiKey,
      role: 'admin',
    });
  }
}
