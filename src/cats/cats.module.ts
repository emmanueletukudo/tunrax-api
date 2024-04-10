import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cats } from './entities/cat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { Favorites } from './entities/favorite.entity';
import { Users } from 'src/users/entities/user.entity';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../common/guards/roles.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Cats, Users, Favorites]),
    UsersModule,
    JwtModule,
  ],
  controllers: [CatsController],
  providers: [Reflector, RolesGuard, CatsService],
  exports: [RolesGuard],
})
export class CatsModule {}
