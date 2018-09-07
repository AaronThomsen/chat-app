import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../user.service';
import {Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {

  users: string[] = [];
  userListSubscription: Subscription;

  constructor(private http: HttpClient, private userService: UserService) { }

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/loggedInUsers`).subscribe(response => {
      this.users = response.map(user => user.username);
    });

    this.userListSubscription = this.userService.getLoginObservable().subscribe(data => {
      if (data.type === 'login') {
        this.users.push(data.username);
        this.users.sort();
      } else if (data.type === 'logout') {
        this.users.splice(this.users.findIndex(n => n === data.username), 1);
      }
    });
  }

  ngOnDestroy() {
    this.userListSubscription.unsubscribe();
  }

}
