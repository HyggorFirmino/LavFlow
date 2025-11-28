import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'O usuário foi criado com sucesso.', type: User })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiResponse({ status: 200, description: 'Uma lista de usuários.', type: [User] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: Number })
  @ApiResponse({ status: 200, description: 'O usuário encontrado.', type: User })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'O usuário foi atualizado com sucesso.', type: User })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um usuário' })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: Number })
  @ApiResponse({ status: 204, description: 'O usuário foi removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}