import { Component, OnInit, OnDestroy } from '@angular/core';
import { App, NavController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';

import { SettingsPage } from './settings/settings';
import { InitialComponent } from '../../auth/initial/initial';
import { Users } from 'qmo_web/both/collections/auth/user.collection';
import { User } from 'qmo_web/both/models/auth/user.model';

@Component({
  selector: 'page-options',
  templateUrl: 'options.html'
})
export class OptionsPage implements OnInit, OnDestroy {

  private _userSubscription: Subscription;
  private _user: User;
  private _userName: string;
  private _imageProfile: string;
  private _userObservable;

  /**
   * OptionsPage constructor
   * @param _navCtrl 
   * @param _navParams 
   * @param _app 
   * @param _translate 
   */
  constructor(public _navCtrl: NavController, 
              public _navParams: NavParams, 
              public _app : App,
              private _translate: TranslateService) {
    var _userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(_userLang);
  }

  /**
   * ngOnInit implementation
   */
  ngOnInit() {
    this._userSubscription = MeteorObservable.subscribe('getUserSettings').subscribe(() =>{
        this._user = Users.collection.findOne({_id: Meteor.userId()});
        if(this._user.username){
          this._userName = this._user.username;
        }
        else if(this._user.profile.name) {
          this._userName = this._user.profile.name;
        }
        if(this._user.services.facebook){
          this._imageProfile = "http://graph.facebook.com/" + this._user.services.facebook.id + "/picture/?type=large";
        }
        else if(this._user.services.twitter){
          this._imageProfile = this._user.services.twitter.profile_image_url;
        }
        else if(this._user.services.google){
          this._imageProfile = this._user.services.google.picture;
        } else {
          this._imageProfile = "assets/img/user_default_image.png";
        }
        this._userObservable = Users.find({}).zone();
        
    });

  }

  /**
   * ionViewWillEnter implementation
   */
  ionViewWillEnter() {
    this._userSubscription = MeteorObservable.subscribe('getUserSettings').subscribe(() =>{
        this._user = Users.collection.findOne({_id: Meteor.userId()});
        if(this._user.username){
          this._userName = this._user.username;
        }
        else if(this._user.profile.name) {
          this._userName = this._user.profile.name;
        }
        if(this._user.services.facebook){
          this._imageProfile = "http://graph.facebook.com/" + this._user.services.facebook.id + "/picture/?type=large";
        }
        else if(this._user.services.twitter){
          this._imageProfile = this._user.services.twitter.profile_image_url;
        }
        else if(this._user.services.google){
          this._imageProfile = this._user.services.google.picture;
        } else {
          this._imageProfile = "assets/img/user_default_image.png";
        }
        this._userObservable = Users.find({}).zone();
        
    });
  }

  /**
   * This method is responsible for go to settings option
   */
  goToSettings(){
    this._navCtrl = this._app.getRootNav();
    this._navCtrl.push(SettingsPage);
  }

  /**
   * User account sign out
   */
  signOut(){
    this._app.getRootNav().setRoot(InitialComponent);
    Meteor.logout();
  }

  /**
   * ionViewWillLeave implementation
   */
  ionViewWillLeave() {
    this._userSubscription.unsubscribe();
  }

  /**
   * ngOnDestroy Implementation
   */
  ngOnDestroy(){
    this._userSubscription.unsubscribe();
  }

}
