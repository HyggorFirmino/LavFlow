import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Store } from 'src/stores/entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Store])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}