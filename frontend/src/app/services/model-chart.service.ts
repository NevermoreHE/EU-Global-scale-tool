import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModelChartService {

  public initYear = 2025;
  public decimal_places = 2;
  public layout = {
    title: {
      text: ''
    },
    paper_bgcolor: "rgb(255,255,255)",
    plot_bgcolor: "rgb(255,255,255)",
    hovermode: 'x',
    xaxis: {
      gridcolor: "rgb(229,229,229)",
      showgrid: false,
      showline: false,
      showticklabels: true,
      tickcolor: "rgb(127,127,127)",
      ticks: "outside",
      zeroline: false,
      title: {
        text: 'Year',
        font:{
          size:18
        }
      }
    },
    yaxis: {
      gridcolor: "rgb(229,229,229)",
      showgrid: true,
      showline: false,
      showticklabels: true,
      tickcolor: "rgb(127,127,127)",
      ticks: "outside",
      zeroline: false,
      title: {
        text: '',
        font:{
          size:18
        }
      }
    }
  };

constructor() { }

getChart(data:any){

  let anios;  
  if(data.dataBase.length > 0)
    anios = Array.from({ length: data.dataBase[0]?.valores.length }, (_, i) => this.initYear + i);
  else
    anios = Array.from({ length: data.dataModified[0]?.valores.length }, (_, i) => this.initYear + i);

  let chartOption!: any;

  if(data.dataModified.length == 1){
    chartOption = this.getLineChart(data.title, this.decimal_places,anios,data.dataBase[0]?.valores,data.dataModified[0]?.valores,this.initYear, data.units, data.firstYear, data.lastYear, data.showYearsAplication);
  }else{
    const dataSet = data.dataModified.length > 0 ? data.dataModified : data.dataBase;
    const names = [''];
    chartOption = this.getStackedChart(data.title, this.decimal_places,anios,names,dataSet,this.initYear,data.units, data.firstYear, data.lastYear, data.showYearsAplication);
  }
  return chartOption;
}

getLineChart(title: string, decimals:number, xAxis: number[], baseData: number[], modifiedData: number[], initialIndex: number, units?:string, firstYearAplication?:number, lastYearAplication?:number, showYearsAplication?:boolean): any{
  let data:any[] = [];
  if(baseData){
    if(units == '%')
      baseData = baseData.map((d:number)=>d*100);
    data.push(    
      {
        x: xAxis,
        y: baseData,
        mode: 'lines',
        line: { color: "rgb(0,176,246)", shape: 'spline'},
        type: "scatter",
        name: 'Baseline',
        hoverinfo: "all",
        hoverlabel: { namelength: -1 },
        hovertemplate:`%{y:.${decimals}f} ${units ?? ''}<extra></extra>`
      }
    )
  }
  if(modifiedData){
    if(units == '%')
      modifiedData = modifiedData.map((d:number)=>d*100);
    data.push(
      {
        x: xAxis,
        y: modifiedData,
        mode: 'lines',
        line: { color: "rgb(225,176,36)", shape: 'spline'},
        type: "scatter",
        name: 'Simulated scenario',
        hoverinfo: "all",
        hoverlabel: { namelength: -1 },
        hovertemplate:`%{y:.${decimals}f} ${units ?? ''}<extra></extra>`
      }
    )
  }
  let layout:any = structuredClone(this.layout);
  layout.title.text = title;
  layout.yaxis.hoverformat = `.${decimals}f`
  layout.yaxis.title.text = units;
  if((firstYearAplication || lastYearAplication) && showYearsAplication){
    layout.shapes = [
      {
        type: 'rect',
        xref: 'x',
        yref: 'paper',
        x0: firstYearAplication ?? xAxis[0],
        y0: 0,
        x1: lastYearAplication ?? xAxis[xAxis.length -1],
        y1: 1,
        fillcolor: '#d3d3d3',
        opacity: 0.2,
        editable: true,
        line: {
          width: 0,
        },
        label: {
          text: 'Years of application',
          font: { size: 14, weight:700, color: '#465C95' },
          textposition: 'top center',
        },
      }
    ];
  }

  return {
    data: data,
    layout: layout,
    config: { displayModeBar: true }
  };  
}

getStackedChart(title: string, decimals:number, anios: number[], names: string[], series: any[], initialIndex: number, units?:string, firstYearAplication?:number, lastYearAplication?:number, showYearsAplication?:boolean): any{
  let data:any[] = series.map((serie:any)=>{
    let dataToChart = serie.valores;
    if(units == '%')
      dataToChart = serie.valores.map((d:number)=>d*100);
    return {
      x: anios, 
      y: dataToChart, 
      stackgroup: 'one',
      name:serie.display_name,
      hoverinfo: "none",
      customdata: anios.map((_,i:number)=>series.map((serie:any)=>units == '%' ?  serie.valores[i]*100: serie.valores[i])
                                            .concat(series.map((serie:any)=> serie.display_name))),
      hoverlabel: { bgcolor: "white", bordercolor: " rgb(0,176,246)", font: { color: 'rgb(30,30,30)' }, namelength: 0 }
    }
  });

  data[0].hovertemplate = series.reduce((prev, curr: any, i) => prev + `     <b style="color:rgb(0,0,0)">%{customdata[${i +series.length}]}:</b> %{customdata[${i}]:.2f} ${units ?? ''}       <br>`, '');
  let layout:any = {
    title: {
      text: title
    },
    paper_bgcolor: "rgb(255,255,255)",
    plot_bgcolor: "rgb(255,255,255)",
    hovermode: 'x',
    xaxis: {
      gridcolor: "rgb(229,229,229)",
      showgrid: false,
      showline: false,
      showticklabels: true,
      tickcolor: "rgb(127,127,127)",
      ticks: "outside",
      zeroline: false,
      title: {
        text: "Year",
        font:{
          size:18
        }
      }
    },
    yaxis: {
      gridcolor: "rgb(229,229,229)",
      showgrid: true,
      showline: false,
      showticklabels: true,
      tickcolor: "rgb(127,127,127)",
      ticks: "outside",
      zeroline: false,
      hoverformat: `.${decimals}f`,
      title: {
        text: units,
        font:{
          size:18
        }
      }
    }
  };

  
  if((firstYearAplication || lastYearAplication) && showYearsAplication){
    layout.shapes = [
      {
        type: 'rect',
        xref: 'x',
        yref: 'paper',
        x0: firstYearAplication ?? anios[0],
        y0: 0,
        x1: lastYearAplication ?? anios[anios.length -1],
        y1: 1,
        fillcolor: '#777777ff',
        opacity: 0.2,
        editable: true,
        line: {
          width: 0,
        }
      }
    ];
    const xMid = ((firstYearAplication ?? anios[0]) + (lastYearAplication ?? anios[anios.length -1]))/2;
    layout.annotations = [
      {
        xref: 'x',
        x: xMid,
        yref: 'paper',
        y: 1,
        showarrow: false,
        text: 'Years of application',
        font: { size: 16, weight:700, color: '#465C95'},
        xanchor: 'center',
        yanchor: 'bottom',
        layer: 'above'
      }
    ];
  }

  return {
    data: data,
    layout: layout,
    config: { displayModeBar: true }
  };
}

}
