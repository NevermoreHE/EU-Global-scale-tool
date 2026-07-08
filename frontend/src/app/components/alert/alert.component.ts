import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { Alert } from '../../models/alert';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

  public alerts:Array<Alert> = [];
  
  constructor(private alertService: AlertService,
    private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.alertService.getAlert().subscribe(alert=> this.addAlert(alert));
  }
  public addAlert(alert:Alert){
    this.alerts.push(alert);
    this.setAlertTimeOut(alert);    
  }
  
  private setAlertTimeOut(alert: Alert) {
    setTimeout(() => {
      this.removeAlert(this.alerts.indexOf(alert));
      this.changeDetectorRef.detectChanges();
    }, 4500);    
  }

  removeAlert(index: number){
    this.alerts.splice(index, 1);    
  }
}
