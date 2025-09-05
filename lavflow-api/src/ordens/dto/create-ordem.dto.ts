import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class CardTagDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  value?: string;
}


class ServicesDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  washing: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  drying: boolean;
}

export class CreateOrdemDto {
  @ApiProperty({ description: 'Nome do cliente.', example: 'Maria Souza' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ description: 'Documento do cliente (CPF).', example: '123.456.789-00', required: false })
  @IsOptional()
  @IsString()
  customerDocument?: string;

  @ApiProperty({ description: 'Telefone ou e-mail do cliente.', example: '11987654321' })
  @IsString()
  @IsNotEmpty()
  contact: string;

  @ApiProperty({ description: 'Observações sobre o serviço.', example: 'Não usar amaciante.', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Tags do cartão.', type: [CardTagDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardTagDto)
  tags?: CardTagDto[];

  @ApiProperty({ description: 'ID do status inicial.', example: 1 })
  @IsInt()
  idStatusInicial: number;

  @ApiProperty({ description: 'Identificador do cesto.', example: 'Cesto A-12', required: false })
  @IsOptional()
  @IsString()
  basketIdentifier?: string;

  @ApiProperty({ description: 'Valor do serviço.', example: 55.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  serviceValue?: number;

  @ApiProperty({ description: 'Método de pagamento.', example: 'pix', enum: ['dinheiro', 'pix'], required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: 'dinheiro' | 'pix';

  @ApiProperty({ description: 'Serviços a serem realizados.', type: ServicesDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ServicesDto)
  services?: ServicesDto;

  @ApiProperty({ description: 'ID do funcionário responsável.', example: 1, required: false })
  @IsOptional()
  @IsInt()
  idFuncionarioResponsavel?: number;
}