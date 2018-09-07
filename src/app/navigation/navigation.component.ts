import { Component, OnInit } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LoginComponent} from '../login/login.component';
import {UserService} from '../user.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  constructor(private modalService: NgbModal, public userService: UserService) { }

  ngOnInit() {
  }

  openLogin() {
    this.modalService.open(LoginComponent);
  }

}
