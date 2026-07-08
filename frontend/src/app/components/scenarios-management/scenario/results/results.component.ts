import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GlobalService } from '../../../../services/global.service';
import { finalize } from 'rxjs';
import { ModelChartService } from '../../../../services/model-chart.service';
import { baseline } from '../../../../../../public/baseline';
import { PoliciesService } from '../../../../services/policies.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

  @Input() scenario: any ;
  @Input() configuration : any;
  @Output() goBack: EventEmitter<any> = new EventEmitter();
  public loading:boolean = false;
  public form: FormGroup;
  public graph: any;
  public graphBase:any;
  public indicators:any[] = [];
  public regions: any[] = [];
  public summary: any[] = [];
  public indicatorSelected: any;
  public firstYearAplication: any;
  public lastYearAplication: any;

  public showPdfIndicators = false;

  constructor(private fb: FormBuilder,private service:GlobalService, private chartService: ModelChartService,private policiesService: PoliciesService) {
    this.loading = true;
    this.form = this.fb.group({
      indicator:[],
      region:[],
      compare:[false],
      yearsAplication:[false]
    });

    this.form.controls['indicator'].valueChanges.subscribe({
      next:(indicatorId:any)=>{
        this.form.controls['region'].reset();
        this.graph = null;
        this.graphBase = null;
        this.indicatorSelected = this.indicators.find((i:any)=> i.id == indicatorId);
        this.regions = this.indicatorSelected.regiones;
        if(this.regions.length == 0){
          this.regions = [{id:0,region:'All'}];
          this.form.controls['region'].setValue(0);
        }
      }
    })

    this.form.controls['region'].valueChanges.subscribe({
      next:(value:any)=>{
        if(value !== null){
          this.getCharts(value, this.form.controls['indicator'].value, this.form.controls['compare'].value, this.form.controls['yearsAplication'].value);
        }
      }
    });

    this.form.controls['compare'].valueChanges.subscribe({
      next:(value:any)=>{
        this.getCharts(this.form.controls['region'].value, this.form.controls['indicator'].value, value, this.form.controls['yearsAplication'].value);
      }
    });

    this.form.controls['yearsAplication'].valueChanges.subscribe({
      next:(value:any)=>{
        this.getCharts(this.form.controls['region'].value, this.form.controls['indicator'].value, this.form.controls['compare'].value, value);
      }
    });
  }

  ngOnInit() {
    this.getSummary();
    this.service.getIndicadores().pipe(finalize(()=>this.loading = false)).subscribe({
      next:(indicators:any)=>{
        this.indicators = indicators;
        this.form.controls['indicator'].setValue(indicators[0].id)
      }
    });

    this.graphBase= {
      layout : {
        autosize: true,
        responsive: true
      }
    }
  }

  getCharts(regionId:any, chartId:any, compare:boolean, showYearsAplication: boolean){
    let seriesIndicator = [];
    let seriesBaseIndicator = [];
    let indicator = this.indicators.find((i:any)=> i.id == chartId);
    if(regionId == 0){
      seriesIndicator = this.configuration.series.filter((serie:any)=> serie.indicador_id == chartId);
      seriesBaseIndicator = this.configuration.seriesBaseline.filter((serie:any)=> serie.indicador_id == chartId);
    }else{
      seriesIndicator = this.configuration.series.filter((serie:any)=> serie.indicador_id == chartId && serie.region_id == regionId);
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
  }

  getSummary(){
    this.policiesService.policies.forEach((sector:any)=>{
      sector.policies.forEach((policy:any)=>{
        policy.subpolicies.forEach((subpolicy:any)=>{
          this.addToSummary(subpolicy,(sector.sector_name + ' - ' + policy.name + ' - ' + subpolicy.name), policy)
        })

        policy.regions.forEach((region:any)=>{
          region.subpolicies.forEach((subpolicy:any)=>{
            this.addToSummary(subpolicy,(sector.sector_name + ' - ' + policy.name + ' - Region: ' + region.name + ' - ' + subpolicy.name),region, policy.subpolicies)
          })

          region.subsector.forEach((subsector:any)=>{
            subsector.subpolicies.forEach((subpolicy:any)=>{
              this.addToSummary(subpolicy,(sector.sector_name + ' - ' + policy.name + ' - Region: ' + region.name + ' - ' + subsector.name + ' - ' + subpolicy.name), subsector, policy.subpolicies)
            })
          })
        })
      });
    });
  }

  addToSummary(subpolicy:any, title:string, parent:any, principalSubpolicies?:any){
    let policyModified = this.configuration.policiesResults.find((p:any)=> p.id_policy == subpolicy.id);
    if(policyModified.initial_value != subpolicy.default_value){
      this.summary.push({
        title: title,
        value_base: this.policiesService.formaterTooltipSlider(subpolicy,subpolicy.default_value),
        value_modified: this.policiesService.formaterTooltipSlider(subpolicy,policyModified.initial_value)
      });
      this.checkYears(parent,principalSubpolicies);
    }
  }

  checkYears(parent:any, principalSubpolicies?:any){
    let iniYear = parent.subpolicies?.find((s:any)=> s.variable.includes("YEAR INITIAL")) ? parent.subpolicies?.find((s:any)=> s.variable.includes("YEAR INITIAL")) : principalSubpolicies?.find((s:any)=> s.variable.includes("YEAR INITIAL"));
    let finalYear = parent.subpolicies?.find((s:any)=> s.variable.includes("YEAR FINAL")) ? parent.subpolicies?.find((s:any)=> s.variable.includes("YEAR FINAL")) : principalSubpolicies?.find((s:any)=> s.variable.includes("YEAR FINAL"));
    iniYear = this.configuration.policiesResults.find((p:any)=> p.id_policy == iniYear?.id)?.initial_value;
    finalYear = this.configuration.policiesResults.find((p:any)=> p.id_policy == finalYear?.id)?.initial_value;

    if(!this.firstYearAplication || iniYear < this.firstYearAplication)
      this.firstYearAplication = iniYear;
    
    if(!this.lastYearAplication || finalYear > this.lastYearAplication)
      this.lastYearAplication = finalYear;
  }

  emitGoBack(){
    this.goBack.emit();
  }

  downloadSeries(){    
    let seriesIndicator = [];
    let seriesBaseIndicator = [];
    const chartId = this.form.controls['indicator'].value;
    const indicator = this.indicators.find((i:any)=> i.id == chartId);
    const regionId = this.form.controls['region'].value;
    
    if(regionId == 0){
      if(!this.configuration.isBaseline)
        seriesIndicator = this.configuration.series.filter((serie:any)=> serie.indicador_id == chartId);
      seriesBaseIndicator = this.configuration.seriesBaseline.filter((serie:any)=> serie.indicador_id == chartId);
    }else{
      if(!this.configuration.isBaseline)
        seriesIndicator = this.configuration.series.filter((serie:any)=> serie.indicador_id == chartId && serie.region_id == regionId);
      seriesBaseIndicator = this.configuration.seriesBaseline.filter((serie:any)=> serie.indicador_id == chartId && serie.region_id == regionId);
    }
    
    const region = this.regions.find((r:any)=> r.id == regionId).region;
    const chart = this.indicators.find((i:any)=> i.id == chartId).nombre;
    const nombre = chart + (region == 'All' ? '' : ' - ' + region);
    const initYear = 2025;
    let anios;  
    if(seriesIndicator?.length > 0)
      anios = Array.from({ length: seriesIndicator[0]?.valores.length }, (_, i) => initYear + i);
    else
      anios = Array.from({ length: seriesBaseIndicator[0]?.valores.length }, (_, i) => initYear + i);

    if(!this.configuration.isBaseline){
      seriesBaseIndicator = seriesBaseIndicator.map((s:any)=>{
        s.display_name = s.display_name + '(baseline)';
        return s
      })
    }


    const allSeries = [...seriesIndicator, ...seriesBaseIndicator];

    // 1. Header
    const headers = [
      'year',
      ...allSeries.map(s =>
        indicator.unidades ? `${s['display_name']} (${indicator.unidades})` : s['display_name']
      )
    ];

    // 2. Rows
    const rows = anios.map((year, i) => {
      const values = allSeries.map(s => s.valores[i] ?? '');
      return [year, ...values].join(',');
    });

    // 3. CSV final
    const csv = [headers.join(','), ...rows].join('\n');

    this.downloadCsv(csv, nombre);
  }

  private downloadCsv(csv: string, fileName: string) {
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  }

  openInTab(){
    window.open('/indicators.pdf', '_blank')
  }
}