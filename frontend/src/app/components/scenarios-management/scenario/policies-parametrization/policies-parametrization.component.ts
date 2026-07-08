import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { PoliciesService } from '../../../../services/policies.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NzMarks } from 'ng-zorro-antd/slider';
import { GlobalService } from '../../../../services/global.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { baseline } from '../../../../../../public/baseline';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'app-policies-parametrization',
  templateUrl: './policies-parametrization.component.html',
  styleUrls: ['./policies-parametrization.component.scss']
})
export class PoliciesParametrizationComponent implements OnInit {
  @Input() scenario: any ;
  @Input() firstCharge: boolean = true;
  @Output() goResults: EventEmitter<any> = new EventEmitter();
  @ViewChild('tabContainer') tabContainer!: ElementRef;
  public suscriptions: any[] = [];
  public policiesInit: any[] = [];
  public policiesToCompare : any[] = [];
  public loading = false;
  public form : FormGroup;
  public sectorSelected : any;
  public policySelected : any;
  public regionSelected : any;
  public subsectorSelected : any;
  public seriesCalculados: any;
  public seriesError: any;
  public policiesModified: any[] = [];
  public confirmIsVisible: boolean = false;
  public baselineSerie: any[] = [];
  public progressPercentage: number | null = null;
  
  constructor(public policiesService: PoliciesService, private fb:FormBuilder, private globalService: GlobalService, private alertService: AlertService) {
    this.loading = true;
    this.form = this.fb.group({});
  }

  ngOnInit() {
    this.baselineSerie = [];
    this.policiesModified = [];
    this.progressPercentage = null;
    this.setInitValues();
    this.getForm();
    this.sectorSelected = this.policiesInit[0];
    this.policySelected = this.sectorSelected.policies[0];
    if(this.scenario?.policies)
      this.getSeries();
    else
      this.loading = false;
  }

  ngOnDestroy(): void {
    this.suscriptions.forEach((s:Subscription)=> s.unsubscribe());
  }

  setInitValues(){
    this.policiesInit = structuredClone(this.policiesService.policies) ;
    if(this.scenario?.policies){
      this.policiesInit.forEach((sector:any)=>{
        sector.policies.forEach((policy:any)=>{
          policy.subpolicies.forEach((subpolicy:any)=>{
            subpolicy.default_value = this.scenario.policies[subpolicy.id - 1];
          })

          policy.regions.forEach((region:any)=>{
            region.subpolicies.forEach((subpolicy:any)=>{
              subpolicy.default_value = this.scenario.policies[subpolicy.id - 1];
            })

            region.subsector.forEach((subsector:any)=>{
              subsector.subpolicies.forEach((subpolicy:any)=>{
                subpolicy.default_value = this.scenario.policies[subpolicy.id - 1];
              })
            })
          })
        });
      });
    }
    this.policiesToCompare = structuredClone(this.policiesInit);
  }

  getForm(){
    this.policiesInit.forEach((sector:any)=>{
      sector.policies.forEach((policy:any)=>{
        this.getControlsFromSubpolicies(policy.subpolicies);

        policy.regions.forEach((region:any)=>{
          this.getControlsFromSubpolicies(region.subpolicies);

          region.subsector.forEach((subsector:any)=>{
            this.getControlsFromSubpolicies(subsector.subpolicies);
          })
        })
      }); 
    });
    
    this.policiesInit.forEach((sector:any)=>{
      sector.policies.forEach((policy:any)=>{
        this.setStateOfControls(policy.subpolicies, policy.regions);

        policy.regions.forEach((region:any)=>{
          this.setStateOfControls(region.subpolicies, region.subsector);

          region.subsector.forEach((subsector:any)=>{
            this.setStateOfControls(subsector.subpolicies);
          })
        })
      }); 
    });
  }

  setStateOfControls(subpolicies:any[], otherToDisable?:any[]){
    subpolicies.forEach((subpolicy:any)=>{
      if(subpolicy.type == 'switch-activator'){
        this.togleEnableAll(subpolicies, subpolicy.default_value, otherToDisable);
      }

        this.form.controls['subpolicy'+subpolicy.id].valueChanges.subscribe({
          next:(value:any)=>{
            if(subpolicy.type == 'switch-activator'){
              this.togleEnableAll(subpolicies, value, otherToDisable);
            }
            let policyToCompare:any ;
            this.policiesInit.forEach((sector:any)=>{
              sector.policies.forEach((policy:any)=>{
                if(!policyToCompare)
                  policyToCompare = policy.subpolicies.find((p:any)=>p.id == subpolicy.id);

                policy.regions.forEach((region:any)=>{
                  if(!policyToCompare)
                    policyToCompare = region.subpolicies.find((p:any)=>p.id == subpolicy.id);

                  region.subsector.forEach((subsector:any)=>{
                    if(!policyToCompare)
                      policyToCompare = subsector.subpolicies.find((p:any)=>p.id == subpolicy.id);
                  })
                })
              }); 
            });
            
            if(this.policiesModified.find((p:any)=> p.id == subpolicy.id)){
              if(policyToCompare?.default_value == value){
                this.policiesModified = this.policiesModified.filter((p:any)=> p.id != subpolicy.id);
              }else{
                this.policiesModified.find((p:any)=> p.id == subpolicy.id).default_value = value
              }
            }else{
              if(policyToCompare?.default_value != value){
                this.policiesModified.push({
                  id: subpolicy.id,
                  default_value: value
                });
              }
            }
          }
        });
    });
  }
  
  getControlsFromSubpolicies(subpolicies:any[]){
    subpolicies.forEach((subpolicy:any)=>{
      this.form.addControl(('subpolicy'+subpolicy.id),new FormControl(subpolicy.default_value));
    });
  }

  togleEnableAll(subpolicies:any[], enable:boolean, otherToDisable?:any[]){
    this.togleEnableSubpolicies(subpolicies, enable);

    if(otherToDisable){
      otherToDisable.forEach((toDisable:any)=>{
        this.togleEnableSubpolicies(toDisable.subpolicies, enable);

        if(toDisable?.subsector){
          toDisable.subsector.forEach((subsector:any)=>{
            this.togleEnableSubpolicies(subsector.subpolicies, enable);
          })
        }
      })
    }
  }

  togleEnableSubpolicies(subpolicies:any[], enable:boolean){
    subpolicies.forEach((subpolicy:any)=>{
      if(subpolicy.type != 'switch-activator'){
        if(enable)
          this.form.controls['subpolicy'+subpolicy.id].enable();
        else
          this.form.controls['subpolicy'+subpolicy.id].disable();
      }
    });
  }

  changeTab(tab:any){
    this.sectorSelected = tab;
    this.policySelected = this.sectorSelected.policies[0];
    this.regionSelected = null;
    const container = this.tabContainer.nativeElement;
    container.scrollLeft = 0;
  }

  openPolicy(policy:any){
    this.policySelected = policy;
    this.regionSelected = null;
  }
  
  openRegion(region:any){
    this.regionSelected = region;
    if(region.subsector.length)
      this.subsectorSelected = region.subsector[0];
  }

  cancelRegion(){
    this.resetControls(this.regionSelected.subpolicies);
    this.regionSelected.subsector.forEach((subsector:any)=>{
      this.resetControls(subsector.subpolicies);
    })
    this.regionSelected = null;
  }

  resetControls(subpolicies:any[]){
    subpolicies.forEach((subpolicy:any)=>{
      this.form.controls['subpolicy'+subpolicy.id].setValue(subpolicy.default_value);
    })
  }

  saveRegion(){
    this.setSubpoliciesFromControls(this.regionSelected.subpolicies);

    this.regionSelected.subsector.forEach((subsector:any)=>{
      this.setSubpoliciesFromControls(subsector.subpolicies);
    });
    
    this.regionSelected = null;
  }

  setSubpoliciesFromControls(subpolicies:any[]){
    subpolicies.forEach((subpolicy:any)=>{
      let subpolicyInJson:any = null ;

      this.policiesInit.forEach((sector:any)=>{
        sector.policies.forEach((policy:any)=>{
          if(!subpolicyInJson){
            subpolicyInJson = policy.subpolicies.find((s:any)=>s.id == subpolicy.id);
          }
        });
      });

      if(!subpolicyInJson){
        this.policiesInit.forEach((sector:any)=>{
          sector.policies.forEach((policy:any)=>{
          if(!subpolicyInJson){
            policy.regions.forEach((region:any)=>{
              if(!subpolicyInJson)
                subpolicyInJson = region.subpolicies.find((s:any)=>s.id == subpolicy.id);
            })
          }
          });
        });
      }

      if(!subpolicyInJson){
        this.policiesInit.forEach((sector:any)=>{
          sector.policies.forEach((policy:any)=>{
            policy.regions.forEach((region:any)=>{
              if(!subpolicyInJson){
                region.subsector.forEach((subsect:any)=>{
                  if(!subpolicyInJson)
                    subpolicyInJson = subsect.subpolicies.find((s:any)=>s.id == subpolicy.id);
                })
              }
            })
          });
        });
      }

      subpolicyInJson.default_value = this.form.controls['subpolicy'+subpolicy.id].value;
    });
  }

  openSubsector(subsector:any){
    this.subsectorSelected = subsector;
  }
  
  scrollTabs(direction: 'left' | 'right'): void {
    const scrollAmount = 155;
    const container = this.tabContainer.nativeElement;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
  
  onMouseWheel(event: WheelEvent): void {
    event.preventDefault();
    this.tabContainer.nativeElement.scrollLeft += event.deltaY;
  }

  getSliderUtilities(field:any){
    let maxValue:number = Math.max(...field.values);
    let minValue:number = Math.min(...field.values);
    let marksValue:NzMarks = {};
    field.values.forEach((value:any)=>{
      marksValue[value] = value+'';
    });

    if(field.name.includes('%')){
      marksValue = {};
      field.values.forEach((value:any)=>{
        marksValue[value] = (value * 100) + '%';
      })
    }
    
    if(field.comments){
      marksValue = {};
      field.comments.forEach((coment:any)=>{
        marksValue[coment.key] = coment.value;
      })
    }
    
    return{
      max: maxValue,
      min: minValue,
      step: field.values[1] - field.values[0],
      marks: marksValue
    }
  }

  getModified(){
    let modified: any = structuredClone(baseline);

    this.policiesInit.forEach((sector:any)=>{
      sector.policies.forEach((policy:any)=>{

        policy.subpolicies.forEach((subpolicy:any)=>{
          modified.find((p:any)=> p.id_policy == subpolicy.id).initial_value = this.form.controls['subpolicy'+subpolicy.id].value;
        })

        policy.regions.forEach((region:any)=>{

          region.subpolicies.forEach((subpolicy:any)=>{
            modified.find((p:any)=> p.id_policy == subpolicy.id).initial_value = this.form.controls['subpolicy'+subpolicy.id].value;
          })

          region.subsector.forEach((subsector:any)=>{

            subsector.subpolicies.forEach((subpolicy:any)=>{
              modified.find((p:any)=> p.id_policy == subpolicy.id).initial_value = this.form.controls['subpolicy'+subpolicy.id].value;
            })

          })
        })
      });
    });

    return modified;
  }

  getSeries(confirm?:boolean){
    this.loading = true;
    let modified = this.getModified();
    
    forkJoin([this.globalService.getSeries(modified),this.globalService.getSeries(baseline)]).subscribe({
      next:([series,seriesBaseline]:any[])=>{
        this.baselineSerie = seriesBaseline;
        if(series.length>0){
          if(this.policiesModified.length == 0){
            if(confirm || this.firstCharge)
              this.goResults.emit({policiesResults:modified,series,seriesBaseline, isBaseline: (this.policiesModified.length == 0 && !this.scenario.policies)});
            this.loading = false;
          }else
            this.saveSeries();
        }else{
          if(this.scenario.taskid && this.firstCharge)
            this.getStatusLoop((project:any)=>this.showResults(project),this.scenario.taskid,modified);        
          else if(confirm)
            this.confirmIsVisible = true;
          else
            this.loading = false;
        }
      },
      error:(err:any)=>{
        this.loading = false
      }
    })
  }

  
  saveSeries(){
    this.loading = true;
    this.confirmIsVisible = false;
    if(this.policiesModified.length > 0 || this.seriesError){
      let modified = this.getModified();

      this.suscriptions.push(
        this.globalService.saveSeries(modified, this.scenario.id).subscribe({
          next:(scenario:any)=>{
            this.scenario = scenario;
            this.policiesModified = [];
            if(scenario.taskid){
              this.getStatusLoop((series:any)=>this.showResults(series),scenario.taskid,modified);
            }else{
              this.getSeries(true);
            }
          }, error:(err:any)=>{
            this.loading = false;
          }
        })
      )
    }else{
      this.getSeries(true);
    }
  }
  
  getStatusLoop(whenSuccess: (res:any)=>void, taskId:string,modified:any[]){
    this.seriesError = false;
    this.seriesCalculados = false;
    this.suscriptions.push(
      this.globalService.getGlobalStatus(taskId).subscribe({
        next:(data:any)=>{
          if(data.state == "PENDING" || data.state == "PROGRESS"){
            this.progressPercentage = data.progress;
            this.getStatusLoop(whenSuccess,taskId,modified);
          }else if(data.state == "FAILURE"){
            this.alertService.addAlert({type:'error', message:data.status});
            this.seriesError = true;
            this.loading = false;
            this.progressPercentage = null;
          }else if(data.state == "SUCCESS"){
            this.suscriptions.push(
              this.globalService.getSeries(modified).pipe(finalize(()=>{this.loading = false}))
              .subscribe({
                next:(series)=>{
                  whenSuccess(series);
                },
                error:()=>{
                  this.seriesError = true;
                }
              })
            )
          }
        },
        error:(err:any)=>{
          this.loading = false;
        }
      })
    )
  }

  showResults(series:any){
    if(this.progressPercentage != null)
      this.progressPercentage = 100;
    setTimeout(() => {
      this.seriesCalculados = true;
      this.seriesError = false;
      this.loading = false;
      let seriesBaseline = this.baselineSerie;
      let modified = this.getModified();
      this.goResults.emit({policiesResults:modified,series,seriesBaseline, isBaseline: (this.policiesModified.length == 0 && !this.scenario.policies)});
    }, 1000);  
  }
}
