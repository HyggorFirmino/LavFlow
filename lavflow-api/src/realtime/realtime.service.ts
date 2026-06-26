import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface RealtimeEvent {
  storeId: string | number;
  type: string;
  data?: any;
}

@Injectable()
export class RealtimeService {
  private readonly events$ = new Subject<RealtimeEvent>();

  emit(storeId: string | number, type: string, data?: any) {
    this.events$.next({ storeId, type, data });
  }

  getEvents(): Observable<RealtimeEvent> {
    return this.events$.asObservable();
  }
}
