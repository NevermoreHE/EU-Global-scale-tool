import { HttpClient, HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private token !:string;

  constructor(private http:HttpClient) { }

  saveToken(token: any){
    this.token = token;
  }

  getToken(){
    return this.token;
  }

  loguin(){
    const url = 'https://keycloak.nevermore.simavi.ro/realms/nevermore/protocol/openid-connect/token';
    const data:any = {
      username: 'cartif_user',
      password: 'cartif123$$',
      grant_type: 'password',
      client_id: 'localcasetool-ui'
    };

    const searchParams = new URLSearchParams();
    Object.keys(data).forEach(key => {
      searchParams.append(key, data[key]);
    });

    return this.http.post(url, searchParams.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }
}
