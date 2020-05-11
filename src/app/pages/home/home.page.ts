import { Component, ChangeDetectorRef } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/services/utils.service';
import { Vendor } from '../../models/vendor';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  name = "";
  userType = "";
  email = "";
  photo = "";
  vendor = "";

  constructor(private authenticationService: AuthenticationService, private router: Router, private utils: UtilsService, private cdr: ChangeDetectorRef) {
  }

  ionViewWillEnter() {
    this.resetUser()
    this.callAdapter()
  }

  logout() {
    console.log('-->  logout(): Logging out from the application');
    const promise = this.authenticationService.socialLogout(this.vendor);
    promise.then((response: any) => {
      if (response.status !== undefined && response.status === 'success') {
        this.router.navigate(['/login']);
      } else {
        this.utils.showAlert('Error!', 'Failed to Logout');
      }
    }).catch((error) => {
      if (error.status !== undefined && error.status === 'error') {
        this.utils.showAlert('Error!', error.message);
      } else {
        this.utils.showAlert('Error!', 'Failed to Logout');
      }
    });
  }

  callAdapter() {
    this.utils.presentLoading();
    var resourceRequest = new WLResourceRequest("/adapters/HelloSocialUser/hello",WLResourceRequest.GET, {scope: 'accessRestricted'});
    resourceRequest.send().then((response) => {
      console.log('-->  callAdapter(): Success ', response);
      let userInfo = response.responseJSON;
      this.vendor = userInfo.socialLoginVendor;
      this.userType = userInfo.socialLoginVendor + " user";
      if(userInfo.socialLoginVendor == Vendor.Google) {
        this.name =  userInfo.displayName;
        this.email = userInfo.email;
        this.photo = userInfo.picture;
      } else {
        this.name =  userInfo.name;
        this.email = userInfo.email;
        this.photo = userInfo.picture.data.url;
      }
      this.cdr.detectChanges();
    },(error) => {
      this.resetUser();
      console.log('-->  callAdapter(): Failure ', JSON.stringify(error));
      this.utils.showAlert('Failure!', JSON.stringify(error));     
    }).done(() => {
      this.utils.dismissLoading();  
    });
  }

  resetUser() {
    this.userType = "Guest user";
    this.name =  "Guest";
    this.email = "guest@guest.com";
    this.photo = "/../../assets/avatar.jpg";
  }
    
}
