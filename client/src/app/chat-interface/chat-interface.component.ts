import { Component, Input, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { NgForm } from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import 'rxjs/add/observable/interval';

@Component({
  selector: 'app-chat-interface',
  templateUrl: './chat-interface.component.html',
  styleUrls: ['./chat-interface.component.css']
})
export class ChatInterfaceComponent implements OnInit {

  messages;
  messagesSubscription: Subscription;
  user;
  connectedUsers;
  disconnectedUsers;
  @Input() id: number;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.messages = this.chatService.getMessages();
    console.log(this.messages);
    const counter = Observable.interval(5000);
    this.messagesSubscription = counter.subscribe(
      () => {
        this.messages = this.chatService.getMessages();
        this.connectedUsers = this.chatService.getConnectedUsers();
        this.disconnectedUsers = this.chatService.getDisonnectedUsers();

      });
    this.user = [this.chatService.user];
    this.connectedUsers = this.chatService.getConnectedUsers();
    this.disconnectedUsers = this.chatService.getDisonnectedUsers();
  }

  sendMessage(form: NgForm) {
    this.chatService.sendMessage(form.value);
    this.messages = this.chatService.getMessages();
  }
}
