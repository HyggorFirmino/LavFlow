import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateFuncionarioDto } from './create-funcionario.dto';

export class UpdateFuncionarioDto extends PartialType(CreateFuncionarioDto) {
  @ApiProperty({ description: 'Nome do funcionário', example: 'Maria de Souza', required: false })
  nome?: string;

  @ApiProperty({ description: 'Cargo do funcionário', example: 'Gerente', required: false })
  cargo?: string;
}
