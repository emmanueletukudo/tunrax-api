import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Cats } from './entities/cat.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Users } from 'src/users/entities/user.entity';
import { Favorites } from 'src/cats/entities/favorite.entity';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cats) private catRepository: Repository<Cats>,
    @InjectRepository(Users) private userRepository: Repository<Users>,
    @InjectRepository(Favorites)
    private favoriteRepository: Repository<Favorites>
  ) {}

  findAll(): Promise<Cat[]> {
    return this.catRepository.find();
  }

  findOne(id: number): Promise<Cat> {
    return this.catRepository.findOneBy({ id });
  }

  create(catDto: CreateCatDto): Promise<Cat> {
    const catEntity = this.catRepository.create(catDto);
    const newCat = this.catRepository.save(catEntity);

    return newCat;
  }

  async update(id: number, catUpdateDto: UpdateCatDto): Promise<UpdateResult> {
    const hasCat = this.findOne(id);
    if (!hasCat) throw new Error('Cat not found!');
    return this.catRepository.update(id, catUpdateDto);
  }

  async remove(id: number): Promise<DeleteResult> {
    return this.catRepository.delete(id);
  }

  async favoriteCat(userId: number, catId: number): Promise<Favorites> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: { favorites: true },
    });
    const cat = await this.catRepository.findOneBy({ id: catId });

    if (!user || !cat)
      throw new HttpException('User or cat not found', HttpStatus.BAD_REQUEST);

    const existingFavorite = await this.getFavoriteCatByUserIdAndCatId(
      userId,
      catId
    );
    if (existingFavorite.cat.id === catId)
      throw new HttpException('Cat already favorited', HttpStatus.BAD_REQUEST);

    const favorite = new Favorites();
    favorite.user = user;
    favorite.cat = cat;

    const newFavorite = await this.favoriteRepository.save(favorite);
    return newFavorite;
  }

  async getFavoriteCatByUserIdAndCatId(
    userId: number,
    catId: number
  ): Promise<Favorites> {
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, cat: { id: catId } },
      relations: ['cat', 'user'],
    });

    if (favorite) {
      return favorite;
    }

    return undefined;
  }
}
