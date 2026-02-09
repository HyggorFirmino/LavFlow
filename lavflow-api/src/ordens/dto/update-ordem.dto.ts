import { PartialType } from '@nestjs/swagger';
import { CreateOrdemDto } from './create-ordem.dto';
import { IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrdemDto extends PartialType(CreateOrdemDto) {
    @ApiProperty({ description: 'Timestamp quando o card entrou na secadora', required: false, type: String })
    @IsOptional()
    @IsDateString()
    enteredDryerAt?: string;
}
