import { IsInt } from 'class-validator';

export class MudarStatusOrdemDto {
  @IsInt()
  novoStatusId: number;
  
  @IsInt()
  idFuncionarioAcao: number;
}