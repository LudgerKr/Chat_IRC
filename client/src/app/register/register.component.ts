import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(private chatService: ChatService, private router: Router) { }

  ngOnInit(): void {
  }

  onRegister(form: NgForm) {
    this.chatService.register(form.value);
    this.router.navigate(['/connexion/']);
  }

}
