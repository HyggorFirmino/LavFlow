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
    description: 'A ordem numérica em que a coluna deve aparecer no quadro (menor para maior). Será calculada automaticamente se não fornecida.',
    example: 4,
    required: false,
  })
  @IsInt()
  @IsOptional()
  ordem?: number;

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
    enum: ['default', 'dryer', 'lavadora', 'whatsapp'],
    default: 'default',
    required: false,
  })
  @IsIn(['default', 'dryer', 'lavadora', 'whatsapp'])
  @IsOptional()
  tipo?: 'default' | 'dryer' | 'lavadora' | 'whatsapp';

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

  @ApiProperty({
    description: 'O ID da loja à qual esta lista pertence.',
    example: 1,
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  storeId: number;
}