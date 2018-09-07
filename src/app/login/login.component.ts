import { Component, OnInit } from '@angular/core';
import {NgbActiveModal, NgbTabsetConfig} from '@ng-bootstrap/ng-bootstrap';
import {UserService} from '../user.service';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  errorMessage: any;
  isValid = true;
  isLoggedIn = false;

  constructor(public activeModal: NgbActiveModal, config: NgbTabsetConfig, private userService: UserService) {
    config.justify = 'center';
  }

  ngOnInit() {
  }

  onLogin(form) {
    this.isValid = true;
    this.errorMessage = '';
    const username = form._directives[0].value;
    const password = form._directives[1].value;

    this.userService.login(username, password).then(message => {
      this.errorMessage = message;
      this.isValid = message === '';

      if (this.isValid) {
        this.activeModal.close();
        this.isLoggedIn = true;
      }
    });
  }

  onRegister(form) {
    this.isValid = true;
    this.errorMessage = '';
    const username = form._directives[0].value;
    const password1 = form._directives[1].value;
    const password2 = form._directives[2].value;

    if (password1 !== password2) {
      this.isValid = false;
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.userService.register(username, password1).then(data => {
      console.log(data);
      this.activeModal.close();
      this.isLoggedIn = true;
    }).catch(err => {
      this.errorMessage = err;
      this.isValid = false;
    });
  }

}
