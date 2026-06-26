import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from './entities/tag.entity';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag]),
    RealtimeModule,
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService] // Exporta TagsService para ser usado em outros módulos, se necessário
})
export class TagsModule {}
