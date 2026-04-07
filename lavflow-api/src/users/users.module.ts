import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Store } from '../stores/entities/store.entity';
import { OrdemServico } from '../ordens/entities/ordem-servico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Store, OrdemServico])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}