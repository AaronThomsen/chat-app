import {Injectable, OnInit} from '@angular/core';
import {Observable} from 'rxjs';

import {Message} from './message.model';
import * as io from 'socket.io-client';
import {environment} from '../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class MessagesService implements OnInit {

  public socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io.connect(environment.apiUrl);
  }

  ngOnInit() {

  }

  getMessagesObservable() {
    return Observable.create((observer) => {
      this.socket.on('newMessage', (message) => {
        observer.next(message);
      });
    });
  }

  getSocket() {
    return this.socket;
  }

  sendMessage(message: Message) {
    this.filterMessage(message);
    this.socket.emit('newMessage', message);
  }

  filterMessage(message: Message) {
    // Note that below 3 RE's turn off greedy matching
    // to catch all possible instances of formatting
    // appropriately

    // Filter for bold -> Ex] **bold text**
    const boldRE = /\*{2}(.+?)\*{2}/g;
    message.content = message.content.replace(boldRE, '<b>$1</b>');

    // Filter for italics -> Ex] __italicized text__
    const italicsRE = /_{2}(.+?)_{2}/g;
    message.content = message.content.replace(italicsRE, '<i>$1</i>');

    // Filter for del -> Ex] --del text--
    const delRE = /-{2}(.+?)-{2}/g;
    message.content = message.content.replace(delRE, '<del>$1</del>');

    // Filter for image
    const imgRE = /^\/img (.+)$/;
    message.content = message.content.replace(imgRE, '<img height="100" src="$1">');
  }
}
