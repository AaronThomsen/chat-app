import {AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';

import {Message} from './message.model';
import {MessagesService} from './messages.service';
import * as moment from 'moment';
import {UserService} from './user.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer: ElementRef;

  messages: Message[] = [];
  messageSubscription: Subscription;

  constructor(private messageService: MessagesService,
              public userService: UserService,
              private renderer: Renderer2) {}

  ngOnInit() {
    this.messageSubscription = this.messageService.getMessagesObservable()
      .subscribe((message: Message) => {
        const newMessageDiv = this.createNewMessageDiv(message);
        this.renderer.appendChild(this.messagesContainer.nativeElement, newMessageDiv);
      });

    this.messageService.getSocket().on('previousMessages', (messages) => {
      // Here we simply ignore the _id and __v properties since stripping them
      // causes unnecessary overhead
      this.messages = this.messages.concat(messages);
    });

    const socket = this.messageService.getSocket();
    socket.on('newUser', username => {
      const newUserDiv = this.renderer.createElement('div');
      const newUserText = this.renderer.createText(`${username} joined`);

      this.renderer.appendChild(newUserDiv, newUserText);
      this.renderer.addClass(newUserDiv, 'chat-notification-small');
      this.renderer.appendChild(this.messagesContainer.nativeElement, newUserDiv);
    });

    socket.on('newLogin_Personal', () => {
      const newDiv = this.renderer.createElement('div');
      const html = '' +
        '<h2 style="text-decoration: underline">Welcome!</h2>' +
        '<div style="font-size: .5em;margin-bottom:1em;"><i>This application was built with the MEAN stack</i></div>' +
        '<p>The following formatting is supported:</p>' +
        '<div><b>Bold</b> like **this**</div>' +
        '<div><i>Italicize</i> like >>this>></div>' +
        '<div><del>Strike</del> like --this--</div>';
      const styles = 'margin: .75em 0 .75em 0; text-align: center; font-family: \'Fjalla One\', sans-serif;';

      this.renderer.setProperty(newDiv, 'style', styles);
      this.renderer.setProperty(newDiv, 'innerHTML', html);
      this.renderer.appendChild(this.messagesContainer.nativeElement, newDiv);
    });

    socket.on('userLogout', username => {
      const newUserDiv = this.renderer.createElement('div');
      this.renderer.addClass(newUserDiv, 'chat-notification-small');
      const newUserText = this.renderer.createText(`${username} left`);

      this.renderer.appendChild(newUserDiv, newUserText);
      this.renderer.appendChild(this.messagesContainer.nativeElement, newUserDiv);
    });
  }

  ngOnDestroy() {
    this.messageSubscription.unsubscribe();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  onSendMessage(content) {
    if (content === '') { return; }

    const newMessage: Message = {
      timestamp: moment().format('LT'),
      author: this.userService.username,
      content
    };

    this.messageService.sendMessage(newMessage);
  }

  scrollToBottom() {
    // Idea taken from stackoverflow user: letmejustfixthat
    const div = this.messagesContainer.nativeElement;

    if (div.height !== div.scrollTop + 1) {
      div.scrollTop = div.scrollHeight;
    }
  }

  createNewMessageDiv(message: Message) {
    const div = this.renderer.createElement('div');
    this.renderer.addClass(div, 'message');

    this.createNewSpan('message-timestamp', message.timestamp, div);
    this.createNewSpan('message-author', message.author + ':', div);
    this.createNewSpan('message-content', message.content, div);

    return div;
  }

  createNewSpan(styleClass: string, text: string, appendTo: Renderer2) {
    const span = this.renderer.createElement('span');
    this.renderer.addClass(span, styleClass);

    // this.renderer.appendChild(span, this.renderer.createText(text));

    // We bind to innerHTML instead of using above the method because we need to
    // parse the user's message and possibly replace certain portions with html tags.
    // Therefore, we aren't setting pure text
    this.renderer.setProperty(span, 'innerHTML', text);
    this.renderer.appendChild(appendTo, span);
  }
}
