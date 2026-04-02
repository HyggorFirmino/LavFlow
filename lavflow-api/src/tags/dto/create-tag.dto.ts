import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn, IsNumber, IsOptional } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: 'Nome único da etiqueta', example: 'Prioridade' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Tipo da etiqueta (texto, número ou valor)', example: 'texto', enum: ['texto', 'número', 'valor'] })
  @IsString()
  @IsIn(['texto', 'número', 'valor'])
  type: 'texto' | 'número' | 'valor';

  @ApiProperty({ description: 'Classe CSS para a cor da etiqueta', example: 'bg-blue-100 text-blue-800' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ description: 'Valor base para etiquetas do tipo valor', example: 15.50, required: false })
  @IsOptional()
  @IsNumber()
  baseValue?: number;

  @ApiProperty({ description: 'ID da Loja à qual a etiqueta pertence', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  storeId: number;
}
