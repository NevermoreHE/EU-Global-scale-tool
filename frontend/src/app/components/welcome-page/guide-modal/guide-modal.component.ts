import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guide-modal',
  templateUrl: './guide-modal.component.html',
  styleUrls: ['./guide-modal.component.scss']
})
export class GuideModalComponent implements OnInit {

  @Input() isVisible: boolean = false;
  public panel = 0;

  constructor(private router: Router) { }

  ngOnInit() {
    this.panel = 0;
  }

  handleCancel(){
    this.router.navigate(["scenarios"])
  }

  next(){
    if(this.panel<2)
      this.panel++;
    else
      this.handleCancel();

  }
}
