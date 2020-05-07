import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private socialLoginChallengeHandler: WL.Client.SecurityCheckChallengeHandler;
  private socialLoginSecurityCheck: string = "socialLogin";
  private challenge = new Subject<any>();

  constructor(private fb: Facebook) { 
    
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

  login(userId: string, password: string, isEnrolled: boolean) {
    const promise = new Promise((resolve, reject) => {
      WLAuthorizationManager.login(this.socialLoginSecurityCheck, {
        username: userId,
        password: password
      }).then(success => {
        console.log("-->AuthenticationService : MFPSocialLogin : login() : success : " + JSON.stringify(success));
        resolve({ status: 'success', message: 'User credentials are valid' });
      }, error => {
        console.log("-->AuthenticationService : MFPSocialLogin : login() : error : " + JSON.stringify(error));
        reject({ status: 'error', message: 'Invalid user credentials' });
      });
    });
    return promise;
  }

  logout() {
    const promise = new Promise((resolve, reject) => {
      WLAuthorizationManager.logout(this.socialLoginSecurityCheck).then(
        function () {
          WL.Logger.debug("Successfully logged-out from  " + this.socialLoginSecurityCheck);
          resolve({ status: 'success', message: 'Logged out successfully' });
        },
        function (response) {
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
      this.fb.login(['public_profile', 'user_friends', 'email'])
      .then(res => {
        if (res.status === 'connected') {
          console.log("FB SUCCESS" + JSON.stringify(res))
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
}
