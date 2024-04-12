import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { describe } from 'node:test';

import { Cats } from './entities/cat.entity';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { CatsService } from './cats.service';
import { Favorites } from './entities/favorite.entity';
import { Users } from '../users/entities/user.entity';

describe('CatService', () => {
  let catService: CatsService;
  let catRepository: Repository<Cats>;

  let userRepository: Repository<Users>;
  let favoriteRepository: Repository<Favorites>;

  let CAT_REPO_TOKEN = getRepositoryToken(Cats);
  let USER_REPO_TOKEN = getRepositoryToken(Users);
  let FAVORITE_REPO_TOKEN = getRepositoryToken(Favorites);
  let createCatDto: CreateCatDto;
  let updateCatDto: UpdateCatDto;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: CAT_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            favoriteCat: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getFavoriteCatByUserIdAndCatId: jest.fn(),
          },
        },
        {
          provide: FAVORITE_REPO_TOKEN,
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: USER_REPO_TOKEN,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    catService = moduleRef.get<CatsService>(CatsService);
    catRepository = moduleRef.get<Repository<Cats>>(CAT_REPO_TOKEN);
    userRepository = moduleRef.get<Repository<Users>>(USER_REPO_TOKEN);
    favoriteRepository =
      moduleRef.get<Repository<Favorites>>(FAVORITE_REPO_TOKEN);

    createCatDto = {
      name: 'Fluffy',
      age: 5,
      breed: 'Persian',
    };

    updateCatDto = {
      name: 'Whiskers',
      age: 7,
      breed: 'Siamese',
    };
  });

  it('userService should be defined', () => {
    expect(catService).toBeDefined();
  });

  it('userRepository be defined', () => {
    expect(catRepository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cat', async () => {
      const cat = { id: 1, ...createCatDto };

      catRepository.create = jest.fn().mockResolvedValue(createCatDto);
      catRepository.save = jest.fn().mockResolvedValue(cat);
      const result = await catService.create(createCatDto);

      expect(result).toEqual(cat);
      expect(catRepository.create).toHaveBeenCalledWith(createCatDto);
    });
  });

  describe('update', () => {
    it('should update an existing cat', async () => {
      const id = 1;
      const cat = { id, ...createCatDto };

      catRepository.findOne = jest.fn().mockResolvedValue(cat);
      catRepository.update = jest.fn().mockResolvedValue({ affected: 1 });

      const result = await catService.update(id, updateCatDto);

      expect(result).toEqual({ affected: 1 });
      expect(catRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(catRepository.update).toHaveBeenCalledWith(id, updateCatDto);
    });

    it('should throw an error if cat is not found', async () => {
      const id = 999;
      catRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(catService.update(id, updateCatDto)).rejects.toThrow(
        'Cat not found!'
      );
      expect(catRepository.findOne).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('remove', () => {
    it('should remove a cat by id', async () => {
      const id = 1;
      const deleteResult = { affected: 1 };

      catRepository.delete = jest.fn().mockResolvedValue(deleteResult);
      const result = await catService.remove(id);

      expect(result).toEqual(deleteResult);
      expect(catRepository.delete).toHaveBeenCalledWith(id);
    });
  });

  describe('favoriteCat', () => {
    it('should favorite a cat for a user', async () => {
      const userId = 1;
      const user = { id: userId };
      const cat = { id: 1, ...createCatDto };

      const favorite = { id: 1, user: { ...user }, cat: { ...cat } };
      userRepository.findOne = jest.fn().mockResolvedValue(user.id);
      catRepository.findOne = jest.fn().mockResolvedValue(cat);
      catService.getFavoriteCatByUserIdAndCatId = jest
        .fn()
        .mockResolvedValue(favorite);
      favoriteRepository.save = jest.fn().mockResolvedValue(favorite);

      const result = await catService.favoriteCat(userId, 2);

      expect(result).toBeDefined();
      expect(result.user).toEqual(user);
      expect(result.cat).toEqual(cat);
      expect(favoriteRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if user or cat not found', async () => {
      const userId = 1;
      const catId = 1;
      userRepository.findOne = jest.fn().mockResolvedValue(null);
      catRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(catService.favoriteCat(userId, catId)).rejects.toThrow(
        'User or cat not found'
      );
    });

    it('should throw an error if cat already favorited', async () => {
      const userId = 1;
      const user = { id: userId };
      const cat = { id: 1, ...createCatDto };

      userRepository.findOne = jest.fn().mockResolvedValue(user);
      catRepository.findOne = jest.fn().mockResolvedValue(cat);
      favoriteRepository.findOne = jest.fn().mockResolvedValue({ user, cat });

      await expect(catService.favoriteCat(userId, cat.id)).rejects.toThrow(
        'Cat already favorited'
      );
    });
  });
});
