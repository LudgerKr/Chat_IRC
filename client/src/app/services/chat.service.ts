import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable()

export class ChatService {

  isAuth = false;
  user;
  messages;
  onlineUsers;
  offlineUsers;
  channel;

  private socket = io('http://localhost:3000');

  constructor(private http: HttpClient) { }

  register(values) {
    this.socket.emit('new_user', values);
  }

  connexion(values) {
    // tslint:disable-next-line:max-line-length
      this.socket.emit('user_connect', values);
      var parentThis = this;

      this.socket.on("user_connect", function(data) {
        if (!data.error) {
          parentThis.user = data;
          parentThis.isAuth = true;
        } else {
          //AFFICHER mauvais mot de passe ou login :)
        }
      });
  }

  signOut() {
    this.socket.emit('update_user', {'online': "false", 'token': this.user.token});
    this.isAuth = false;
  }

  getMessages() {
    var channel;
    if (this.channel) {
      channel = "&channel=" + this.channel;
    }

    return this.http.get('http://localhost:3000/api/messages?order=id:DESC&' + channel);
  }

  sendMessage(values) {
    if (values.content.charAt(0) === "/") {
      var commands = values.content.slice(1,values.content.length).split(' ');
      //console.log(messages);

      switch (commands[0]) {
        case 'join':
          this.channel = commands[1];
          this.socket.emit('join_channel', {'channelName': this.channel, token: this.user.token});
          break;
        case 'leave':
          this.socket.emit('leave_channel', {'channelName': this.channel, token: this.user.token});
          console.log('leave channnel' + this.channel);
          this.channel = undefined;
          break;
          case 'bot':
            this.socket.emit('bot_send', {'message': commands.splice(1).join(' '), 'channel': this.channel});
            break;
        default:
          console.log('command not found');
          break;
      }
    } else {
      this.socket.emit('new_message', {'content':values.content, 'token': this.user.token, 'channel': this.channel});
    }
  }

  getConnectedUsers() {
    var channel;
    if (this.channel) {
      channel = "&channelName=" + this.channel;
    }
    return this.http.get('http://localhost:3000/api/users?online=true&' + channel);
  }

  getDisonnectedUsers() {
    var channel;
    if (this.channel) {
      channel = "&channelName=" + this.channel;
    }
    return this.http.get('http://localhost:3000/api/users?online=false&' + channel);

  }
}
