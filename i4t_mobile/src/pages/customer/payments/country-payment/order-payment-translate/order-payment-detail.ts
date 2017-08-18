import { Component, Input } from '@angular/core';
import { AlertController, LoadingController, ToastController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Order } from 'qmo_web/both/models/restaurant/order.model';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';

@Component({
	selector: 'order-payment-detail',
	templateUrl: 'order-payment-detail.html'
})

export class OrderPaymentDetailComponent {
    @Input() orderCon      : Order;
    @Input() ordersConfirm : boolean;

    constructor(public _translate   : TranslateService,
                public _alertCtrl   : AlertController,
                public _loadingCtrl : LoadingController,
                private _toastCtrl  : ToastController){

    }

    /**
   * Show modal confirm
   * @param _pOrder 
   */
  showConfirm( _pOrder: any ):void{

    let btn_no  = this.itemNameTraduction('MOBILE.ORDERS.NO_ANSWER');
    let btn_yes = this.itemNameTraduction('MOBILE.ORDERS.YES_ANSWER');
    let content = this.itemNameTraduction('MOBILE.PAYMENTS.CONFIRM_PAY_OTHER_USER') + ' ' + _pOrder.code + '?';

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
          this.confirmOrderToPay(_pOrder);
        }
      }
    ]
  });
  prompt.present();
}

  /**
   * Function to confirm order pay translate
   * @param {Order} _pOrder 
   */
  confirmOrderToPay( _pOrder : Order ):void {
    let loading_msg = this.itemNameTraduction('MOBILE.WAITER_CALL.LOADING'); 
    
    let loading = this._loadingCtrl.create({
      content: loading_msg
    });
    loading.present();

    setTimeout(() => {
      let msg : string;
      let _lUser = _pOrder.translateInfo.lastOrderOwner;
      Orders.update({ _id: _pOrder._id }, { $set: { creation_user: _lUser, modification_user: Meteor.userId(), modification_date: new Date(), 
                                                    'translateInfo.confirmedToTranslate': true, status: 'ORDER_STATUS.DELIVERED' }});
      loading.dismiss();
      msg = this.itemNameTraduction('MOBILE.PAYMENTS.SUCCESSFUL_PAY_OTHER_USER');
      this.presentToast(msg);
    }, 1500);
      /*let _lOrderTranslate: OrderTranslateInfo = { firstOrderOwner: _pOrder.translateInfo.firstOrderOwner, markedToTranslate: false, lastOrderOwner: '', confirmedToTranslate: false };
      Orders.update( { _id: _pOrder._id }, { $set: { modification_user: this._user, modification_date: new Date(), 
                                                    translateInfo: _lOrderTranslate, status: 'ORDER_STATUS.DELIVERED' }});*/
    }

  /**
   * Function that allow show a toast confirmation
   */
  presentToast( _msg : string ) {
    let toast = this._toastCtrl.create({
      message: _msg,
      position: 'middle',
      showCloseButton: true,
      closeButtonText: 'Ok'
    });

    toast.onDidDismiss(() => {
    });

    toast.present();
  }

    /**
   * This function allow translate strings
   * @param {string} _itemName 
   */
  itemNameTraduction(_itemName: string): string {
    var wordTraduced: string;
    this._translate.get(_itemName).subscribe((res: string) => {
        wordTraduced = res;
    });
    return wordTraduced;
  }
}