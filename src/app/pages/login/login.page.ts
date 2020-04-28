import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { UtilsService } from 'src/app/services/utils.service';
import { AuthenticationService } from 'src/app/services/authentication.service'
import { MFPUser } from 'src/app/models/mfpuser.model';
import { NgForm } from '@angular/forms';

export interface UserOptions {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage {
  creds: UserOptions = { username: '', password: '' };
  submitted = false;
  normalLogin = false;
  mfpUser: MFPUser = new MFPUser();
  private userLoginChallengeHandler: WL.Client.SecurityCheckChallengeHandler;
  private isChallenged = false;

  constructor(private utils: UtilsService, private authenticationService: AuthenticationService, private router: Router) {
    this.authenticationService.getObservable().subscribe((data) => {
      this.isChallenged = true;
      this.userLoginChallengeHandler = data.challengeHandler;
      this.utils.showAlert('Error!', 'Error while authenticating the user. ' + data.message);
    });
  }

  login(form: NgForm) {
    this.submitted = true;
    if (form.valid && !this.isChallenged) {
      console.log('-->  login(): First time login attempt');
      const promise = this.authenticationService.login(this.creds.username, this.creds.password, this.mfpUser.isEnrolled);
      promise.then((response: any) => {
        this.creds.password = "";
        if (response.status !== undefined && response.status === 'success') {
          this.router.navigate(['/home']);
          this.normalLogin = false;
        } else {
          this.utils.showAlert('Error!', 'Error while authenticating the user');
        }
      }).catch((error) => {
        this.creds.password = "";
        if (error.status !== undefined && error.status === 'error') {
          this.utils.showAlert('Error!', error.message);
        } else {
          this.utils.showAlert('Error!', 'Error while authenticating the user');
        }
      });
    } else if (this.isChallenged) {
      console.log('-->  login(): Subsequent login attempt');
      this.userLoginChallengeHandler.submitChallengeAnswer({
        username: this.creds.username,
        password: this.creds.password
      });
      this.isChallenged = false;
    }
  }

 enableSignInwithLoginCredentials() {
   this.normalLogin = true;
 }

}
