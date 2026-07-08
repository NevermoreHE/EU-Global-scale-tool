import { Component, Input, OnInit } from '@angular/core';
import { GlobalService } from '../../../services/global.service';
import { finalize } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.scss']
})
export class ScenarioComponent implements OnInit {

  public scenario: any ;
  public panels = panels;
  public panel:panels | null = panels.CONFIG;
  public loading = true;
  public policies : any[] = [];
  public configuration : any;
  public firstCharge: boolean = true;

  constructor(private service: GlobalService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.loading = true;
    this.firstCharge = true;
    this.panel = panels.CONFIG
    this.route.params.subscribe({
      next:(param:Params)=>{
        const id = parseInt(param['id'], 10);
        this.service.getScenario(id).pipe(finalize(()=>this.loading = false)).subscribe({
          next:(data:any)=>{
            this.scenario = data;
          }
        });
      }
    })
  }

  goResults(results:any){
    this.loading = true;
    this.service.getScenario(this.scenario.id).pipe(finalize(()=>this.loading = false)).subscribe({
      next:(data:any)=>{
        this.scenario = data;
        this.configuration = results;
        this.firstCharge = false;
        this.panel = panels.RESULTS;
      }
    });
  }

  goBack(){
    this.panel = panels.CONFIG;
  }
}

enum panels{
  CONFIG,
  RESULTS
}