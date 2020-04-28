import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {MFPUser} from '../models/mfpuser.model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private userLoginChallengeHandler: WL.Client.SecurityCheckChallengeHandler;
  private userLoginSecurityCheck: string = "UserLogin";
  private challenge = new Subject<any>();

  publishChallenge(data: any) {
      this.challenge.next(data);
  }

  getObservable(): Subject<any> {
      return this.challenge;
  }

  login(userId: string, password: string, isEnrolled: boolean) {
    const promise = new Promise((resolve, reject) => {
      WLAuthorizationManager.login(this.userLoginSecurityCheck, {
        username: userId,
        password: password
      }).then(success => {
        console.log("-->AuthenticationService : MFPUserLogin : login() : success : " + JSON.stringify(success));
        let user = new MFPUser();
        user.isEnrolled = isEnrolled;
        user.userName = userId;
        user.secretToken = password;
        resolve({ status: 'success', message: 'User credentials are valid' });
      }, error => {
        console.log("-->AuthenticationService : MFPUserLogin : login() : error : " + JSON.stringify(error));
        reject({ status: 'error', message: 'Invalid user credentials' });
      });
    });
    return promise;
  }

  logout() {
    const promise = new Promise((resolve, reject) => {
      WLAuthorizationManager.logout(this.userLoginSecurityCheck).then(
        function () {
          WL.Logger.debug("Successfully logged-out from  " + this.userLoginSecurityCheck);
          resolve({ status: 'success', message: 'Logged out successfully' });
        },
        function (response) {
          WL.Logger.debug(this.userLoginSecurityCheck + " logout failed: " + JSON.stringify(response));
          reject({ status: 'error', message: 'Failed to logout' });
        }
      );
    });
    return promise;
  }

  registerChallengeHandlers() {
    this.registerUserLoginChallengeHandler();
  }

  registerUserLoginChallengeHandler() {
    this.userLoginChallengeHandler = WL.Client.createSecurityCheckChallengeHandler(this.userLoginSecurityCheck);
    this.userLoginChallengeHandler.handleChallenge = (challenge) => {
      this.displayLoginChallenge(challenge);
    }
    this.userLoginChallengeHandler.handleSuccess = (success) => {
      console.log("-->AuthenticationService : MFPUserLogin : handleSuccess() : success : " + JSON.stringify(success));
    }
    this.userLoginChallengeHandler.handleFailure = (error) => {
      console.log("-->AuthenticationService : MFPUserLogin : handleFailure() : error : " + JSON.stringify(error));
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
      'challengeHandler' : this.userLoginChallengeHandler
    });
  }
}
