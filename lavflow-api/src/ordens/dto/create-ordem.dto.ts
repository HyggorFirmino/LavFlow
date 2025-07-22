import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

// O tipo de dado para o nosso campo JSON de destaques.
// Definir uma interface ajuda na tipagem, mas não é obrigatório.
interface DadosDestaqueDto {
  [key: string]: string;
}

export class CreateOrdemDto {
  @ApiProperty({
    description: 'O título principal do cartão, geralmente com o nome do cliente e o tipo de serviço.',
    example: 'Maria Souza - Cesto de roupas coloridas',
  })
  @IsString({ message: 'O título da ordem deve ser um texto.' })
  @IsNotEmpty({ message: 'O título da ordem não pode estar vazio.' })
  tituloOrdem: string;

  @ApiProperty({
    description: 'O telefone ou e-mail do cliente para contato e notificações.',
    example: '11987654321',
  })
  @IsString({ message: 'O contato do cliente deve ser um texto.' })
  @IsNotEmpty({ message: 'O contato do cliente não pode estar vazio.' })
  contatoCliente: string;

  @ApiProperty({
    description: 'O valor total do serviço.',
    example: 55.5,
  })
  @IsNumber({}, { message: 'O valor total deve ser um número.' })
  @Min(0, { message: 'O valor total não pode ser negativo.' })
  valorTotal: number;

  @ApiProperty({
    description: 'O ID do status inicial da ordem (ex: 1 para "A Fazer").',
    example: 1,
  })
  @IsInt({ message: 'O ID do status inicial deve ser um número inteiro.' })
  idStatusInicial: number;

  @ApiProperty({
    description: 'Observações adicionais sobre o serviço, como pedidos especiais do cliente.',
    example: 'Não usar amaciante. Cliente tem alergia.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'As observações devem ser um texto.' })
  observacoes?: string;

  @ApiProperty({
    description: 'O ID do funcionário que está recebendo ou será o responsável inicial pela ordem.',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'O ID do funcionário responsável deve ser um número inteiro.' })
  idFuncionarioResponsavel?: number;

  @ApiProperty({
    description: 'Objeto JSON para gerar tags de destaque visual no cartão do Kanban.',
    example: { Prioridade: 'Alta', Tecido: 'Delicado' },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Os dados de destaque devem ser um objeto.' })
  dadosDestaque?: DadosDestaqueDto;
}