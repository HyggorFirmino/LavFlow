import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('logs')
@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: LogsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new operation log' })
    create(@Body() createLogDto: CreateLogDto) {
        return this.logsService.create(createLogDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get recent logs' })
    @ApiQuery({ name: 'storeId', required: false, type: String })
    findAll(@Query('storeId') storeId?: string) {
        return this.logsService.findAll(storeId);
    }
}
