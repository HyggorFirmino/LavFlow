import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { OrdensService } from './ordens.service';
import { CreateOrdemDto } from './dto/create-ordem.dto';
import { MudarStatusOrdemDto } from './dto/mudar-status-ordem.dto';
import { UpdateOrdemDto } from './dto/update-ordem.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdemServico } from './entities/ordem-servico.entity';

@ApiTags('ordens') // Agrupa todos os endpoints deste controller sob a tag 'ordens'
@Controller('ordens')
export class OrdensController {
  constructor(private readonly ordensService: OrdensService) { }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova ordem de serviço' })
  @ApiResponse({ status: 201, description: 'A ordem foi criada com sucesso.', type: OrdemServico })
  @ApiResponse({ status: 400, description: 'Dados inválidos fornecidos.' })
  create(@Body() createOrdemDto: CreateOrdemDto) {
    return this.ordensService.create(createOrdemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as ordens de serviço' })
  @ApiResponse({ status: 200, description: 'Lista de ordens retornada com sucesso.', type: [OrdemServico] })
  findAll() {
    return this.ordensService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma ordem de serviço pelo ID' })
  @ApiResponse({ status: 200, description: 'Ordem encontrada.', type: OrdemServico })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordensService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de uma ordem de serviço' })
  @ApiResponse({ status: 200, description: 'Ordem atualizada com sucesso.', type: OrdemServico })
  @ApiResponse({ status: 404, description: 'Ordem não encontrada.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateOrdemDto: UpdateOrdemDto) {
    return this.ordensService.update(id, updateOrdemDto);
  }

  @Patch(':id/mudar-status')
  @ApiOperation({ summary: 'Muda o status de uma ordem (move no Kanban)' })
  @ApiResponse({ status: 200, description: 'Status da ordem atualizado com sucesso.', type: OrdemServico })
  @ApiResponse({ status: 404, description: 'Ordem ou Status não encontrado.' })
  mudarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() mudarStatusDto: MudarStatusOrdemDto,
  ) {
    return this.ordensService.mudarStatus(id, mudarStatusDto);
  }
}