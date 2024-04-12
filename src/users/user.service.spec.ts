import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import { describe } from 'node:test';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let userService: UsersService;
  let USER_REPO_TOKEN = getRepositoryToken(Users);
  let userRepository: Repository<Users>;
  let createUserDto: CreateUserDto;
  let updateUserDto: UpdateUserDto;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USER_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();
    userService = moduleRef.get<UsersService>(UsersService);
    userRepository = moduleRef.get<Repository<Users>>(USER_REPO_TOKEN);

    createUserDto = {
      name: 'etukudo',
      password: '2393!00D',
      email: 'et@gmail.com',
    };

    updateUserDto = {
      name: 'Updated Name',
      ...createUserDto,
    };
  });

  it('userService should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('userRepository be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const savedUser = {
        id: 1,
        ...createUserDto,
      };

      userRepository.create = jest.fn().mockReturnValue(createUserDto);
      userRepository.save = jest.fn().mockReturnValue(savedUser);

      const result = await userService.create(createUserDto);

      expect(result).toEqual(savedUser);
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const id = 1;

      userRepository.update = jest.fn().mockReturnValue({ affected: 1 });
      const result = await userService.update(id, updateUserDto);

      expect(result).toEqual({ affected: 1 });
      expect(userRepository.update).toHaveBeenCalledWith(id, updateUserDto);
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      const email = createUserDto.email;
      const user = {
        id: 1,
        ...createUserDto,
      };

      userRepository.findOne = jest.fn().mockResolvedValue(user);
      const result = await userService.findUserByEmail(email);

      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ];

      userRepository.find = jest.fn().mockResolvedValue(users);
      const result = await userService.findAll();

      expect(result).toEqual(users);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user by id', async () => {
      const id = 1;
      const deleteResult = { affected: 1 };

      userRepository.delete = jest.fn().mockResolvedValue(deleteResult);
      const result = await userService.remove(id);

      expect(result).toEqual(deleteResult);
      expect(userRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});
