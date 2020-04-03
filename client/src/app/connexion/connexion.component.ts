import { Component, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss']
})
export class ConnexionComponent implements OnInit {

  constructor(private chatService: ChatService, private router: Router) { }

  authStatus: boolean;
  data: any;

  ngOnInit(): void {
  }

  onConnexion(form: NgForm) {
    this.chatService.connexion(form.value);
    return new Promise(
      (resolve, reject) => {
        setTimeout(
          () => {
            this.authStatus = this.chatService.isAuth;
            console.log(this.authStatus);
            if (this.authStatus === true) {
              this.router.navigate(['/chat']);
            }
            resolve(true);
          }, 500
        );
      });
  }
}
