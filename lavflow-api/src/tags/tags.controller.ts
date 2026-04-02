import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ApiOperation, ApiResponse, ApiTags as SwaggerApiTags } from '@nestjs/swagger';
import { Tag } from './entities/tag.entity';

@SwaggerApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova etiqueta' })
  @ApiResponse({ status: 201, description: 'Etiqueta criada com sucesso.', type: Tag })
  @ApiResponse({ status: 409, description: 'Etiqueta com este nome já existe.' })
  create(@Body() createTagDto: CreateTagDto): Promise<Tag> {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as etiquetas' })
  @ApiResponse({ status: 200, description: 'Lista de etiquetas retornada com sucesso.', type: [Tag] })
  findAll(@Query('storeId') storeId?: number): Promise<Tag[]> {
    return this.tagsService.findAll(storeId ? Number(storeId) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma etiqueta pelo ID' })
  @ApiResponse({ status: 200, description: 'Etiqueta encontrada.', type: Tag })
  @ApiResponse({ status: 404, description: 'Etiqueta não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Tag> {
    return this.tagsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma etiqueta existente' })
  @ApiResponse({ status: 200, description: 'Etiqueta atualizada com sucesso.', type: Tag })
  @ApiResponse({ status: 404, description: 'Etiqueta não encontrada.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTagDto: UpdateTagDto): Promise<Tag> {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma etiqueta' })
  @ApiResponse({ status: 204, description: 'Etiqueta removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Etiqueta não encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tagsService.remove(id);
  }
}
