import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController, ToastController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs'
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Order, OrderTranslateInfo } from 'qmo_web/both/models/restaurant/order.model';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { Users } from 'qmo_web/both/collections/auth/user.collection';
import { UserLanguageService } from 'qmo_web/client/imports/app/shared/services/user-language.service';

/*
  Generated class for the ColombiaPaymentDetailsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'colombia-page-payment-details',
  templateUrl: 'colombia-payment-details.html'
})

export class ColombiaPaymentDetailsPage implements OnInit, OnDestroy {
    
    private _ordersSubscription : Subscription;
    
    private _orders             : any;
    private _totalValue         : number = 0;
    private _ipoComBaseValue    : number = 0;
    private _ipoCom             : number = 108;
    private _ipoComValue        : number = 0;
    private _userLang           : string;
    private _ipoComBaseString   : string;
    private _ipoComString       : string;
    private _currency           : string;
     
     /**
      * ColombiaPaymentDetailsPage constructor
      * @param _translate 
      * @param _alertCtrl 
      * @param _loadingCtrl 
      * @param _toastCtrl 
      * @param _navParams 
      * @param _userLanguageService 
      */
    constructor(public _translate: TranslateService,
                public _alertCtrl: AlertController,
                public _loadingCtrl: LoadingController,
                private _toastCtrl: ToastController,
                public _navParams: NavParams,
                private _userLanguageService: UserLanguageService){
        _translate.setDefaultLang('en');
    }

    /**
     * ngOnInit Implementation. That allow to calculate this values corresponding to Payment
     */
    ngOnInit(){
        this._translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        this._ordersSubscription  = MeteorObservable.subscribe('getOrdersByAccount', Meteor.userId()).subscribe( () =>{
            MeteorObservable.autorun().subscribe(() => {
                this._currency = this._navParams.get("currency");
                
                this._totalValue = 0;
                this._orders = Orders.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED', toPay : false } ).zone();
                Orders.collection.find( { creation_user: Meteor.userId(), status: 'ORDER_STATUS.DELIVERED', toPay : false } ).fetch().forEach( ( order ) => {
                    this._totalValue += order.totalPayment;
                });
                
                this._ipoComBaseValue  = (this._totalValue * 100 ) / this._ipoCom;
                this._ipoComValue      = this._totalValue - this._ipoComBaseValue;
                
                this._ipoComBaseString = (this._ipoComBaseValue).toFixed(2);
                this._ipoComString     = (this._ipoComValue).toFixed(2);
            });
        });
    }

    /**
     * Function to evaluate if the order is available to return to the first owner
     * @param {Order} _pOrder
     */
    isAvailableToReturn( _pOrder : Order ):boolean{
        if( _pOrder.translateInfo.firstOrderOwner !== '' && _pOrder.translateInfo.lastOrderOwner !== '' 
            && _pOrder.translateInfo.confirmedToTranslate && _pOrder.translateInfo.markedToTranslate
            && _pOrder.status === 'ORDER_STATUS.DELIVERED' && _pOrder.toPay == false ){
            return true;
        } else {
            return false;
        }
    }

    /**
     * Function that allows show comfirm dialog
     * @param { any } _call 
     */
    showComfirmClose( _pOrder :Order ) {
        let btn_no  = this.itemNameTraduction('MOBILE.ORDERS.NO_ANSWER'); 
        let btn_yes = this.itemNameTraduction('MOBILE.ORDERS.YES_ANSWER'); 
        let content = this.itemNameTraduction('MOBILE.PAYMENTS.RETURN_ORDER_USER'); 

        let prompt = this._alertCtrl.create({
        message: content,
        buttons: [
            {
                text: btn_no,
                handler: data => {
            }
            },
            {
                text: btn_yes,
                handler: data => {
                    this.returnOrderToFirstOwner(_pOrder);
                }
            }
        ]
        });
        prompt.present();
    }

    /**
     * When this user want return the order, this function allow return the order with the original owner
     * @param {Order} _pOrder 
     */
    returnOrderToFirstOwner( _pOrder : Order ) : void {
        let loading_msg = this.itemNameTraduction('MOBILE.WAITER_CALL.LOADING'); 
        
        let loading = this._loadingCtrl.create({
        content: loading_msg
        });
        loading.present();
        setTimeout(() => {

            let _lOrderTranslateInfo: OrderTranslateInfo = { firstOrderOwner: _pOrder.translateInfo.firstOrderOwner, confirmedToTranslate: false, 
                                                            lastOrderOwner: '', markedToTranslate: false };
            Orders.update( { _id: _pOrder._id }, { $set: { creation_user: _pOrder.translateInfo.firstOrderOwner,
                                                            modification_user: Meteor.userId(),
                                                            translateInfo: _lOrderTranslateInfo 
                                                        }});
            loading.dismiss();
            this.presentToast();
        }, 1500);
    }

    /**
     * Function that allow show a toast confirmation
     */
    presentToast() {
        let msg = this.itemNameTraduction('MOBILE.PAYMENTS.ORDER_RETURNED'); 
        let toast = this._toastCtrl.create({
            message: msg,
            duration: 1500,
            position: 'middle'
        });

        toast.onDidDismiss(() => {
        });
        toast.present();
    }

    /**
     * Return User Name
     * @param {string} _pUserId 
     */
    getUserName( _pUserId:string ):string{
        let _user = Users.collection.find( { } ).fetch().filter( u => u._id === _pUserId )[0];
        if( _user ){
            if( _user.username ){
                return _user.username;
            }
            else if( _user.profile.name ){
                return _user.profile.name;
            }
        }
    }

    /**
     * Return traduction
     * @param {string} itemName 
     */
    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
    }

    /**
     * ngOnDestroy Implementation.
     */
    ngOnDestroy(){
        this._ordersSubscription.unsubscribe();
    }
}