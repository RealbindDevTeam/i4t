import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController, ToastController  } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from "meteor-rxjs";
import { Subscription } from "rxjs";

import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';
import { UserDetail } from 'qmo_web/both/models/auth/user-detail.model';
import { Restaurants } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { Tables } from 'qmo_web/both/collections/restaurant/table.collection';
import { WaiterCallDetails } from 'qmo_web/both/collections/restaurant/waiter-call-detail.collection';
import { User } from 'qmo_web/both/models/auth/user.model';
import { Users } from 'qmo_web/both/collections/auth/user.collection';

@Component({
  selector : 'calls-page',
  templateUrl: 'calls.html'
})
export class CallsPage implements OnInit, OnDestroy {

  private _userRestaurantSubscription : Subscription;
  private _userSubscription : Subscription;
  private _callsDetailsSubscription : Subscription;
  private _tableSubscription : Subscription;

  private _restaurants : any;
  private _waiterCallDetail : any;
  private _tables : any;
  private _waiterCallDetailCollection : any;

  private _userLang: string;
  private _user : User;

  /**
    * CallsPage Constructor
    * @param { TranslateService } _translate 
    * @param { AlertController } alertCtrl 
    */
  constructor(public _translate: TranslateService,
              public alertCtrl: AlertController,
              public _loadingCtrl: LoadingController,
              private toastCtrl: ToastController) {
    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(this._userLang);
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit(){
    this._userRestaurantSubscription = MeteorObservable.subscribe('getRestaurantByRestaurantWork', Meteor.userId()).subscribe(() => {
      this._restaurants = Restaurants.find({});
    });

    this._userSubscription = MeteorObservable.subscribe('getUserSettings').subscribe();

    this._callsDetailsSubscription = MeteorObservable.subscribe('waiterCallDetailByWaiterId', Meteor.userId()).subscribe(() => {
      this._waiterCallDetail = WaiterCallDetails.find({});
      this._waiterCallDetailCollection = WaiterCallDetails.collection.find({}).fetch()[0];
    });

    this._tableSubscription = MeteorObservable.subscribe('getTablesByRestaurantWork', Meteor.userId()).subscribe(() => {
      this._tables = Tables.find({});
    });

  }

  /**
   * Function that allows show comfirm dialog
   */
  showComfirmClose( call : any) {
    let prompt = this.alertCtrl.create({
      title: 'Cerrar detalle',
      message: "Seguro que desea cerrar la solicitud del cliente",
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
          }
        },
        {
          text: 'Aceptar',
          handler: data => {
            //this.closeWaiterCall();
            let loading = this._loadingCtrl.create({
              content: 'Prueba loading...',
              duration: 1000
            });

            Meteor.call('closeCall', call._id, Meteor.userId(), function(error, result){
              if (error) {
                alert('Error');
              } else {
                //alert('Proceso cerrado');
              }
            });
            loading.present();
            //loading.dismiss();
          }
        }
      ]
    });
    prompt.present();
  }

  /**
   * Funtion that allows remove a job of the Waiter Calls queue
   */
  closeWaiterCall(){
    Meteor.call('closeCall',);
  }


  /**
   * NgOnDestroy Implementation
   */
  ngOnDestroy(){
    this._userRestaurantSubscription.unsubscribe();
    this._userSubscription.unsubscribe();
    this._callsDetailsSubscription.unsubscribe();
    this._tableSubscription.unsubscribe();
  }

}