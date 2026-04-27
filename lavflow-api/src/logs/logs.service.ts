import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class LogsService {
    constructor(
        @InjectRepository(Log)
        private logsRepository: Repository<Log>,
    ) { }

    create(createLogDto: CreateLogDto) {
        const log = this.logsRepository.create(createLogDto);
        return this.logsRepository.save(log);
    }

    findAll(storeId?: string) {
        if (storeId) {
            return this.logsRepository.find({
                where: { storeId },
                order: { timestamp: 'DESC' },
                take: 100, // Limit to last 100 logs
            });
        }
        return this.logsRepository.find({
            order: { timestamp: 'DESC' },
            take: 100,
        });
    }
}
