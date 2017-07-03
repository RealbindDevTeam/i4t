import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertController, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { Addition } from 'qmo_web/both/models/administration/addition.model';
import { Additions } from 'qmo_web/both/collections/administration/addition.collection';
import { Order, OrderAddition } from 'qmo_web/both/models/restaurant/order.model';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';

@Component({
    selector: 'page-additions-page',
    templateUrl: 'addition-edit.html'
})
export class AdditionEditPage implements OnInit, OnDestroy {

    private _additionsSub               : Subscription;
    private _additionsDetailFormGroup   : FormGroup = new FormGroup({});
    private _orderAddition              : OrderAddition;
    private _currentOrder               : Order;
    private _restaurantId               : string;
    private _additionDetails            : any;
    
    /**
     * AdditionEditPage constructor
     * @param _navCtrl 
     * @param _navParams 
     * @param _formBuilder 
     * @param _translate 
     */
    constructor(public _alertCtrl: AlertController,
                public _loadingCtrl: LoadingController,
                public _navCtrl : NavController,
                public _navParams: NavParams,
                private _formBuilder: FormBuilder,
                private _translate: TranslateService,
                private _toastCtrl: ToastController){
        this._orderAddition = this._navParams.get("order_addition");
        this._currentOrder  = this._navParams.get("order");
        this._restaurantId  = this._navParams.get("restaurant");
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        this._additionsSub = MeteorObservable.subscribe( 'additionsByCurrentRestaurant', Meteor.userId() ).subscribe( () => {
            this._additionDetails = Additions.find( { _id: this._orderAddition.additionId } ).zone();
        });

        this._additionsDetailFormGroup = this._formBuilder.group({
            control : new FormControl( this._orderAddition.quantity, [ Validators.minLength(1), Validators.maxLength(2) ] )
        });
    }

    /**
     * Return addition information
     * @param {Addition} _pAddition
     */
    getAdditionInformation( _pAddition : Addition ):string {
        return _pAddition.name + ' - ' + _pAddition.restaurants.filter( r => r.restaurantId === this._restaurantId )[0].price + ' ';
    }

    /**
    * Function that allows show comfirm dialog
    */
    showComfirmClose() {
        let btn_no  = this.itemNameTraduction('MOBILE.ORDERS.NO_ANSWER'); 
        let btn_yes = this.itemNameTraduction('MOBILE.ORDERS.YES_ANSWER'); 
        let content = this.itemNameTraduction('MOBILE.ORDERS.DELETE_ADDITION_CONFIRM'); 

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
                this.deleteOrderAddition();
            }
            }
        ]
        });
        prompt.present();
    }

    /**
     * Delete OrderAddition in order
     */
    deleteOrderAddition():void{
        let loading_msg = this.itemNameTraduction('MOBILE.WAITER_CALL.LOADING'); 
        let loading = this._loadingCtrl.create({
            content: loading_msg
        });
        loading.present();
        setTimeout(() => {
            let _lOrderAdditionToremove:OrderAddition = this._currentOrder.additions.filter( ad => ad.additionId === this._orderAddition.additionId )[0];
            let _lNewTotalPayment:number = this._currentOrder.totalPayment - _lOrderAdditionToremove.paymentAddition;

            Orders.update( { _id: this._currentOrder._id },{ $pull: { additions:{ additionId: this._orderAddition.additionId } } } );
            Orders.update( { _id: this._currentOrder._id }, 
                            { $set: { totalPayment: _lNewTotalPayment, 
                                      modification_user: Meteor.userId(), 
                                      modification_date: new Date() 
                                    } 
                            } 
                        );
            this._currentOrder = Orders.findOne( { _id: this._currentOrder._id } );
            this._navCtrl.pop();
            loading.dismiss();
            let msg = this.itemNameTraduction('MOBILE.ORDERS.ADDITION_DELETED'); 
            this.presentToast(msg);
        }, 1000);
    }

    /**
    * Function that allow show a toast confirmation
    */
    presentToast( _pMsg : string ) {
        let toast = this._toastCtrl.create({
            message: _pMsg,
            duration: 1500,
            position: 'middle'
        });
        toast.onDidDismiss(() => {
        });
        toast.present();
  }

    /**
     * Modify addition in order
     */
    editOrderAddition():void{
        let arrAdd:any[] = Object.keys( this._additionsDetailFormGroup.value );
        let _lOrderAddition:OrderAddition;

        arrAdd.forEach( ( add ) => {
            if( this._additionsDetailFormGroup.value[ add ] ){
                let _lAddition : Addition = Additions.findOne( { _id: this._orderAddition.additionId } );
                _lOrderAddition = {
                    additionId: this._orderAddition.additionId,
                    quantity: this._additionsDetailFormGroup.value[ add ],
                    paymentAddition: ( this.getAdditionPrice( _lAddition ) * ( this._additionsDetailFormGroup.value[ add ] ) )
                };
            }
        });
        let _lOrderAdditionToremove : OrderAddition = this._currentOrder.additions.filter( ad => ad.additionId === _lOrderAddition.additionId )[0];
        let _lNewTotalPayment : number = this._currentOrder.totalPayment - _lOrderAdditionToremove.paymentAddition;

        Orders.update( { _id: this._currentOrder._id },{ $pull: { additions:{ additionId: _lOrderAdditionToremove.additionId } } } );
        Orders.update( { _id: this._currentOrder._id }, 
                        { $set: { totalPayment: _lNewTotalPayment, 
                                  modification_user: Meteor.userId(), 
                                  modification_date: new Date() 
                                } 
                        } 
                     );
        let _lOrder = Orders.findOne( { _id: this._currentOrder._id } );
        let _lTotalPaymentAux: number = Number.parseInt(_lOrder.totalPayment.toString()) + Number.parseInt(_lOrderAddition.paymentAddition.toString());

        Orders.update( { _id: _lOrder._id },
                       { $push: { additions: _lOrderAddition } }
                     );
        Orders.update({ _id: _lOrder._id },
                      {
                        $set: {
                                modification_user: Meteor.userId(),
                                modification_date: new Date(),
                                totalPayment: _lTotalPaymentAux
                              }
                      }
                     );
        this._currentOrder = Orders.findOne( { _id: this._currentOrder._id } );
        this._navCtrl.pop();
        let msg = this.itemNameTraduction('MOBILE.ORDERS.ADDITION_EDITED'); 
        this.presentToast(msg);
    }

    /**
     * Return Addition price
     * @param {Addition} _pAddition 
     */
    getAdditionPrice( _pAddition: Addition ):number{
        return _pAddition.restaurants.filter( r => r.restaurantId === this._restaurantId )[0].price;
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
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
        this._additionsSub.unsubscribe();
    }
}