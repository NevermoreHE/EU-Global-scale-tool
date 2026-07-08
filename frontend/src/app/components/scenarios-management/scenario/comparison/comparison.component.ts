import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GlobalService } from '../../../../services/global.service';
import { ModelChartService } from '../../../../services/model-chart.service';
import { PoliciesService } from '../../../../services/policies.service';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { baseline } from '../../../../../../public/baseline';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss']
})
export class ComparisonComponent implements OnInit {

  public configuration : any = {series:[], seriesBaseline:[], seriesCompare:[]};
  public loading:boolean = false;
  public loadingCompare:boolean = false;
  public form: FormGroup;
  public scenario: any ;
  public scenarioCompare: any ;
  public graph: any;
  public graphBase:any;
  public graphCompare: any;
  public graphBaseCompare:any;
  public indicators:any[] = [];
  public regions: any[] = [];
  public summary: any[] = [];
  public summaryCompare: any[] = [];
  public suscriptions: any[] = [];
  public indicatorSelected: any;
  public progressPercentage: any;
  public progressPercentageCompare: any;

  
  public policiesInit: any[] = [];
  public policiesInitCompare: any[] = [];
  public policiesToCompare: any[] = [];
  public policiesToCompareCompare: any[] = [];
  public seriesCalculados: any;
  public seriesError: any;
  public seriesErrorCompare: any;
  public confirmIsVisible: boolean = false;
  public baselineSerie: any[] = [];
  public firstYearAplication: any;
  public lastYearAplication: any;
  public firstYearAplicationCompare: any;
  public lastYearAplicationCompare: any;
  public showPdfIndicators:boolean = false;
  
  constructor(private fb: FormBuilder,private service:GlobalService, private chartService: ModelChartService,private policiesService: PoliciesService, private route: ActivatedRoute, private alertService: AlertService) {
    this.loading = true;
    this.form = this.fb.group({
      indicator:[],
      region:[],
      compare:[false],
      yearsAplication:[false]
    });

    this.suscriptions.push(
      this.form.controls['indicator'].valueChanges.subscribe({
        next:(indicatorId:any)=>{
          this.form.controls['region'].reset();
          this.graph = null;
          this.graphBase = null;
          this.graphCompare = null;
          this.graphBaseCompare = null;
          this.indicatorSelected = this.indicators.find((i:any)=> i.id == indicatorId);
          this.regions = this.indicatorSelected.regiones;
          if(this.regions.length == 0){
            this.regions = [{id:0,region:'All'}];
            this.form.controls['region'].setValue(0);
          }
        }
      })
    );

    this.suscriptions.push(
      this.form.controls['region'].valueChanges.subscribe({
        next:(value:any)=>{
          if(value !== null){
            this.getCharts(value, this.form.controls['indicator'].value, this.form.controls['compare'].value, this.form.controls['yearsAplication'].value);
          }
        }
      })
    )

    this.suscriptions.push(
      this.form.controls['compare'].valueChanges.subscribe({
        next:(value:any)=>{
          this.getCharts(this.form.controls['region'].value, this.form.controls['indicator'].value, value, this.form.controls['yearsAplication'].value);
        }
      })
    );

    this.suscriptions.push(
      this.form.controls['yearsAplication'].valueChanges.subscribe({
        next:(value:any)=>{
          this.getCharts(this.form.controls['region'].value, this.form.controls['indicator'].value, this.form.controls['compare'].value, value);
        }
      })
    );

    this.graphBase= {
      layout : {
        autosize: true,
        responsive: true
      }
    }

    this.graphBaseCompare= {
      layout : {
        autosize: true,
        responsive: true
      }
    }

    this.route.params.subscribe({
      next:(param:Params)=>{
        const id = parseInt(param['id'], 10);
        const idCompare = parseInt(param['idCompare'], 10);
        this.suscriptions.push(
          forkJoin([this.service.getScenario(id),this.service.getScenario(idCompare)]).subscribe({
            next:([data,dataCompare])=>{
              this.scenario = data;
              this.scenarioCompare = dataCompare;
              this.setInitValues();
              this.getSummary();
              this.getSeries();
            }
          })
        );
      }
    })
  }
  
  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.suscriptions.forEach((s:Subscription)=>{
      s.unsubscribe();
    })
  }

  setInitValues(){
    this.policiesInit = structuredClone(this.policiesService.policies) ;
    this.policiesInitCompare = structuredClone(this.policiesService.policies) ;
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
    if(this.scenarioCompare?.policies){
      this.policiesInitCompare.forEach((sector:any)=>{
        sector.policies.forEach((policy:any)=>{
          policy.subpolicies.forEach((subpolicy:any)=>{
            subpolicy.default_value = this.scenarioCompare.policies[subpolicy.id - 1];
          })

          policy.regions.forEach((region:any)=>{
            region.subpolicies.forEach((subpolicy:any)=>{
              subpolicy.default_value = this.scenarioCompare.policies[subpolicy.id - 1];
            })

            region.subsector.forEach((subsector:any)=>{
              subsector.subpolicies.forEach((subpolicy:any)=>{
                subpolicy.default_value = this.scenarioCompare.policies[subpolicy.id - 1];
              })
            })
          })
        });
      });
    }
    this.policiesToCompare = structuredClone(this.policiesInit);
    this.policiesToCompareCompare = structuredClone(this.policiesInitCompare);
  }

  getCharts(regionId:any, chartId:any, compare:boolean, showYearsAplication: boolean){
    let seriesIndicator = [];
    let seriesCompareIndicator = [];
    let seriesBaseIndicator = [];
    let indicator = this.indicators.find((i:any)=> i.id == chartId);
    if(regionId == 0){
      seriesIndicator = this.configuration.series.filter((serie:any)=> serie.indicador_id == chartId);
      seriesCompareIndicator = this.configuration.seriesCompare.filter((serie:any)=> serie.indicador_id == chartId);
      seriesBaseIndicator = this.configuration.seriesBaseline.filter((serie:any)=> serie.indicador_id == chartId);
    }else{
      seriesIndicator = this.configuration.series.filter((serie:any)=> serie.indicador_id == chartId && serie.region_id == regionId);
      seriesCompareIndicator = this.configuration.seriesCompare.filter((serie:any)=> serie.indicador_id == chartId && serie.region_id == regionId);
      seriesBaseIndicator = this.configuration.seriesBaseline.filter((serie:any)=> serie.indicador_id == chartId && serie.region_id == regionId);
    }
    
    const region = this.regions.find((r:any)=> r.id == regionId).region;
    const chart = this.indicators.find((i:any)=> i.id == chartId).nombre;
    const nombre = chart + (region == 'All' ? '' : ' - ' + region);
    const data = {
      title: (seriesBaseIndicator.length == 1 || !compare) ? nombre : nombre+ ' (Simulated scenario)',
      dataBase: (compare || seriesIndicator.length == 0) ? seriesBaseIndicator : [],
      dataModified: seriesIndicator,
      units: indicator.unidades,
      firstYear: this.firstYearAplication,
      lastYear: this.lastYearAplication,
      showYearsAplication
    };
    this.graph = this.chartService.getChart(data);
    if(seriesBaseIndicator.length > 1 && compare){
      const dataBase = {
        title:  (seriesBaseIndicator.length == 1 || !compare) ? nombre : nombre+ ' (Baseline)',
        dataBase: seriesBaseIndicator,
        dataModified: [],
        units: indicator.unidades,
        firstYear: this.firstYearAplication,
        lastYear: this.lastYearAplication,
        showYearsAplication
      }
      this.graphBase = this.chartService.getChart(dataBase);
    }else{
      this.graphBase = null;
    }
    
    const dataCompare = {
      title: (seriesBaseIndicator.length == 1 || !compare) ? nombre : nombre+ ' (Simulated scenario)',
      dataBase: (compare || seriesCompareIndicator.length == 0) ? seriesBaseIndicator : [],
      dataModified: seriesCompareIndicator,
      units: indicator.unidades,
      firstYear: this.firstYearAplicationCompare,
      lastYear: this.lastYearAplicationCompare,
      showYearsAplication
    };
    this.graphCompare = this.chartService.getChart(dataCompare);
    if(seriesBaseIndicator.length > 1 && compare){
      const dataBase = {
        title:  (seriesBaseIndicator.length == 1 || !compare) ? nombre : nombre+ ' (Baseline)',
        dataBase: seriesBaseIndicator,
        dataModified: [],
        units: indicator.unidades,
        firstYear: this.firstYearAplicationCompare,
        lastYear: this.lastYearAplicationCompare,
        showYearsAplication
      }
      this.graphBaseCompare = this.chartService.getChart(dataBase);
    }else{
      this.graphBaseCompare = null;
    }
  }

  getSummary(){
    let policyModified = this.getModified();
    this.policiesService.policies.forEach((sector:any)=>{
      sector.policies.forEach((policy:any)=>{
        policy.subpolicies.forEach((subpolicy:any)=>{
          this.addToSummary(subpolicy,(sector.sector_name + ' - ' + policy.name + ' - ' + subpolicy.name), policyModified.modified, this.summary, policy);
          this.addToSummary(subpolicy,(sector.sector_name + ' - ' + policy.name + ' - ' + subpolicy.name), policyModified.modifiedCompare, this.summaryCompare, policy, true);
        })

        policy.regions.forEach((region:any)=>{
          region.subpolicies.forEach((subpolicy:any)=>{
            this.addToSummary(subpolicy,(sector.sector_name + ' - ' + policy.name + ' - Region: ' + region.name + ' - ' + subpolicy.name), policyModified.modified, this.summary, region, policy.subpolicies);
            this.addToSummary(subpolicy,(sector.sector_name + ' - ' + policy.name + ' - Region: ' + region.name + ' - ' + subpolicy.name), policyModified.modifiedCompare, this.summaryCompare, region, policy.subpolicies, true);
          })

          region.subsector.forEach((subsector:any)=>{
            subsector.subpolicies.forEach((subpolicy:any)=>{
              this.addToSummary(subpolicy,(sector.sector_name + ' - ' + policy.name + ' - Region: ' + region.name + ' - ' + subsector.name + ' - ' + subpolicy.name), policyModified.modified, this.summary, subsector, policy.subpolicies);
              this.addToSummary(subpolicy,(sector.sector_name + ' - ' + policy.name + ' - Region: ' + region.name + ' - ' + subsector.name + ' - ' + subpolicy.name), policyModified.modifiedCompare, this.summaryCompare, subsector, policy.subpolicies, true);
            })
          })
        })
      });
    });
  }

  addToSummary(subpolicy:any, title:string, modified:any, summaryToAdd: any[], parent:any, principalSubpolicies?:any, compare?:boolean){
    let policyModified = modified.find((p:any)=> p.id_policy == subpolicy.id);
    if(policyModified.initial_value != subpolicy.default_value){
      summaryToAdd.push({
        title: title,
        value_base: this.policiesService.formaterTooltipSlider(subpolicy,subpolicy.default_value),
        value_modified: this.policiesService.formaterTooltipSlider(subpolicy,policyModified.initial_value)
      });
      this.checkYears(parent,modified, principalSubpolicies, compare);
    }
  }

  checkYears(parent:any, modified:any, principalSubpolicies?:any, compare?:boolean){
    let iniYear = parent.subpolicies?.find((s:any)=> s.variable.includes("YEAR INITIAL")) ? parent.subpolicies?.find((s:any)=> s.variable.includes("YEAR INITIAL")) : principalSubpolicies?.find((s:any)=> s.variable.includes("YEAR INITIAL"));
    let finalYear = parent.subpolicies?.find((s:any)=> s.variable.includes("YEAR FINAL")) ? parent.subpolicies?.find((s:any)=> s.variable.includes("YEAR FINAL")) : principalSubpolicies?.find((s:any)=> s.variable.includes("YEAR FINAL"));
    iniYear = modified.find((p:any)=> p.id_policy == iniYear?.id)?.initial_value;
    finalYear = modified.find((p:any)=> p.id_policy == finalYear?.id)?.initial_value;

    if(compare){
      if(!this.firstYearAplicationCompare || iniYear < this.firstYearAplicationCompare)
        this.firstYearAplicationCompare = iniYear;
      
      if(!this.lastYearAplicationCompare || finalYear > this.lastYearAplicationCompare)
        this.lastYearAplicationCompare = finalYear;
    }else{
      if(!this.firstYearAplication || iniYear < this.firstYearAplication)
        this.firstYearAplication = iniYear;
      
      if(!this.lastYearAplication || finalYear > this.lastYearAplication)
        this.lastYearAplication = finalYear;
    }
  }

  getModified(){
    let modified: any = structuredClone(baseline);
    let modifiedCompare: any = structuredClone(baseline);

    this.policiesInit.forEach((sector:any)=>{
      sector.policies.forEach((policy:any)=>{

        policy.subpolicies.forEach((subpolicy:any)=>{
          modified.find((p:any)=> p.id_policy == subpolicy.id).initial_value = subpolicy.default_value;
        })

        policy.regions.forEach((region:any)=>{

          region.subpolicies.forEach((subpolicy:any)=>{
            modified.find((p:any)=> p.id_policy == subpolicy.id).initial_value = subpolicy.default_value;
          })

          region.subsector.forEach((subsector:any)=>{

            subsector.subpolicies.forEach((subpolicy:any)=>{
              modified.find((p:any)=> p.id_policy == subpolicy.id).initial_value = subpolicy.default_value;
            })

          })
        })
      });
    });

    this.policiesInitCompare.forEach((sector:any)=>{
      sector.policies.forEach((policy:any)=>{

        policy.subpolicies.forEach((subpolicy:any)=>{
          modifiedCompare.find((p:any)=> p.id_policy == subpolicy.id).initial_value = subpolicy.default_value;
        })

        policy.regions.forEach((region:any)=>{

          region.subpolicies.forEach((subpolicy:any)=>{
            modifiedCompare.find((p:any)=> p.id_policy == subpolicy.id).initial_value = subpolicy.default_value;
          })

          region.subsector.forEach((subsector:any)=>{

            subsector.subpolicies.forEach((subpolicy:any)=>{
              modifiedCompare.find((p:any)=> p.id_policy == subpolicy.id).initial_value = subpolicy.default_value;
            })

          })
        })
      });
    });
    return {modified,modifiedCompare};
  }
  
  getSeries(confirm?:boolean){
    this.loading = true;
    this.loadingCompare = true;
    this.seriesError = false;
    this.seriesErrorCompare = false;
    this.progressPercentage = null;
    this.progressPercentageCompare = null;

    let modified = this.getModified();

    this.suscriptions.push(
      forkJoin([this.service.getSeries(modified.modified), this.service.getSeries(modified.modifiedCompare), this.service.getSeries(baseline),this.service.getIndicadores()])
      .subscribe({
        next:([series,seriesCompare,seriesBaseline,indicators]:any[])=>{
          this.configuration.seriesBaseline = seriesBaseline;

          if(series.length>0){
            this.configuration.series = series;
            this.loading = false;
          }else{
            this.loading = true;
            if(this.scenario.taskid)
              this.getStatusLoop((project:any)=>this.loading = false,this.scenario.taskid,modified.modified, false);        
            else if(confirm)
              this.confirmIsVisible = true;
            else
              this.loading = false;
          }
          if(seriesCompare.length>0){
            this.configuration.seriesCompare = seriesCompare;
            this.loadingCompare = false;
          }else{
            this.loadingCompare = true;
            if(this.scenarioCompare.taskid)
              this.getStatusLoop((project:any)=>this.loadingCompare = false,this.scenarioCompare.taskid,modified.modifiedCompare,true);        
            else if(confirm)
              this.confirmIsVisible = true;
            else
              this.loadingCompare = false;
          }

          this.indicators = indicators;
          this.form.controls['indicator'].setValue(indicators[0].id)
        },
        error:(err:any)=>{
          this.loading = false;
          this.loadingCompare = false;
        }
      })
    )
  }

  getStatusLoop(whenSuccess: (res:any)=>void, taskId:string,modified:any[], compare: boolean){
    if(compare){
      this.loadingCompare = true;
      this.seriesErrorCompare = false;
    }else{
      this.loading = true;
      this.seriesError = false;
    }
    this.seriesCalculados = false;
    this.suscriptions.push(
      this.service.getGlobalStatus(taskId).subscribe({
        next:(data:any)=>{
          if(data.state == "PENDING" || data.state == "PROGRESS"){
            if(compare)
              this.progressPercentageCompare = data.progress;
            else
              this.progressPercentage = data.progress;

            this.getStatusLoop(whenSuccess,taskId,modified, compare);
          }else if(data.state == "FAILURE"){
            this.alertService.addAlert({type:'error', message:data.status});

            if(compare){
              this.loadingCompare = false;
              this.seriesErrorCompare = true;
              this.progressPercentageCompare = null;
            }else{
              this.loading = false;
              this.seriesError = true;
              this.progressPercentage = null;
            }
          }else if(data.state == "SUCCESS"){
            this.suscriptions.push(
              this.service.getSeries(modified).pipe(finalize(()=>{compare ? this.loadingCompare = false : this.loading = false}))
              .subscribe({
                next:(series)=>{
                  whenSuccess(series);
                },
                error:()=>{
                  if(compare){
                    this.loadingCompare = false;
                    this.seriesErrorCompare = true;
                    this.progressPercentageCompare = null;
                  }else{
                    this.loading = false;
                    this.seriesError = true;
                    this.progressPercentage = null;
                  }
                }
              })
            )
          }
        },
        error:(err:any)=>{
          if(compare)
            this.loadingCompare = true;
          else
            this.loading = true;
        }
      })
    )
  }

  
  saveSeries(compare:boolean){
    this.loading = true;
    this.confirmIsVisible = false;
    let error = compare ? this.seriesErrorCompare : this.seriesError;
    if(error){
      let modified = compare ? this.getModified().modifiedCompare : this.getModified().modified;
      let id = compare ? this.scenarioCompare.id : this.scenario.id;
      this.suscriptions.push(
        this.service.saveSeries(modified, id).subscribe({
          next:(scenario:any)=>{
            if(compare){
              this.scenarioCompare = scenario;
              if(scenario.taskid){
                this.getStatusLoop(()=>this.loadingCompare = false,this.scenario.taskid,modified.modified, true);
              }else{
                this.getSeries();
              }
            }else{
              this.scenario = scenario;
              if(scenario.taskid){
                this.getStatusLoop(()=>this.loading = false,this.scenario.taskid,modified.modified, false);
              }else{
                this.getSeries();
              }
            }
          }, error:(err:any)=>{
            this.loading = false;
          }
        })
      )
    }else{
      this.getSeries();
    }
  }
}
