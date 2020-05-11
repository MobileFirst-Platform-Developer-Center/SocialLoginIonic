import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { UtilsService } from 'src/app/services/utils.service';
import { AuthenticationService } from 'src/app/services/authentication.service'
import { Vendor } from 'src/app/models/vendor';

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
  private socialLoginChallengeHandler: WL.Client.SecurityCheckChallengeHandler;
  private isChallenged = false;

  constructor(private utils: UtilsService, private authenticationService: AuthenticationService, private router: Router) {
    this.authenticationService.getObservable().subscribe((data) => {
      this.isChallenged = true;
      this.socialLoginChallengeHandler = data.challengeHandler;
      this.utils.showAlert('Error!', 'Error while authenticating the user. ' + data.message);
    });
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
    this.utils.presentLoading();
    var credentials = {
      token : token,
      vendor : vendor
    }
    if(this.isChallenged) {
      this.socialLoginChallengeHandler.submitChallengeAnswer(credentials);
      this.isChallenged = false;
    } else {
      const promise = this.authenticationService.socialLogin(credentials);
      promise.then((response: any) => {
        this.utils.dismissLoading();
        if (response.status !== undefined && response.status === 'success') {
          this.router.navigate(['/home']);
        } else {
          this.utils.showAlert('Error!', 'Error while authenticating the user');
        }
      }).catch((error) => {
        this.utils.dismissLoading();
        if (error.status !== undefined && error.status === 'error') {
          this.utils.showAlert('Error!', error.message);
        } else {
          this.utils.showAlert('Error!', 'Error while authenticating the user');
        }
      });
    }
  }

}
