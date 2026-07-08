import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Alert } from '../models/alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  public subject = new Subject<Alert>();

constructor() { }

  getAlert(): Observable<any> {
    return this.subject.asObservable();
  }

  public addAlert(alerta:Alert){
    this.subject.next(alerta);
  }
}
