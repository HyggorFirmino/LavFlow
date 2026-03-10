import { ApiProperty } from "@nestjs/swagger";

export class CreateStoreDto {
    @ApiProperty({ description: 'Nome da loja', example: 'Empatiya Lavanderia Central' })
    name: string;

    @ApiProperty({ description: 'Descrição da loja', example: 'Matriz da rede Empatiya Lavanderia' })
    description: string;

    @ApiProperty({ description: 'Endereço da loja', example: 'Rua das Flores, 123' })
    address: string;

    @ApiProperty({ description: 'Telefone da loja', example: '(11) 99999-9999' })
    phone: string;

    @ApiProperty({ description: 'Horário de funcionamento', example: 'Seg-Sex 08:00 - 18:00' })
    operatingHours: string;

    @ApiProperty({ description: 'CNPJ da loja', example: '00.000.000/0000-00' })
    cnpj: string;

    @ApiProperty({ description: 'Preço da lavagem', example: 20.00 })
    washingPrice: number;

    @ApiProperty({ description: 'Preço da secagem', example: 20.00 })
    dryingPrice: number;

    @ApiProperty({ description: 'Preço do combo', example: 35.00 })
    comboPrice: number;

    @ApiProperty({ description: 'ID da loja externa (Maxpan)', example: 'STORE-123', required: false })
    maxpanId: string;

    @ApiProperty({ description: 'Refresh Token da Maxpan', required: false })
    refreshTokenMaxpan: string;

    @ApiProperty({ description: 'Bearer Token da Maxpan', required: false })
    BearerTokenMaxpan: string;

    @ApiProperty({ description: 'Data de Expiração do Refresh Token', required: false })
    refreshTokenMaxpanExpiration: string; // or Date

    @ApiProperty({ description: 'Data de Expiração do Bearer Token', required: false })
    BearerTokenMaxpanExpiration: string; // or Date
}
