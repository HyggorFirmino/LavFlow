import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { Observable, interval, merge } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('realtime')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    const events$ = this.realtimeService.getEvents().pipe(
      map((event) => ({
        data: event,
      } as MessageEvent)),
    );

    const heartbeat$ = interval(30000).pipe(
      map(() => ({
        data: { type: 'ping' },
      } as MessageEvent)),
    );

    return merge(events$, heartbeat$);
  }
}
