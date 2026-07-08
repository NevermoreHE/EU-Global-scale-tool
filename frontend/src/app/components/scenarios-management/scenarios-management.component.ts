import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Scenario, TypeScenario } from '../../models/scenario';
import { finalize, Subject, Subscription } from 'rxjs';
import { GlobalService } from '../../services/global.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scenarios-management',
  templateUrl: './scenarios-management.component.html',
  styleUrls: ['./scenarios-management.component.scss']
})
export class ScenariosManagementComponent implements OnInit {

  public filterSelected:TypeScenario | null = TypeScenario.OWNER;
  public filters = TypeScenario;
  public scenarios: Scenario[] = [];
  public filteredScenarios: Scenario[] = [];
  public openModal : Subject<any> = new Subject();
  public loading: boolean = false;
  public subscriptions: Subscription[] = [];
  public comparing: boolean = false;
  public formComparing: FormGroup;
  public scenariosToCompare: any[] = [];

  constructor(private service: GlobalService, private fb:FormBuilder, private router: Router) {
    this.formComparing = this.fb.group({})
  }

  ngOnInit() {
    this.comparing = false;
    this.loadTable();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s:Subscription)=> s.unsubscribe());
  }

  loadTable(){
    this.filterSelected = TypeScenario.OWNER;
    this.loading = true;
    this.subscriptions.push(
      this.service.getScenarios().pipe(finalize(()=>this.loading = false)).subscribe({
        next:(data:any)=>{
          this.scenarios = data;
          this.createControls();
          this.changeFilter(this.filterSelected);
        }
      })
    );
  }

  createControls(){
    this.scenarios.forEach((s:any)=>{
      this.formComparing.addControl(('scenario' + s.id), new FormControl(false));
      this.formComparing.controls['scenario' + s.id].valueChanges.subscribe({
        next:(checked:boolean)=>{
          if(checked)
            this.scenariosToCompare.push(s);
          else
            this.scenariosToCompare = this.scenariosToCompare.filter((scenario:any)=> s.id != scenario.id);

          this.toggleEnableAll(!checked || this.scenariosToCompare.length != 2)
        }
      })
    });
  }

  toggleEnableAll(enable:boolean){
    this.scenarios.forEach((s:any)=>{
      if(enable)
        this.formComparing.controls['scenario'+ s.id].enable({emitEvent: false});
      else if(!this.formComparing.controls['scenario'+ s.id].value)
        this.formComparing.controls['scenario'+ s.id].disable({emitEvent: false});
    })
  }

  changeFilter(filter: TypeScenario | null){
    this.loading = true;
    this.filterSelected = filter;
    this.filteredScenarios = [...this.scenarios];
    if(this.filterSelected)
      this.filteredScenarios = (this.filterSelected == TypeScenario.OWNER) ? this.scenarios.filter((s:Scenario)=> s.is_owner) : this.scenarios.filter((s:Scenario)=> !s.is_owner);

    this.loading = false
  }

  editScenario(scenario:Scenario){
    this.openModal.next(scenario);
  }

  deleteScenario(idScenario:number){
    this.loading = true;
    this.subscriptions.push(
      this.service.deleteScenario(idScenario).pipe(finalize(()=> this.loading = false )).subscribe({
        next:()=>{
          this.scenarios = this.scenarios.filter((s:Scenario)=> s.id != idScenario);
          this.changeFilter(this.filterSelected)
        }
      })
    )
  }

  goToCompare(){
    this.router.navigate([('scenarios/'+ this.scenariosToCompare[0].id +'/'+this.scenariosToCompare[1].id)]);
  }
}