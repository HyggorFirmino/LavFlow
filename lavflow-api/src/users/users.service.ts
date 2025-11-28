import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Store } from 'src/stores/entities/store.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password, storeIds } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let stores: Store[] = [];
    if (storeIds && storeIds.length > 0) {
        stores = await this.storeRepository.findByIds(storeIds);
        if (stores.length !== storeIds.length) {
            throw new NotFoundException('Uma ou mais lojas não foram encontradas');
        }
    }

    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      stores,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['stores'] });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['stores'] });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { storeIds, password, ...rest } = updateUserDto;

    const user = await this.userRepository.preload({
        id,
        ...rest,
    });

    if (!user) {
        throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    if (storeIds) {
        user.stores = await this.storeRepository.findByIds(storeIds);
        if (user.stores.length !== storeIds.length) {
            throw new NotFoundException('Uma ou mais lojas não foram encontradas para atualização');
        }
    }

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
  }
}