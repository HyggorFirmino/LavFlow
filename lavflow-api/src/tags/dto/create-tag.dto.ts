import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: 'Nome único da etiqueta', example: 'Prioridade' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Tipo da etiqueta (texto ou número)', example: 'texto', enum: ['texto', 'número'] })
  @IsString()
  @IsIn(['texto', 'número'])
  type: 'texto' | 'número';

  @ApiProperty({ description: 'Classe CSS para a cor da etiqueta', example: 'bg-blue-100 text-blue-800' })
  @IsString()
  @IsNotEmpty()
  color: string;
}
