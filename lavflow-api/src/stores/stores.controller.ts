import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Store } from './entities/store.entity';

@ApiTags('stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) { }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova loja' })
  @ApiResponse({ status: 201, description: 'A loja foi criada com sucesso.', type: Store })
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as lojas' })
  @ApiResponse({ status: 200, description: 'Retorna todas as lojas.', type: [Store] })
  findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar loja por ID' })
  @ApiResponse({ status: 200, description: 'Retorna a loja.', type: Store })
  @ApiResponse({ status: 404, description: 'Loja não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma loja' })
  @ApiResponse({ status: 200, description: 'A loja foi atualizada com sucesso.', type: Store })
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(+id, updateStoreDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma loja' })
  @ApiResponse({ status: 200, description: 'A loja foi removida com sucesso.' })
  remove(@Param('id') id: string) {
    return this.storesService.remove(+id);
  }
}
