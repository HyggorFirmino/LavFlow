import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { FuncionariosService } from './funcionarios.service';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Funcionario } from './entities/funcionario.entity';

@ApiTags('funcionarios') // Agrupa esta seção na UI do Swagger
@Controller('funcionarios')
export class FuncionariosController {
  constructor(private readonly funcionariosService: FuncionariosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo funcionário' })
  @ApiResponse({ status: 201, description: 'O funcionário foi criado com sucesso.', type: Funcionario })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createFuncionarioDto: CreateFuncionarioDto) {
    return this.funcionariosService.create(createFuncionarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os funcionários' })
  @ApiResponse({ status: 200, description: 'Lista de funcionários retornada com sucesso.', type: [Funcionario] })
  findAll() {
    return this.funcionariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um funcionário pelo ID' })
  @ApiResponse({ status: 200, description: 'Funcionário encontrado.', type: Funcionario })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.funcionariosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um funcionário' })
  @ApiResponse({ status: 200, description: 'Funcionário atualizado com sucesso.', type: Funcionario })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFuncionarioDto: UpdateFuncionarioDto) {
    return this.funcionariosService.update(id, updateFuncionarioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna status 204 No Content em caso de sucesso
  @ApiOperation({ summary: 'Remove um funcionário' })
  @ApiResponse({ status: 204, description: 'Funcionário removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.funcionariosService.remove(id);
  }
}