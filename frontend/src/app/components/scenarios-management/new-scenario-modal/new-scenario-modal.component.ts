import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Scenario, TypeScenario } from '../../../models/scenario';
import { formatDate } from '@angular/common';
import { finalize, Subject } from 'rxjs';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'app-new-scenario-modal',
  templateUrl: './new-scenario-modal.component.html',
  styleUrls: ['./new-scenario-modal.component.scss']
})
export class NewScenarioModalComponent implements OnInit {

  @Input()  openModal: Subject<any> = new Subject();
  @Output() scenarioCreated : EventEmitter<any> = new EventEmitter();

  public isVisible !: boolean ;
  public scenarioId: number | null = null;
  public loading:boolean = false;
  public form:FormGroup;
  public typeScenarios = TypeScenario;

  constructor(private fb: FormBuilder, private service: GlobalService) {
    this.form = this.fb.group({
      name: [,Validators.required],
      description:[],
      isPublic:[true,Validators.required]
    })
  }

  ngOnInit() {
    this.isVisible = false;
    this.openModal.subscribe({
      next:(scenario:any)=> {
        this.loading = true;
        this.form.reset();
        this.scenarioId = null;

        if(scenario){
          this.scenarioId = scenario.id;
          this.setScenario(scenario);
        }

        this.isVisible = true;
        this.loading = false;
      },
    })
  }

  createScenario(scenario:Scenario){
    this.service.createScenario(scenario).pipe(finalize(()=>{
        this.loading = false;
    })).subscribe({
      next:()=>{
        this.scenarioCreated.emit()
        this.isVisible = false;
      }
    })
  }
  
  editScenario(scenario: Scenario){
    this.service.editScenario(scenario).pipe(finalize(()=>{
        this.loading = false;
    })).subscribe({
      next:()=>{
        this.scenarioCreated.emit();
        this.isVisible = false;
      }
    });
  }

  setScenario(scenario: Scenario){
    this.form.controls['name'].setValue(scenario.name);
    this.form.controls['description'].setValue(scenario.description);
    this.form.controls['isPublic'].setValue(scenario.is_public + '');
  }

  save(){
    this.loading = true;
    const scenario = new Scenario({
      name: this.form.controls['name'].value,
      description: this.form.controls['description'].value,
      is_public: this.form.controls['isPublic'].value  
    });

    if(this.scenarioId){
      scenario.id = this.scenarioId ?? 0;
      this.editScenario(scenario);
    }else{
      this.createScenario(scenario);
    }
  }
}
