IBM MobileFirst Foundation
===
## Social Login

A sample Ionic 5.x application demonstrating use of the Social Authentication using MobileFirst Credentials Validation Security Check.

![Social Login Screenshot](mobilefirst/screenshot.jpg)

## Prerequisites
* [Installed Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* [Registered Facebook Android App](https://developers.facebook.com/docs/android/getting-started)
* [Registered Google Sign-In App for Android](https://developers.google.com/identity/sign-in/android/start-integrating#get-config)
* [Installed Android Studio](https://developer.android.com/studio/install.html)
* [Installed MobileFirst development environment](https://mobilefirstplatform.ibmcloud.com/tutorials/en/foundation/8.0/installation-configuration/development/mobilefirst/)

### Tutorials
https://mobilefirstplatform.ibmcloud.com/blog/2016/04/06/social-login-with-ibm-mobilefirst-platform-foundation/

### Configuring the Ionic app

#### Facebook Authentication

- Register Android and iOS app in Facebook Developer Console with the id `com.mfp.sociallogin` by following steps as mentioned [here](https://enappd-apps.gitbook.io/apps/ionic-4-full-app/pro-pack-features/social-sharing/facebook-login).
    * Copy Facebook App ID  & App Name from [Facebook Apps Console](https://developers.facebook.com/apps/)
    * ![Facebook APP ID](mobilefirst/facebook.png)

- Edit the file **package.json**, there you need supply the following:
    ``` 
    "cordova-plugin-facebook4": {
            "APP_ID": "Add your Facebook APP ID here",
            "APP_NAME": "Add your Facebook App Name here"
    }
    ```

#### Google Authentication
    
- Register your Android and iOS app with the id `com.mfp.sociallogin` from [Google APIs Console](https://console.developers.google.com/apis/credentials).
    * ![Google Client ID](mobilefirst/google.png)

- For iOS, Download the plist file from Google APIs Console and Copy the Reverse Client ID.
    * Edit the file **package.json**, there you need supply the following:
    ``` 
    "cordova-plugin-googleplus": {
        "REVERSED_CLIENT_ID": "Add your iOS Reverse Client ID here"
    }
    ```
- For Android, There is no need to add the generated google-services.json file into your Ionic project.


### Configuring the Adapter

- Deploy ([SocialLogin SecurityCheck](./adapters/SocialLoginSecurityCheck) and [HelloSocialUser Adapter](./adapters/HelloSocialUserAdapter)) by running following commands in the project's root directory using command line:
    * Run `cd adapters`
    * Run `mfpdev adapter build all`
    * Run `mfpdev adapter deploy all`

- From your command line run `mfpdev server console` - this command will open your server console.
  * From the Adapters menu click on *Social Login Adapter* and navigate to *Security Checks* tab.
  * Here you will find place to add your *google client id*.  This ID will use the adapter to validate the Google account.
  * This ID you can retreive it from [Google APIs Console](https://console.developers.google.com/apis/credentials)
  * If you need to use the social platform token later on, set the **keep original token** attribute to be **true**.
  * ![Adapter Configuration](mobilefirst/SocialLoginConfiguration.png)


### Usage

1. From a command-line window, navigate to the project's root folder and run the following commands:
    - `ionic cordova platform add ios` or `ionic cordova platform add android` - to add a platform.
    - `mfpdev app register` - to register the application.
    - `mfpdev app push` -  to map the `accessRestricted` scope to the `SocialLogin` security check.
    - `ionic cordova run` - to run the application.

2. Login with your Facebook & Google credentials to view the profile page.

## Version
Ionic 5.1.0

## Supported Versions
IBM MobileFirst Foundation 8.0

## Licence
Copyright 2020 IBM Corp.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.s