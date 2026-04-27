import { ApiProperty } from '@nestjs/swagger';

export class CreateLogDto {
    @ApiProperty()
    customerName: string;

    @ApiProperty()
    machineName: string;

    @ApiProperty()
    machineType: string;

    @ApiProperty()
    storeId: string;
}
