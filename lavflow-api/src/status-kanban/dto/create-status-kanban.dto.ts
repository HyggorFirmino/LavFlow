import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateStatusKanbanDto {
  @ApiProperty({
    description: 'O nome de exibição da coluna no Kanban.',
    example: 'Pronto para Retirada',
  })
  @IsString()
  @IsNotEmpty()
  nomeStatus: string;

  @ApiProperty({
    description: 'A ordem numérica em que a coluna deve aparecer no quadro (menor para maior).',
    example: 4,
  })
  @IsInt()
  ordemExibicao: number;
}