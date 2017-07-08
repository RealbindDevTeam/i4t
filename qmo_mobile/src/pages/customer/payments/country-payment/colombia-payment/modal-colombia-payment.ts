import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';
import { Restaurants } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { PaymentMethods } from 'qmo_web/both/collections/general/paymentMethod.collection';

@Component({
  selector: 'modal-colombia-payment',
  templateUrl: 'modal-colombia-payment.html'
})

export class ModalColombiaPayment implements OnInit, OnDestroy {

  private _restaurantsSubscription    : Subscription;
  private _paymentMethodsSubscription : Subscription;

  private _paymentMethods : any;
  private _tip           : number = 0;
  private _tipValue      : number = 0;
  private _tipTotal      : number = 0;
  private _totalValue    : number = 0;
  private _otherTip      : number = 0;

  private _paymentMethod : any = "";
  private _currencyCode  : string;

  private _disabledSubggestedTip : boolean = false ;
  private _disabledBtnOtherTip   : boolean = false ;

  /**
   * ModalColombiaPayment constructor
   * @param _viewCtrl 
   * @param _translate 
   * @param _params 
   */
  constructor(public _viewCtrl  : ViewController, 
              public _translate : TranslateService, 
              public _params    : NavParams) {

    this._tipTotal      = this._params.get('tip');
    this._otherTip      = this._params.get('other_tip');
    this._totalValue    = this._params.get('value');
    this._currencyCode  = this._params.get('currency');
    this._paymentMethod = this._params.get('payment_method');

    if (  this._tipTotal > 0) {
      this._disabledSubggestedTip = true;
    }
    if ( this._otherTip > 0) {
      this._disabledBtnOtherTip = true;
    }
  }

  /**
   * ngOnInit Implementation
   */
  ngOnInit(){
    this._paymentMethodsSubscription = MeteorObservable.subscribe('paymentMethods').subscribe(() => {
      this._paymentMethods = PaymentMethods.find({}).zone();
    });

    this._restaurantsSubscription = MeteorObservable.subscribe( 'getRestaurantByCurrentUser', Meteor.userId() ).subscribe(()=>{
      this.shearchTipPorcentage();
      this._tip = this._tipValue;
    });
    
  }
  /**
   * This method calculate the tip suggested
   * @param _param 
   * @param _totalTipValue 
   */
  shearchTipPorcentage(){
      let _lRestaurant   = Restaurants.findOne( {} );
      if( _lRestaurant.financialInformation[ "TIP_PERCENTAGE" ] > 0 ){
          this._tipValue = _lRestaurant.financialInformation[ "TIP_PERCENTAGE" ];
      }
      this._tipTotal = this._totalValue * ( this._tipValue / 100 );
  }

  /**
   * Allow user add tip in total payment
   * @param {any} _event 
   */
  allowTip( _event : any ) : void {
    if( _event.checked ){
      this.shearchTipPorcentage();
      this._disabledSubggestedTip = true;
    } else {
      this._disabledSubggestedTip = false;
    }
  }

  /**
   * Enabled the other value field and change the value
   * @param _event 
   */
  otherTip( _event : any ) : void {
    if( _event.checked ){
      this._disabledBtnOtherTip = true;
    } else {
      this._disabledBtnOtherTip = false;
      this._otherTip = 0;
    }
  }

  /**
   * Close the modal
   */
  close(){
    this._viewCtrl.dismiss();
  }

  /**
   * Close the modal, and set the values (tip total and payment method)
   */
  closePaymentOptions() {
    if(!this._disabledSubggestedTip){
      this._tipTotal = 0;
    }
    if(this._paymentMethod === ''){
      this._paymentMethod = 'MOBILE.PAYMENTS.PAYMENT_METHOD';
    }
    this._viewCtrl.dismiss({ tip :  this._tipTotal, other_tip: this._otherTip, payment : this._paymentMethod });
  }

  /**
   * ngOnDestroy Implementation
   */
  ngOnDestroy(){
    this._paymentMethodsSubscription.unsubscribe();
    this._restaurantsSubscription.unsubscribe();
  }

}