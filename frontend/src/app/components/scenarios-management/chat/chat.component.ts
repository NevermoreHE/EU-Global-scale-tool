import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { MessageData } from '../../../models/message-data';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  @ViewChild('scrollableDiv') scrollableDiv!: ElementRef;
  public formChat: FormGroup;
  public formSearch: FormGroup;
  public historicMessages: MessageData[] = [];
  public loadingMessage: boolean = false;
  public disableScroll = false;
  public existMoreMessages = true;
  public searchField!: string | null ; 
  public searchedMessage:MessageData[] = [];
  public newMessages = false;
  public subscriptions: Subscription[] = [];
  
  constructor(private fb: FormBuilder, public chatService: ChatService) {
    this.formChat = this.fb.group({
      message:[,Validators.required]
    });
    this.formSearch = this.fb.group({
      value:[,Validators.required]
    });
  }

  ngOnInit() {
    this.loadingMessage = true;
    this.existMoreMessages = true;
    this.newMessages = false;

    this.subscriptions.push(
      this.chatService.connect().subscribe({
        next:(data:MessageData)=>{
          if(this.chatService.saveMessage){
            const messagesDiv = this.scrollableDiv.nativeElement;
            const onBottom = this.isOnBottom(messagesDiv);

            this.chatService.receivedData.push(data);

            setTimeout(() => {
              if (onBottom)
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
              else
                this.newMessages = true;
            }, 100);
          }        
        }
      })
    );

    this.subscriptions.push(
      this.chatService.getHistoricMessage().pipe(finalize(()=>this.loadingMessage = false)).subscribe({
        next:(messages:any)=>{
          this.chatService.saveMessage = true;
          this.addMessages(messages);
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
    this.subscriptions.forEach((s:Subscription)=> s.unsubscribe());
  }

  addMessages(messages: MessageData[], searching?:boolean){
    const messagesDiv = this.scrollableDiv.nativeElement;
    const scrollHeightAnterior = messagesDiv.scrollHeight;
    const onBottom = this.isOnBottom(messagesDiv);
    if(searching)
      this.searchedMessage.unshift(...messages);
    else
      this.historicMessages.unshift(...messages);

    setTimeout(() => {
      const scrollHeightNuevo = messagesDiv.scrollHeight;
      if (onBottom) {
        // Si estaba abajo, desplazamos completamente hacia abajo
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      } else {
        messagesDiv.scrollTop = scrollHeightNuevo - scrollHeightAnterior;
      }
      this.disableScroll = false;
      if (messagesDiv.scrollHeight <= messagesDiv.clientHeight) {
        this.getMoreMessages(searching);
      }
    },100)
  }

  getMoreMessages(searching?:boolean){    
    this.loadingMessage = true;
    let minId = Math.min(...this.historicMessages.map((message:MessageData)=> message.id));
    if(searching)
      minId = Math.min(...this.searchedMessage.map((message:MessageData)=> message.id));
    if(this.existMoreMessages){
      this.subscriptions.push(
        this.chatService.getHistoricMessage(minId,20).pipe(finalize(()=>this.loadingMessage = false)).subscribe({
          next:(messages:any)=>{
            if(messages.length < 20)
              this.existMoreMessages = false;
            
            this.addMessages(messages,searching);            
          },
          error:(err:any)=>{
            this.disableScroll = false;
          }
        })
      );
    }else{
      this.disableScroll = false;
      this.loadingMessage = false;
    }
  }
  

  sendMessage(){
    this.subscriptions.push(
      this.chatService.sendMessage(this.formChat.controls['message'].value).subscribe({})
    );
    this.formChat.controls['message'].setValue('');
  }

  onScroll() {
    const messages = this.scrollableDiv.nativeElement;
    if (messages.scrollTop === 0) {
      this.disableScroll = true;
      this.getMoreMessages(this.searchField != null);
    }else if(this.isOnBottom(messages))
      this.newMessages = false;
  }

  getMoreSearched(){ 
    this.loadingMessage = true;
    let minId = Math.min(...this.searchedMessage.map((message:MessageData)=> message.id));
    if(this.existMoreMessages){
      this.subscriptions.push(
        this.chatService.getHistoricMessage(minId,20,this.formSearch.controls['value'].value).pipe(finalize(()=>this.loadingMessage = false)).subscribe({
          next:(messages:any)=>{
            if(messages.length < 20)
              this.existMoreMessages = false;
            
            this.addMessages(messages, true);       
          },
          error:(err:any)=>{
            this.disableScroll = false;
          }
        })
      );
    }else{
      this.disableScroll = false;
      this.loadingMessage = false;
    }
  }

  searchMessagges(){
    this.existMoreMessages = true;
    this.searchedMessage = [];
    this.searchField = this.formSearch.controls['value'].value;
    this.scrollableDiv.nativeElement.scrollTop = 0;
    
    this.subscriptions.push(
      this.chatService.getHistoricMessage(0,20,this.searchField).pipe(finalize(()=>this.loadingMessage = false)).subscribe({
        next:(messages:any)=>{
          if(messages.length < 20)
            this.existMoreMessages = false;
          
          this.addMessages(messages,true);            
        },
        error:(err:any)=>{
          this.disableScroll = false;
        }
      })
    );
  }

  stopSearch(){
    this.searchField = null;
    this.loadingMessage = true;
    this.existMoreMessages = true;
    this.historicMessages = [];
    this.searchedMessage = [];
    this.chatService.receivedData = [];
    this.subscriptions.push(
      this.chatService.getHistoricMessage().pipe(finalize(()=>this.loadingMessage = false)).subscribe({
        next:(messages:any)=>{
          this.chatService.saveMessage = true;
          this.addMessages(messages);
        }
      })
    )
  }

  isOnBottom(messagesDiv:any){
    return Math.abs(
      messagesDiv.scrollTop + messagesDiv.clientHeight - messagesDiv.scrollHeight
    ) < 1;
  }

  goBottom(){
    const messagesDiv = this.scrollableDiv.nativeElement;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}
