import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  authStatus: boolean;
  data: any;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.authStatus = this.chatService.isAuth;
  }

  onSignOut() {
    this.chatService.signOut();
    this.authStatus = this.chatService.isAuth;
  }

}
