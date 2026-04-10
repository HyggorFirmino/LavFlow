import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateClientDto {
    @ApiProperty({ description: 'Nome completo do cliente', example: 'João da Silva' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'CPF do cliente', example: '123.456.789-00' })
    @IsString()
    @IsNotEmpty()
    cpf: string;

    @ApiProperty({ description: 'Endereço completo', example: 'Rua das Flores, 123', required: false })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ description: 'Telefone', example: '(11) 98765-4321', required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ description: 'Data de nascimento', example: '1990-01-01', required: false, nullable: true })
    @IsDateString()
    @IsOptional()
    birthDate?: string | null;

    @ApiProperty({ description: 'Observações internas sobre o cliente', example: 'Cliente prefere entrega à tarde', required: false, nullable: true })
    @IsString()
    @IsOptional()
    notes?: string | null;
}
