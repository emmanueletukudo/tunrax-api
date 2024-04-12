import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let userService: UsersService;
  let authService: AuthService;
  let jwtService: JwtService;

  let USER_REPO_TOKEN = getRepositoryToken(Users);

  let userRepository: Repository<Users>;
  let registerDto: CreateUserDto;
  let loginDto: LoginDto;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: USER_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            finUserByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();
    userService = moduleRef.get<UsersService>(UsersService);
    userRepository = moduleRef.get<Repository<Users>>(USER_REPO_TOKEN);
    authService = moduleRef.get<AuthService>(AuthService);
    jwtService = moduleRef.get<JwtService>(JwtService);

    registerDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
    };

    loginDto = {
      email: 'test@example.com',
      password: 'wrongPassword',
    };
  });

  it('userService should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('userRepository be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return JWT token if user is valid', async () => {
      const user = { email: loginDto.email, password: 'hashedPassword', id: 1 };
      const jwtToken = 'jwt.token';

      userService.findUserByEmail = jest.fn().mockResolvedValue(user);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);
      jwtService.sign = jest.fn().mockReturnValue(jwtToken);

      const result = await authService.validateUser(loginDto);
      expect(result).toEqual({ jwt_token: jwtToken });
    });

    it('should return null if user is not found', async () => {
      userService.findUserByEmail = jest.fn().mockResolvedValue(null);

      const result = await authService.validateUser(loginDto);
      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const user = { email: loginDto.email, password: 'hashedPassword', id: 1 };
      userService.findUserByEmail = jest.fn().mockResolvedValue(user);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);

      const result = await authService.validateUser(loginDto);
      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const user = { ...registerDto, id: 1 };
      const hashedPassword = 'hashedPassword';
      const hashedApiKey = 'hashedApiKey';

      userService.create = jest.fn().mockResolvedValue(user);
      (bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue(hashedPassword);
      jest
        .spyOn(global.crypto, 'randomUUID')
        .mockReturnValue('YUUID-UUID-GOUIDO-DOA-UUID');
      (bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue(hashedApiKey);

      const result = await authService.register(registerDto);
      expect(result).toEqual(user);
    });
  });
});
