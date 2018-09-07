import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MessagesService} from './messages.service';

import {environment} from '../environments/environment';

const BACKEND_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private messagesService: MessagesService) { }

  username: string;
  isLoggedIn = false;

  login(username: string, password: string) {
    const user = {username, password};
    const socket = this.messagesService.getSocket();

    return new Promise(resolve => {
      this.http.post<{message: string, username: string}>
      (`${BACKEND_URL}/login`, {user, socketID: socket.id}).subscribe(response => {
          console.log(response);
          this.username = response.username;
          this.isLoggedIn = true;
          resolve('');
        }, err => {
          console.log(err);
          resolve(err.error.message);
        }
      );
    });
  }

  logout() {
    this.http.post<{username: string}>(`${BACKEND_URL}/logout`, {username: this.username}).subscribe(response => {
      console.log(response);
      this.username = '';
      this.isLoggedIn = false;
    });
  }

  register(username: string, password: string) {
    const user = {username, password};
    const socket = this.messagesService.getSocket();

    return new Promise((resolve, reject) => {
      this.http.post(`${BACKEND_URL}/register`, {user, socketID: socket.id}).subscribe(
        response => {
          this.username = username;
          this.isLoggedIn = true;
          resolve();
        }, err => {
          reject(err.error.message);
        });
    });
  }

  getLoginObservable() {
    const socket = this.messagesService.getSocket();

    return Observable.create(observer => {
      socket.on('newUser', username => {
        observer.next({type: 'login', username});
      });

      socket.on('userLogout', username => {
        observer.next({type: 'logout', username});
      });
    });
  }
}
