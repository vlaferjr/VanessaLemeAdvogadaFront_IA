import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private sidenavToggleSubject = new Subject<void>();
  sidenavToggle$: Observable<void> = this.sidenavToggleSubject.asObservable();

  requestSidenavToggle(): void {
    this.sidenavToggleSubject.next();
  }
}

