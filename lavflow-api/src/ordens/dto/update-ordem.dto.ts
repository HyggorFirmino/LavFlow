import { PartialType } from '@nestjs/swagger';
import { CreateOrdemDto } from './create-ordem.dto';

export class UpdateOrdemDto extends PartialType(CreateOrdemDto) { }
