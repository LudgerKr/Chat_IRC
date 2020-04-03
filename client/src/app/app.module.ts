import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule} from '@angular/forms';
import { AuthComponent } from './auth/auth.component';
import { RouterModule, Routes } from '@angular/router';
import { FourOhFourComponent } from './four-oh-four/four-oh-four.component';
import { AuthGuard } from './services/auth-guard.service';
import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './register/register.component';
import {ChatService} from './services/chat.service';
import { ConnexionComponent } from './connexion/connexion.component';
import { ChatInterfaceComponent } from './chat-interface/chat-interface.component';


const appRoutes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'connexion', component: ConnexionComponent },
  { path: '', component: AuthComponent },
  { path: 'chat', canActivate: [AuthGuard], component: ChatInterfaceComponent },
  { path: 'not-found', component: FourOhFourComponent },
  { path: '**', redirectTo: 'not-found' }
];

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    FourOhFourComponent,
    RegisterComponent,
    ConnexionComponent,
    ChatInterfaceComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule
  ],
  providers: [
    AuthGuard,
    ChatService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
