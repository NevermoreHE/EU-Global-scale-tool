import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

constructor(private http: HttpClient) { }

getScenarios(){
  let url = environment.apiUrl + environment.scenarios.scenario;
  return this.http.get(url);
}

getScenario(scenarioId: number){
  let url = environment.apiUrl + environment.scenarios.scenario + `/${scenarioId}`;
  return this.http.get(url);
}

createScenario(scenario:any){
  let url = environment.apiUrl + environment.scenarios.scenario;
  return this.http.post(url,scenario);
}

editScenario(scenario:any){
  let url = environment.apiUrl + environment.scenarios.scenario + `/${scenario.id}`;
  return this.http.put(url,scenario);
}

deleteScenario(scenarioId:number){
  let url = environment.apiUrl + environment.scenarios.scenario + `/${scenarioId}`;
  return this.http.delete(url);
}

getIndicadores(){
  const headers = new HttpHeaders({
    'X-API-Key': environment.apiKey,
  });
  
  const url = environment.vensimUrl + environment.vensim.indicators;
  return this.http.get(url, {headers});
}

getSeries(policies:any[]){
  const headers = new HttpHeaders({
    'X-API-Key': environment.apiKey,
  });
  
  let url = environment.vensimUrl + environment.vensim.series;
  return this.http.post(url,policies, {headers}).pipe(map((series:any)=>{
    return series.map((serie:any)=>{
      serie.display_name = serie.parametro;
      if(serie.sector_id){
        if(serie.region_id)
          serie.display_name = serie.display_name.split(',')[1].split(']')[0];
        else
          serie.display_name = serie.display_name.split('[')[1].split(']')[0];
      }
      return serie;
    })
  }));
}

calculateSeries(policies:any[]){
  const headers = new HttpHeaders({
    'X-API-Key': environment.apiKey,
  });

  const url = environment.vensimUrl + environment.vensim.calculate;
  return this.http.post(url,policies, {headers});
}

saveSeries(policies:any[],idProject:number){
  const url = environment.apiUrl + environment.scenarios.save_series.formatUnicorn({id:idProject});
  return this.http.put(url,policies)
}

getGlobalStatus(taskId:string){
  const headers = new HttpHeaders({
    'X-API-Key': environment.apiKey,
  });

  const url = environment.vensimUrl + environment.vensim.status + `/${taskId}`;
  return this.http.get(url, {headers});
}
}
