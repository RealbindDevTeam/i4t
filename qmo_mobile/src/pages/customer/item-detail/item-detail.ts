import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, ToastController } from 'ionic-angular';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { TranslateService } from 'ng2-translate';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs';
import { Items, ItemImages } from 'qmo_web/both/collections/administration/item.collection';
import { Additions } from 'qmo_web/both/collections/administration/addition.collection';
import { Addition } from 'qmo_web/both/models/administration/addition.model';
import { GarnishFoodCol } from 'qmo_web/both/collections/administration/garnish-food.collection';
import { GarnishFood } from 'qmo_web/both/models/administration/garnish-food.model';
import { ModalObservations } from './modal-observations';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { Item } from 'qmo_web/both/models/administration/item.model';
import { Currencies } from 'qmo_web/both/collections/general/currency.collection';

/*
  Generated class for the ItemDetail page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage implements OnInit, OnDestroy {

  private _userLang: string;
  private _items;
  private _itemSub: Subscription;
  private _item_code: string = '';
  private _res_code: string = '';
  private _table_code: string = '';
  private _finalPrice: number;
  private _unitPrice: number;
  private _observations: string = '';
  private _additions;
  private _additionSub: Subscription;
  private _garnishes;
  private _garnishSub: Subscription;
  private _item: any[] = [];
  private _showAddBtn: boolean = true;
  private _quantityCount: number = 1;
  private _lastQuantity: number = 1;
  private _additionsList: any[] = [];
  private _garnishFoodList: any[] = [];
  private _letChange: boolean = true;
  private _garnishFoodElementsCount: number = 0;
  private _showGarnishFoodError = false;
  private _maxGarnishFoodElements: number = 0;
  private _disabledAddBtn: boolean = false;
  private _loadingMsg: string;
  private _toastMsg: string;
  private _disabledMinusBtn: boolean = true;
  private _statusArray: string[];
  private _currentUserId: string;
  private _itemImageSub: Subscription;
  private _currenciesSub: Subscription;
  private _currencyCode: string;

  private _newOrderForm: FormGroup;
  private _garnishFormGroup: FormGroup = new FormGroup({});
  private _additionsFormGroup: FormGroup = new FormGroup({});

  constructor(public _navCtrl: NavController, public _navParams: NavParams, public _modalCtrl: ModalController,
    public _translate: TranslateService, public _zone: NgZone, public _loadingCtrl: LoadingController, private toastCtrl: ToastController) {
    this._userLang = navigator.language.split('-')[0];
    _translate.setDefaultLang('en');
    _translate.use(this._userLang);
    this._currentUserId = Meteor.userId();
    this._statusArray = ['ORDER_STATUS.REGISTERED'];
  }

  ionViewDidLoad() { }

  ngOnInit() {
    this._item_code = this._navParams.get("item_id");
    this._res_code = this._navParams.get("res_id");
    this._table_code = this._navParams.get("table_id");

    this._itemSub = MeteorObservable.subscribe('itemsByRestaurant', this._res_code).subscribe(() => {

      this._zone.run(() => {
        MeteorObservable.autorun().subscribe(() => {
          this._items = Items.find({ _id: this._item_code }).zone();
          this._item = Items.collection.find({ _id: this._item_code }).fetch();
          for (let item of this._item) {
            this._finalPrice = this.getItemPrice(item);
            this._unitPrice = this.getItemPrice(item);
            this._showAddBtn = item.isAvailable;
          }
          this._garnishFoodElementsCount = 0;
          this._showGarnishFoodError = false;
          this._maxGarnishFoodElements = 0;
          this._quantityCount = 1;
          this._disabledAddBtn = false;
          this._letChange = false;
          this._additionsFormGroup.reset();
          this._garnishFormGroup.reset();
        });
      });
    });

    this._additionSub = MeteorObservable.subscribe('additionsByRestaurant', this._res_code).subscribe(() => {
      this._zone.run(() => {

        this._additions = Additions.find({}).zone();
        this._additionsList = Additions.collection.find({}).fetch();
        for (let addition of this._additionsList) {
          let control: FormControl = new FormControl(false);
          this._additionsFormGroup.addControl(addition.name, control);
        }
      });
    });

    this._garnishSub = MeteorObservable.subscribe('garnishFoodByRestaurant', this._res_code).subscribe(() => {
      this._zone.run(() => {
        this._garnishes = GarnishFoodCol.find({}).zone();
        this._garnishFoodList = GarnishFoodCol.collection.find().fetch();
        for (let garnishFood of this._garnishFoodList) {
          let control: FormControl = new FormControl(false);
          this._garnishFormGroup.addControl(garnishFood.name, control);
        }
      });
    });

    this._itemImageSub = MeteorObservable.subscribe('itemImagesByRestaurant', this._res_code).subscribe();

    this._newOrderForm = new FormGroup({
      quantity: new FormControl('', [Validators.required]),
      garnishFood: this._garnishFormGroup,
      additions: this._additionsFormGroup
    });
    this._currenciesSub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId',[ this._res_code ] ).subscribe( () => {
      this._currencyCode = Currencies.collection.find({}).fetch()[0].code + ' ';
    });
  }

  presentModal() {
    let modal = this._modalCtrl.create(ModalObservations, { obs: this._observations });
    modal.onDidDismiss(data => {
      if (typeof data != "undefined" || data != null) {
        this._observations = data;
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

  addItemToOrder() {
    let _lOrderItemIndex: number = 0;
    let _lOrder = Orders.collection.find({
      creation_user: this._currentUserId,
      restaurantId: this._res_code,
      tableId: this._table_code,
      status: 'ORDER_STATUS.REGISTERED'
    }).fetch()[0];

    if (_lOrder) {
      _lOrderItemIndex = _lOrder.orderItemCount + 1;
    } else {
      _lOrderItemIndex = 1;
    }

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

    let _lOrderItem = {
      index: _lOrderItemIndex,
      itemId: this._item_code,
      quantity: this._quantityCount,
      observations: this._observations,
      garnishFood: _lGarnishFoodToInsert,
      additions: _lAdditionsToInsert,
      paymentItem: this._finalPrice
    };

    this._loadingMsg = this.itemNameTraduction('MOBILE.SECTIONS.LOADING_MSG');
    this._toastMsg = this.itemNameTraduction('MOBILE.SECTIONS.TOAST_MSG');

    let loading = this._loadingCtrl.create({
      content: this._loadingMsg
    });

    loading.present();

    setTimeout(() => {
      MeteorObservable.call('AddItemToOrder2', _lOrderItem, this._res_code, this._table_code, this._finalPrice).subscribe(() => {
        loading.dismiss();
        this._navCtrl.pop();
        this.presentToast();
      }, (error) => {
        alert(`Error: ${error}`);
      });
    }, 1500);
  }

  presentToast() {
    let toast = this.toastCtrl.create({
      message: this._toastMsg,
      duration: 1500,
      position: 'middle'
    });

    toast.onDidDismiss(() => {
    });

    toast.present();
  }

  setObservations() {

  }

  itemNameTraduction(itemName: string): string {
    var wordTraduced: string;
    this._translate.get(itemName).subscribe((res: string) => {
      wordTraduced = res;
    });
    return wordTraduced;
  }

  getItemImage(_itemId: string): string {
    let _itemImage;
    _itemImage = ItemImages.find().fetch().filter((i) => i.itemId === _itemId)[0];
    if (_itemImage) {
      return _itemImage.url;
    }
  }

  /**
   * Return Item price by current restaurant
   * @param {Item} _pItem 
   */
  getItemPrice( _pItem:Item ): number{
    return _pItem.restaurants.filter( r => r.restaurantId === this._res_code )[0].price;
  }
  
  /**
   * Return Addition price by current restaurant
   * @param {Addition} _pAddition
   */
  getAdditionsPrice( _pAddition : Addition ): number{
    return _pAddition.restaurants.filter( r => r.restaurantId === this._res_code )[0].price;
  }
  
  /**
   * Return Garnish food price by current restaurant
   * @param {GarnishFood} _pGarnishFood
   */
  getGarnishFoodPrice( _pGarnishFood : GarnishFood ): number{
    return _pGarnishFood.restaurants.filter( r => r.restaurantId === this._res_code )[0].price;
  }

  /**
   * Return item name by id
   * @param _pItemId 
   */
  getItemName ( _pItemId : string ) : string {
    if(_pItemId){
      return Items.findOne({ _id : _pItemId }).name;
    }
    return '';
  }

  ngOnDestroy() {
    this._itemSub.unsubscribe();
    this._additionSub.unsubscribe();
    this._garnishSub.unsubscribe();
    this._currenciesSub.unsubscribe();
    this._itemImageSub.unsubscribe();
  }
}
