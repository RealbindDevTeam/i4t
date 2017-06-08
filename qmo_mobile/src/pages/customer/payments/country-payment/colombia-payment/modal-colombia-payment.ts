import { Component, OnInit, OnDestroy, } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';
import { Restaurants } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { PaymentMethods } from 'qmo_web/both/collections/general/paymentMethod.collection';

@Component({
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
  private _tipFinal      : number = 0;

  private _paymentMethod : string = "";
  private _restaurantId  : string;
  private _currencyCode  : string;

  private _disabledSubggestedTip : boolean = false ;
  private _disabledBtnOtherTip : boolean = true ;

  constructor(public _viewCtrl: ViewController, 
              public _translate: TranslateService, 
              public _params: NavParams) {

    this._restaurantId = this._params.get('restaurant');
    this._totalValue   = this._params.get('value');
    this._currencyCode = this._params.get('currency');
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
      let _lRestaurant   = Restaurants.findOne( { _id: this._restaurantId } );
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
      this._disabledBtnOtherTip = false;
    } else {
      this._disabledBtnOtherTip = true;
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
    this._tipFinal = Number.parseInt(this._tipTotal.toString()) + Number.parseInt(this._otherTip.toString());
    this._viewCtrl.dismiss({ tip :  this._tipFinal, payment : this._paymentMethod });
  }

  /**
   * ngOnDestroy Implementation
   */
  ngOnDestroy(){
    this._paymentMethodsSubscription.unsubscribe();
    this._restaurantsSubscription.unsubscribe();
  }

}