import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { StatusKanbanService } from './status-kanban.service';
import { CreateStatusKanbanDto } from './dto/create-status-kanban.dto';
import { UpdateStatusKanbanDto } from './dto/update-status-kanban.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatusKanban } from '../ordens/entities/status-kanban.entity';

@ApiTags('Status (Kanban)') // Um nome de tag descritivo para o Swagger
@Controller('status-kanban')
export class StatusKanbanController {
  constructor(private readonly statusKanbanService: StatusKanbanService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo status para o quadro Kanban' })
  @ApiResponse({ status: 201, description: 'Status criado com sucesso.', type: StatusKanban })
  create(@Body() createStatusKanbanDto: CreateStatusKanbanDto) {
    return this.statusKanbanService.create(createStatusKanbanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os status do Kanban, ordenados para exibição' })
  @ApiResponse({ status: 200, description: 'Lista de status retornada.', type: [StatusKanban] })
  findAll() {
    return this.statusKanbanService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um status pelo ID' })
  @ApiResponse({ status: 200, description: 'Status encontrado.', type: StatusKanban })
  @ApiResponse({ status: 404, description: 'Status não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.statusKanbanService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um status' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso.', type: StatusKanban })
  @ApiResponse({ status: 404, description: 'Status não encontrado.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStatusKanbanDto: UpdateStatusKanbanDto) {
    return this.statusKanbanService.update(id, updateStatusKanbanDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um status' })
  @ApiResponse({ status: 204, description: 'Status removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Status não encontrado.' })
  @ApiResponse({ status: 400, description: 'O status está em uso e não pode ser removido.'})
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.statusKanbanService.remove(id);
  }
}