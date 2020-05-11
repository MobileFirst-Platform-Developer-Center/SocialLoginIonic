import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import { Facebook } from '@ionic-native/facebook/ngx';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import { Vendor } from '../models/vendor';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private socialLoginChallengeHandler: WL.Client.SecurityCheckChallengeHandler;
  private socialLoginSecurityCheck: string = "socialLogin";
  private challenge = new Subject<any>();

  constructor(private fb: Facebook, private google: GooglePlus) { 
  }

  publishChallenge(data: any) {
      this.challenge.next(data);
  }

  getObservable(): Subject<any> {
      return this.challenge;
  }

  socialLogin(credentials) {
    const promise = new Promise((resolve, reject) => {
      WLAuthorizationManager.login(this.socialLoginSecurityCheck, credentials).then(success => {
        console.log("-->AuthenticationService : MFPSocialLogin : login() : success : " + JSON.stringify(success));
        resolve({ status: 'success', message: 'User credentials are valid' });
      }, error => {
        console.log("-->AuthenticationService : MFPSocialLogin : login() : error : " + JSON.stringify(error));
        reject({ status: 'error', message: 'Invalid user credentials' });
      });
    });
    return promise;
  }

  socialLogout(vendor) {
    const promise = new Promise((resolve, reject) => {
      WLAuthorizationManager.logout(this.socialLoginSecurityCheck).then(
        () => {
          WL.Logger.debug("Successfully logged-out from  " + this.socialLoginSecurityCheck);
          if(vendor == Vendor.Google) {
            this.googleLogout();
          } else {
            this.fbLogout();
          }
          resolve({ status: 'success', message: 'Logged out successfully' });
        },
        (response) => {
          WL.Logger.debug(this.socialLoginSecurityCheck + " logout failed: " + JSON.stringify(response));
          reject({ status: 'error', message: 'Failed to logout' });
        }
      );
    });
    return promise;
  }

  registerChallengeHandlers() {
    this.registersocialLoginChallengeHandler();
  }

  registersocialLoginChallengeHandler() {
    this.socialLoginChallengeHandler = WL.Client.createSecurityCheckChallengeHandler(this.socialLoginSecurityCheck);
    this.socialLoginChallengeHandler.handleChallenge = (challenge) => {
      this.displayLoginChallenge(challenge);
    }
    this.socialLoginChallengeHandler.handleSuccess = (success) => {
      console.log("-->AuthenticationService : MFPSocialLogin : handleSuccess() : success : " + JSON.stringify(success));
    }
    this.socialLoginChallengeHandler.handleFailure = (error) => {
      console.log("-->AuthenticationService : MFPSocialLogin : handleFailure() : error : " + JSON.stringify(error));
    }
  }

  displayLoginChallenge(challenge) {
    var msg = null;
    if (challenge.errorMsg) {
      msg = challenge.errorMsg + ', Remaining attempts: ' + challenge.remainingAttempts;
      console.log('--> displayLoginChallenge ERROR: ' + msg); 
    } else {
      msg = 'Invalid Credentials';
    }
    this.publishChallenge({
      'message' : msg,
      'challengeHandler' : this.socialLoginChallengeHandler
    });
  }

  fbLogin() {
    const promise = new Promise((resolve, reject) => {
      this.fb.login(['public_profile', 'email'])
        .then(res => {
          if (res.status === 'connected') {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch(e => reject(e));
    });
    return promise;
  }


  fbLogout() {
    const promise = new Promise((resolve, reject) => {
    this.fb.logout()
      .then( res => resolve(res))
      .catch(e => reject(e));
    });
    return promise;
  }

  googleLogin() {
    const promise = new Promise((resolve, reject) => {
      this.google.login({})
      .then( res => resolve(res))
      .catch(e => reject(e));
    });
    return promise;
  }

  googleLogout() {
    const promise = new Promise((resolve, reject) => {
      this.google.logout()
      .then( res => resolve(res))
      .catch(e => reject(e));
    });
    return promise;
  }
}
