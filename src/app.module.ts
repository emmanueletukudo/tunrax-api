import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CatsModule } from './cats/cats.module';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [join(process.cwd(), 'dist/**/*.entity.js')],
        migrations: [join(process.cwd(), 'migrations/*.js')],
        /**
         * Auto-generate database schema (only for development)
         * the `SYNCRONIZE_DATABASE` should be set to false in production.
         */
        synchronize: configService.get('SYNCRONIZE_DATABASE'),
      }),
    }),
    CoreModule,
    CatsModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
