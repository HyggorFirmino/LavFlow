import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsOptional, IsIn, Min } from 'class-validator';

export class CreateStatusKanbanDto {
  @ApiProperty({
    description: 'O título de exibição da coluna no Kanban.',
    example: 'Pronto para Retirada',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    description: 'A ordem numérica em que a coluna deve aparecer no quadro (menor para maior).',
    example: 4,
  })
  @IsInt()
  ordem: number;

  @ApiProperty({
    description: 'O número máximo de cartões que a lista pode conter.',
    example: 10,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  limiteCartoes?: number;

  @ApiProperty({
    description: 'O tipo de lista, que define seu comportamento no frontend.',
    example: 'dryer',
    enum: ['default', 'dryer', 'lavadora'],
    default: 'default',
    required: false,
  })
  @IsIn(['default', 'dryer', 'lavadora'])
  @IsOptional()
  tipo?: 'default' | 'dryer' | 'lavadora';

  @ApiProperty({
    description: 'O tempo total de secagem em minutos (apenas para listas do tipo \'dryer\').',
    example: 45,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  tempoSecagemTotal?: number;

  @ApiProperty({
    description: 'O intervalo em minutos para enviar lembretes (apenas para listas do tipo \'dryer\').',
    example: 15,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  intervaloLeitura?: number;
}