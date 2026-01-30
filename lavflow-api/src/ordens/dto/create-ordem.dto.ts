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
  @ApiProperty({ description: 'ID do cliente.', example: 'uuid-v4' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

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

  @ApiProperty({ description: 'ID do usuário responsável.', example: 1, required: false })
  @IsOptional()
  @IsInt()
  idFuncionarioResponsavel?: number;

  @ApiProperty({ description: 'ID da loja (para definir status inicial automaticamente).', example: 1, required: false })
  @IsOptional()
  @IsInt()
  storeId?: number;
}