import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class MudarStatusOrdemDto {
  @ApiProperty({ description: 'O ID do novo status para a ordem.', example: 2 })
  @IsInt()
  novoStatusId: number;
  
  @ApiProperty({ description: 'O ID do funcionário que realizou a ação.', example: 1 })
  @IsInt()
  idFuncionarioAcao: number;
}