import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { Subscription, Subject, Observable } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';

/*
  Generated class for the CallWaiter page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-call-waiter',
  templateUrl: 'waiter-call.html'
})
export class WaiterCallPage implements OnInit, OnDestroy {

  private _userDetailSubscription : Subscription;

  private _userDetail : any;

  private _userLang : string;


  constructor(public _navCtrl: NavController, 
              public _navParams: NavParams,
              public _translate: TranslateService) {
        this._userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(this._userLang);
  }

  ngOnInit() {
      this._userDetailSubscription = MeteorObservable.subscribe('', Meteor.userId()).subscribe( () => {
          this._userDetail = UserDetails.collection.findOne({ user_id: Meteor.userId() });
          if (this._userDetail.current_table == "") {
            console.log('Actualmente no se encuentra asociado a un restaurante');
          } else {
            console.log('Mostrar opción llamado de mesero');
          }
      });
  }

  ngOnDestroy(){
    this._userDetailSubscription.unsubscribe();
  }

}
