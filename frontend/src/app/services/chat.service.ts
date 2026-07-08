import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MessageData } from '../models/message-data';
import { finalize } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private socket$ !: WebSocketSubject<any>;
  public receivedData: MessageData[] = [];
  public saveMessage: boolean = false;
  public defaultMessagesSize = 30;

  constructor(private http: HttpClient, private userService:UserService) { }

  public connect(){
    if(!this.socket$ || this.socket$.closed){
      this.saveMessage = false;
      const token = this.userService.getToken();
      this.socket$ = webSocket({
        url: environment.websocket,
        protocol: this.userService.getToken(),
        openObserver: {
          next: () => {
            console.log('WebSocket conectado correctamente');
          }
        },
        closeObserver: {
          next: () => {
            console.log('WebSocket cerrado');
          }
        }
      });
    }
    return this.socket$;
  }

  public disconnect(){
    this.saveMessage = false;
    this.receivedData = [];
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.complete();
    }
  }

  sendMessage(message:string){
    const url = environment.apiUrl + environment.chat;

    return this.http.post(url,{"texto":message});
  }

  getHistoricMessage(lastId?:number, numberMessages?: number, searchField?: string | null){
    let messages = this.defaultMessagesSize;
    if(numberMessages)
      messages = numberMessages;

    let parameters = '?count=' + messages;
    if(searchField && searchField != "")
      parameters += '&filter='+searchField;

    if(lastId)
      parameters += '&last='+lastId;

    const url = environment.apiUrl + environment.chat + parameters;

    return this.http.get(url);
  }

}
