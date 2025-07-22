import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFuncionarioDto {
  @ApiProperty({
    description: 'O nome completo do funcionário.',
    example: 'Carlos Andrade',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    description: 'O cargo que o funcionário ocupa na lavanderia.',
    example: 'Atendente',
  })
  @IsString()
  @IsNotEmpty()
  cargo: string;
}