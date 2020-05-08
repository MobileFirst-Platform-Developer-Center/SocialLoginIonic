import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { UtilsService } from 'src/app/services/utils.service';
import { AuthenticationService } from 'src/app/services/authentication.service'
import { Vendor } from 'src/app/models/vendor';
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
  private socialLoginChallengeHandler: WL.Client.SecurityCheckChallengeHandler;
  private isChallenged = false;

  constructor(private utils: UtilsService, private authenticationService: AuthenticationService, private router: Router) {
    this.authenticationService.getObservable().subscribe((data) => {
      this.isChallenged = true;
      this.socialLoginChallengeHandler = data.challengeHandler;
      this.utils.showAlert('Error!', 'Error while authenticating the user. ' + data.message);
    });
  }

  login(form: NgForm) {
    this.submitted = true;
    if (form.valid && !this.isChallenged) {
      console.log('-->  login(): First time login attempt');
      const promise = this.authenticationService.login(this.creds.username, this.creds.password, false);
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
      this.socialLoginChallengeHandler.submitChallengeAnswer({
        username: this.creds.username,
        password: this.creds.password
      });
      this.isChallenged = false;
    }
  }

  fbLogin() {
    this.authenticationService.fbLogin().then((response: any) => {
      this.loginToSocialVendor(Vendor.Facebook, response.authResponse.accessToken)
    }).catch((error) => {
       this.utils.showAlert('Error!', 'Error while authenticating the user');
    })
  }

  

  googleLogin() {
    this.authenticationService.googleLogin().then((response: any) => {
     this.loginToSocialVendor(Vendor.Google, response.idToken)
    }).catch((error) => {
       this.utils.showAlert('Error!', 'Error while authenticating the user');
    })
  }

  loginToSocialVendor(vendor, token) {
    var credentials = {
      token : token,
      vendor : vendor
    }
    if(this.isChallenged) {
      this.socialLoginChallengeHandler.submitChallengeAnswer(credentials);
    } else {
      const promise = this.authenticationService.socialLogin(credentials);
      promise.then((response: any) => {
        if (response.status !== undefined && response.status === 'success') {
          this.router.navigate(['/home']);
          this.normalLogin = false;
        } else {
          this.utils.showAlert('Error!', 'Error while authenticating the user');
        }
      }).catch((error) => {
        if (error.status !== undefined && error.status === 'error') {
          this.utils.showAlert('Error!', error.message);
        } else {
          this.utils.showAlert('Error!', 'Error while authenticating the user');
        }
      });
    }
  }

 enableSignInwithLoginCredentials() {
   this.normalLogin = true;
 }

}
