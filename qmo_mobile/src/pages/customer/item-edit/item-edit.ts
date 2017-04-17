import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, ToastController, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TranslateService } from 'ng2-translate';
import { Subscription, Subject, Observable } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { Items } from 'qmo_web/both/collections/administration/item.collection';
import { Additions } from 'qmo_web/both/collections/administration/addition.collection';
import { Addition } from 'qmo_web/both/models/administration/addition.model';
import { GarnishFoodCol } from 'qmo_web/both/collections/administration/garnish-food.collection';
import { GarnishFood } from 'qmo_web/both/models/administration/garnish-food.model';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { ModalObservationsEdit } from './modal-observations-edit';
import { Storage } from '@ionic/storage';

/*
  Generated class for the ItemEdit page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-item-edit',
  templateUrl: 'item-edit.html'
})
export class ItemEditPage implements OnInit, OnDestroy {

  private _userLang: string;
  private _item_code: string = '';
  private _item_order_index: string = '';
  private _order_code: string = '';
  private _res_code: string = '';
  private _table_code: string = '';
  private _creation_user: string = '';
  private _items;
  private _itemsSub: Subscription;
  private _item: any[] = [];
  private _finalPrice: number;
  private _unitPrice: number;
  private _showAddBtn: boolean = true;
  private _currentUserId: string;
  private _statusArray: string[];
  private _additions;
  private _additionSub: Subscription;
  private _garnishes;
  private _garnishSub: Subscription;
  private _createAdditions: any[];
  private _maxGarnishFoodElements: number = 0;
  private _quantityCount: number;
  private _lastQuantity: number = 1;
  private _letChange: boolean = true;
  private _disabledMinusBtn: boolean = true;
  private _observations: string = null;
  private _garnishFoodElementsCount: number = 0;
  private _disabledAddBtn: boolean = false;
  private _showGarnishFoodError = false;
  private _loadingMsg: string;
  private _orders;
  private _ordersSub: Subscription;
  private _order: any;
  private _auxCounter: number = 0;
  private _orderAux;
  private _createdGarnishFood: any[];
  private _orderItem;
  private _orderItemGarnishFood: any[];
  private _orderAdditions: any[];
  private _actualOrder;
  private _garnishArray: any;
  private _additionArray: any[];
  private _newOrderForm: FormGroup;
  private _garnishFormGroup: FormGroup = new FormGroup({});
  private _additionsFormGroup: FormGroup = new FormGroup({});

  constructor(public _navCtrl: NavController, public _navParams: NavParams, public _translate: TranslateService, public _storage: Storage,
    public _modalCtrl: ModalController, public _loadingCtrl: LoadingController, private _toastCtrl: ToastController, private _ngZone: NgZone,
    public _alertCtrl: AlertController) {

    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(this._userLang);
    this._currentUserId = Meteor.userId();
    this._statusArray = ['REGISTERED', 'CONFIRMED', 'IN_PROGRESS', 'PREPARED'];

    this._createdGarnishFood = [];
    this._createAdditions = [];
    this._orderItemGarnishFood = [];
    this._orderAdditions = [];
  }

  ionViewDidLoad() {
  }

  ngOnInit() {
    this._order_code = this._navParams.get("order_id");
    this._item_order_index = this._navParams.get("_item_ord_ind");
    this._item_code = this._navParams.get("item_code");
    this._creation_user = this._navParams.get("creation_user");

    this._storage.ready().then(() => {
      this._storage.get('trobj').then((val_obj) => {

        if (val_obj != null) {
          this._table_code = val_obj.evalc_tb;
          this._res_code = val_obj.edoc_rs;

          this._itemsSub = MeteorObservable.subscribe('itemsByRestaurant', this._res_code).subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
              this._items = Items.find({ _id: this._item_code }).zone();
              this._item = Items.collection.find({ _id: this._item_code }).fetch();
              for (let item of this._item) {
                this._unitPrice = item.price;
                this._showAddBtn = item.isAvailable;
              }
              this._showGarnishFoodError = false;
              this._maxGarnishFoodElements = 0;
              this._disabledAddBtn = false;
              this._additionsFormGroup.reset();
              this._garnishFormGroup.reset();
            });
          });

          this._ordersSub = MeteorObservable.subscribe('getOrdersByTableId', this._res_code, this._table_code, this._statusArray).subscribe(() => {
            MeteorObservable.autorun().subscribe(() => {
              this._orders = Orders.find({ _id: this._order_code, creation_user: this._creation_user });
              this._orderAux = Orders.collection.find({ _id: this._order_code, creation_user: this._creation_user }).fetch()[0];
              this._orderAux.items.forEach((itemOrder) => {
                if (itemOrder.itemId === this._item_code && itemOrder.index === this._item_order_index) {
                  this._quantityCount = itemOrder.quantity;
                  this._finalPrice = itemOrder.paymentItem;
                  this._garnishFoodElementsCount = itemOrder.garnishFood.length;
                }
              });
            });
          });

          this._garnishSub = MeteorObservable.subscribe('garnishFoodByRestaurant', this._res_code).subscribe(() => {

            this._ngZone.run(() => {
              this._garnishes = GarnishFoodCol.find({});
              this._createdGarnishFood = GarnishFoodCol.collection.find({}).fetch();

              let _actualOrder;
              _actualOrder = Orders.collection.find({ _id: this._order_code, creation_user: this._creation_user }).fetch()[0];
              _actualOrder.items.forEach((itemOrder) => {
                if (itemOrder.itemId === this._item_code && itemOrder.index === this._item_order_index) {
                  this._orderItemGarnishFood = itemOrder.garnishFood;
                }
              });
              for (let gar of this._createdGarnishFood) {
                let garnishExist: any[] = this._orderItemGarnishFood.filter(garnish => garnish === gar._id);
                if (garnishExist.length > 0) {
                  if (this._garnishFormGroup.contains(gar.name)) {
                    this._garnishFormGroup.controls[gar.name].setValue(true);
                  } else {
                    let control: FormControl = new FormControl(true);
                    this._garnishFormGroup.addControl(gar.name, control);
                  }
                } else {
                  if (this._garnishFormGroup.contains(gar.name)) {
                    this._garnishFormGroup.controls[gar.name].setValue(false);
                  } else {
                    let control: FormControl = new FormControl(false);
                    this._garnishFormGroup.addControl(gar.name, control);
                  }
                }
              }
            });
          });

          this._additionSub = MeteorObservable.subscribe('additionsByRestaurant', this._res_code).subscribe(() => {
            this._ngZone.run(() => {
              this._additions = Additions.find({}).zone();
              this._createAdditions = Additions.collection.find({}).fetch();

              let _actualOrder;
              _actualOrder = Orders.collection.find({ _id: this._order_code, creation_user: this._creation_user }).fetch()[0];
              _actualOrder.items.forEach((itemOrder) => {
                if (itemOrder.itemId === this._item_code && itemOrder.index === this._item_order_index) {
                  this._orderAdditions = itemOrder.additions;
                }
              });

              for (let add of this._createAdditions) {
                let additionExist: any[] = this._orderAdditions.filter(addition => addition === add._id);
                if (additionExist.length > 0) {
                  if (this._additionsFormGroup.contains(add.name)) {
                    this._additionsFormGroup.controls[add.name].setValue(true);
                  } else {
                    let control: FormControl = new FormControl(true);
                    this._additionsFormGroup.addControl(add.name, control);
                  }
                } else {
                  if (this._additionsFormGroup.contains(add.name)) {
                    this._additionsFormGroup.controls[add.name].setValue(false);
                  } else {
                    let control: FormControl = new FormControl(false);
                    this._additionsFormGroup.addControl(add.name, control);
                  }
                }
              }
            });
          });

          this._newOrderForm = new FormGroup({
            quantity: new FormControl('', [Validators.required]),
            garnishFood: this._garnishFormGroup,
            additions: this._additionsFormGroup
          });
          //
        }
      });
    });
  }

  presentModal(_actualObs?: string) {
    let modal;
    if (_actualObs) {
      if (this._observations === null) {
        if (this._auxCounter == 0) {
          modal = this._modalCtrl.create(ModalObservationsEdit, { obs: _actualObs });
          this._auxCounter += 1;
        } else {
          modal = this._modalCtrl.create(ModalObservationsEdit, { obs: this._observations });
          this._auxCounter += 1;
        }
      } else {
        modal = this._modalCtrl.create(ModalObservationsEdit, { obs: this._observations });
        this._auxCounter += 1;
      }
    } else {
      if (this._observations == null) {
        this._observations = "";
      }
      modal = this._modalCtrl.create(ModalObservationsEdit, { obs: this._observations });
    }

    modal.onDidDismiss(data => {
      if (typeof data != "undefined" || data != null) {
        if (!data.toString().replace(/\s/g, '').length) {
          this._observations = null;
        } else {
          this._observations = data;
        }
      } else {
        if (this._auxCounter == 1) {
          this._observations = _actualObs;
        }
      }
    });
    modal.present();
  }

  addCount() {
    this._lastQuantity = this._quantityCount;
    this._quantityCount += 1;
    this._letChange = false;
    this._disabledMinusBtn = false;
    this.calculateFinalPriceQuantity();
  }

  removeCount() {
    if (this._quantityCount > 1) {
      this._lastQuantity = this._quantityCount;
      this._quantityCount -= 1;
      this._letChange = false;
      if (this._quantityCount == 1) {
        this._disabledMinusBtn = true;
      } else {
        this._disabledMinusBtn = false;
      }
    }
    this.calculateFinalPriceQuantity();
  }

  calculateFinalPriceQuantity() {
    if (Number.isFinite(this._quantityCount)) {
      this._finalPrice = this._unitPrice * this._quantityCount;
      this._garnishFoodElementsCount = 0;
      this._disabledAddBtn = false;
      this._showGarnishFoodError = false;
      this._additionsFormGroup.reset();
      this._garnishFormGroup.reset();
    }
  }

  calculateFinalPriceAddition(_event: any, _price: number): void {
    if (_event.checked) {
      this._finalPrice = Number.parseInt(this._finalPrice.toString()) + (Number.parseInt(_price.toString()) * this._quantityCount);
      this._letChange = true;
    } else {
      if (this._letChange) {
        this._finalPrice = Number.parseInt(this._finalPrice.toString()) - (Number.parseInt(_price.toString()) * this._quantityCount);
      }
    }
  }

  calculateFinalPriceGarnishFood(_event: any, _price: number): void {
    if (_event.checked) {
      this._finalPrice = Number.parseInt(this._finalPrice.toString()) + (Number.parseInt(_price.toString()) * this._quantityCount);
      this._garnishFoodElementsCount += 1;
      this.validateGarnishFoodElements();
      this._letChange = true;
    } else {
      if (this._letChange) {
        this._finalPrice = Number.parseInt(this._finalPrice.toString()) - (Number.parseInt(_price.toString()) * this._quantityCount);
        this._garnishFoodElementsCount -= 1;
        this.validateGarnishFoodElements();
      }
    }
  }

  validateGarnishFoodElements(): void {
    if (this._garnishFoodElementsCount > this._maxGarnishFoodElements) {
      this._showGarnishFoodError = true;
      this._disabledAddBtn = true;
    } else {
      this._showGarnishFoodError = false;
      this._disabledAddBtn = false;
    }
  }

  setMaxGarnishFoodElements(_pGarnishFoodQuantity: number) {
    this._maxGarnishFoodElements = _pGarnishFoodQuantity;
  }

  editOrderItem() {
    let arr: any[] = Object.keys(this._newOrderForm.value.garnishFood);
    let _lGarnishFoodToInsert: string[] = [];

    arr.forEach((gar) => {
      if (this._newOrderForm.value.garnishFood[gar]) {
        let _lGarnishF: GarnishFood = GarnishFoodCol.findOne({ name: gar });
        _lGarnishFoodToInsert.push(_lGarnishF._id);
      }
    });

    let arrAdd: any[] = Object.keys(this._newOrderForm.value.additions);
    let _lAdditionsToInsert: string[] = [];

    arrAdd.forEach((add) => {
      if (this._newOrderForm.value.additions[add]) {
        let _lAddition: Addition = Additions.findOne({ name: add });
        _lAdditionsToInsert.push(_lAddition._id);
      }
    });

    if (this._observations == null) {
      this._observations = "";
    }

    let _lOrderItem = {
      index: this._item_order_index,
      itemId: this._item_code,
      quantity: this._quantityCount,
      observations: this._observations,
      garnishFood: _lGarnishFoodToInsert,
      additions: _lAdditionsToInsert,
      paymentItem: this._finalPrice
    };

    let _lOrder = Orders.findOne({ _id: this._order_code });
    let _lOrderItemToremove = _lOrder.items.filter(o => _lOrderItem.itemId === o.itemId && Number(_lOrderItem.index) === o.index)[0];
    let _lTotalPayment: number = _lOrder.totalPayment - _lOrderItemToremove.paymentItem;

    Orders.update({ _id: this._order_code }, { $pull: { items: { itemId: this._item_code, index: this._item_order_index } } });
    Orders.update({ _id: this._order_code },
      {
        $set: {
          totalPayment: _lTotalPayment,
          modification_user: Meteor.userId(),
          modification_date: new Date()
        }
      }
    );

    let _lNewOrder = Orders.findOne({ _id: this._order_code });
    let _lNewTotalPaymentAux: number = Number.parseInt(_lNewOrder.totalPayment.toString()) + Number.parseInt(_lOrderItem.paymentItem.toString());

    Orders.update({ _id: _lNewOrder._id },
      { $push: { items: _lOrderItem } }
    );

    Orders.update({ _id: _lNewOrder._id },
      {
        $set: {
          modification_user: Meteor.userId(),
          modification_date: new Date(),
          totalPayment: _lNewTotalPaymentAux
        }
      }
    );

    let _toastMsg = this.itemNameTraduction('MOBILE.ITEM_EDIT.TOAST_MSG_EDIT');
    this._navCtrl.pop();
    this.presentToast(_toastMsg);
  }

  presentToast(msg: string) {
    let toast = this._toastCtrl.create({
      message: msg,
      duration: 1500,
      position: 'middle'
    });
    toast.onDidDismiss(() => {
    });
    toast.present();
  }

  deleteOrderItem() {
    let dialog_title = this.itemNameTraduction('MOBILE.ITEM_EDIT.REMOVE_ITEM');
    let dialog_subtitle = this.itemNameTraduction('MOBILE.ITEM_EDIT.SURE_REMOVE');
    let dialog_cancel_btn = this.itemNameTraduction('MOBILE.ITEM_EDIT.NO_ANSWER');
    let dialog_accept_btn = this.itemNameTraduction('MOBILE.ITEM_EDIT.YES_ANSWER');
    let alert_not = this.itemNameTraduction('MOBILE.ORDERS.IMPOSSIBLE_CONFIRM');
    let item_not = this.itemNameTraduction('MOBILE.ORDERS.NOT_ITEM_AVAILABLE');

    let alertConfirm = this._alertCtrl.create({
      title: dialog_title,
      message: dialog_subtitle,
      buttons: [
        {
          text: dialog_cancel_btn,
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: dialog_accept_btn,
          handler: () => {
            let _lOrder = Orders.findOne({ _id: this._order_code });
            let _lOrderItemToremove = _lOrder.items.filter(o => this._item_code === o.itemId && Number(this._item_order_index) === o.index)[0];
            let _lNewTotalPayment: number = _lOrder.totalPayment - _lOrderItemToremove.paymentItem;

            Orders.update({ _id: _lOrder._id }, { $pull: { items: { itemId: this._item_code, index: this._item_order_index } } });
            Orders.update({ _id: _lOrder._id },
              {
                $set: {
                  totalPayment: _lNewTotalPayment,
                  modification_user: Meteor.userId(),
                  modification_date: new Date()
                }
              }
            );

            let _toastMsg = this.itemNameTraduction('MOBILE.ITEM_EDIT.TOAST_MSG_REMOVE');
            this._navCtrl.pop();
            this.presentToast(_toastMsg);
          }
        }
      ]
    });
    alertConfirm.present();
  }

  itemNameTraduction(itemName: string): string {
    var wordTraduced: string;
    this._translate.get(itemName).subscribe((res: string) => {
      wordTraduced = res;
    });
    return wordTraduced;
  }

  ngOnDestroy() {
    this._itemsSub.unsubscribe();
    this._additionSub.unsubscribe();
    this._garnishSub.unsubscribe();
    this._ordersSub.unsubscribe();
  }
}
