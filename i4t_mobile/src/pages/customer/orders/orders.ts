import { Component, OnInit, OnDestroy } from '@angular/core';
import { App, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { Additions } from 'qmo_web/both/collections/administration/addition.collection';
import { Order, OrderAddition } from 'qmo_web/both/models/restaurant/order.model';
import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';
import { Items } from 'qmo_web/both/collections/administration/item.collection';
import { Restaurant } from 'qmo_web/both/models/restaurant/restaurant.model';
import { Restaurants, RestaurantImageThumbs } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { Storage } from '@ionic/storage';
import { CodeTypeSelectPage } from '../code-type-select/code-type-select';
import { SectionsPage } from '../sections/sections';
import { ItemEditPage } from '../item-edit/item-edit';
import { AdditionEditPage } from '../addition-edit/addition-edit';

@Component({
    selector: 'page-orders',
    templateUrl: 'orders.html'
})
export class OrdersPage implements OnInit, OnDestroy {

    private _userDetailSub: Subscription;
    private _restaurantSub: Subscription;
    private _ordersSub: Subscription;
    private _additionsSub: Subscription;
    private _itemsSub: Subscription;
    private _restaurantThumbSub: Subscription;
    
    private _userLang: string;
    private _table_code: string = "";
    private _res_code: string = "";
    private _statusArray: string[];
    private _currentUserId: string;
    private _orderIndex: number = -1;
    private selected: string = "";

    private _userDetail;
    private _orders;
    private _allOrders;
    private _restaurants;
    private _items;
    private _additions : any;


    constructor(public _navCtrl: NavController, public _navParams: NavParams, public _app: App, public _translate: TranslateService,
        public _storage: Storage, public alertCtrl: AlertController, public _loadingCtrl: LoadingController) {
        this._userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(this._userLang);
        this._currentUserId = Meteor.userId();
        this._statusArray = ['ORDER_STATUS.REGISTERED', 'ORDER_STATUS.IN_PROCESS', 'ORDER_STATUS.PREPARED'];
        this.selected = "all";
    }

    ngOnInit() {
        this._restaurantSub = MeteorObservable.subscribe('getRestaurantByCurrentUser', Meteor.userId()).subscribe(() => {
            this._restaurants = Restaurants.find({});
        });

        this._userDetailSub = MeteorObservable.subscribe('getUserDetailsByUser', Meteor.userId()).subscribe();

        this._ordersSub = MeteorObservable.subscribe('getOrdersByUserId', Meteor.userId(), this._statusArray).subscribe(() => {
            this._orders = Orders.find({ status: { $in: this._statusArray } });
            this._allOrders = Orders.find({ status: { $in: this._statusArray } });
        });
        this._itemsSub = MeteorObservable.subscribe('itemsByUser', Meteor.userId()).subscribe(() => {
            this._items = Items.find({});
        });
        this._additionsSub = MeteorObservable.subscribe( 'additionsByCurrentRestaurant', Meteor.userId() ).subscribe( () => {
            this._additions = Additions.find( { } ).zone();
        });

        this._restaurantThumbSub = MeteorObservable.subscribe('restaurantImageThumbsByUserId', Meteor.userId()).subscribe();
    }

    goToNewOrder() {
        this._userDetail = UserDetails.collection.findOne({ user_id: Meteor.userId() });

        if (this._userDetail.current_table == "") {
            this._navCtrl.push(CodeTypeSelectPage);
        } else {
            MeteorObservable.call('getCurrentRestaurantByUser', this._userDetail.current_restaurant).subscribe((restaurant: Restaurant) => {
                if (restaurant == null) {
                    this._navCtrl.push(CodeTypeSelectPage);

                } else {
                    this._navCtrl.push(SectionsPage, { res_id: restaurant._id, table_id: this._userDetail.current_table });
                }
            }, (error) => {
                alert(`Failed to get table ${error}`);
            });
        }
    }

    showDetail(i) {
        if (this._orderIndex == i) {
            this._orderIndex = -1;
        } else {
            this._orderIndex = i;
        }
    }

    ionViewDidLoad() {
    }

    ionViewWillEnter() {
        this._restaurantSub = MeteorObservable.subscribe('getRestaurantByCurrentUser', Meteor.userId()).subscribe(() => {
            this._restaurants = Restaurants.find({});
        });

        this._userDetailSub = MeteorObservable.subscribe('getUserDetailsByUser', Meteor.userId()).subscribe();

        this._ordersSub = MeteorObservable.subscribe('getOrdersByUserId', Meteor.userId(), this._statusArray).subscribe(() => {
            this._orders = Orders.find({ status: { $in: this._statusArray } });
            this._allOrders = Orders.find({ status: { $in: this._statusArray } });
        });
        this._itemsSub = MeteorObservable.subscribe('itemsByUser', Meteor.userId()).subscribe(() => {
            this._items = Items.find({});
        });

        this._restaurantThumbSub = MeteorObservable.subscribe('restaurantImageThumbsByUserId', Meteor.userId()).subscribe();
    }

    filterOrders(orders_selected) {
        if (orders_selected == 'all') {
            this._orders = Orders.find({ status : { $in: this._statusArray }});
            this._orderIndex = -1;
        } else if (orders_selected == 'me') {
            this._orders = Orders.find({ creation_user: this._currentUserId, status : { $in: this._statusArray } });
            this._orderIndex = -1;
        } else if (orders_selected == 'other') {
            this._orderIndex = -1;
            this._orders = Orders.find({ creation_user: { $nin: [this._currentUserId] } });
        }
    }

    itemNameTraduction(itemName: string): string {
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res;
        });
        return wordTraduced;
    }

    cancelOrder(_order) {
        let dialog_title = this.itemNameTraduction('MOBILE.ORDERS.CANCEL_ORDER');
        let dialog_subtitle = this.itemNameTraduction('MOBILE.ORDERS.SURE_CANCEL');
        let dialog_cancel_btn = this.itemNameTraduction('MOBILE.ORDERS.NO_ANSWER');
        let dialog_accept_btn = this.itemNameTraduction('MOBILE.ORDERS.YES_ANSWER');
        let alert_not = this.itemNameTraduction('MOBILE.ORDERS.IMPOSSIBLE_CANCEL');

        let alertCancel = this.alertCtrl.create({
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
                        if (_order.status === 'ORDER_STATUS.REGISTERED') {
                            Orders.update({ _id: _order._id }, {
                                $set: {
                                    status: 'ORDER_STATUS.CANCELED', modification_user: Meteor.userId(),
                                    modification_date: new Date()
                                }
                            });
                            this._orderIndex = -1;
                        } else {
                            alert(alert_not);
                        }
                    }
                }
            ]
        });
        alertCancel.present();
    }

    confirmOrder(_order) {
        let dialog_title = this.itemNameTraduction('MOBILE.ORDERS.CONFIRM_ORDER');
        let dialog_subtitle = this.itemNameTraduction('MOBILE.ORDERS.SURE_CONFIRM');
        let dialog_cancel_btn = this.itemNameTraduction('MOBILE.ORDERS.NO_ANSWER');
        let dialog_accept_btn = this.itemNameTraduction('MOBILE.ORDERS.YES_ANSWER');
        let alert_not = this.itemNameTraduction('MOBILE.ORDERS.IMPOSSIBLE_CONFIRM');
        let item_not = this.itemNameTraduction('MOBILE.ORDERS.NOT_ITEM_AVAILABLE');

        let alertConfirm = this.alertCtrl.create({
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
                        let _lItemsIsAvailable: boolean = true;
                        if (_order.status === 'ORDER_STATUS.REGISTERED') {
                            let _Items = _order.items;
                            _Items.forEach((item) => {
                                let _lItem = Items.findOne({ _id: item.itemId });
                                if (_lItem.isAvailable === false) {
                                    _lItemsIsAvailable = false;
                                }
                            });
                            if (_lItemsIsAvailable) {
                                Orders.update({ _id: _order._id }, {
                                    $set: {
                                        status: 'ORDER_STATUS.IN_PROCESS', modification_user: Meteor.userId(),
                                        modification_date: new Date()
                                    }
                                }
                                );
                                this._orderIndex = -1;
                            } else {
                                alert(item_not);
                            }
                        } else {
                            alert(alert_not);
                        }
                    }
                }
            ]
        });
        alertConfirm.present();
    }

    goToItemEdit(event, _order: any) {
        let loader = this._loadingCtrl.create({
            duration: 300
        });
        loader.present();
        let objaux: any[] = [];
        objaux = event;
        let _lUserDetail = UserDetails.findOne({ user_id: Meteor.userId() });

        if(_lUserDetail.current_restaurant && _lUserDetail.current_table){
            this._res_code   = _lUserDetail.current_restaurant;
            this._table_code = _lUserDetail.current_table;
        }

        this._navCtrl.push(ItemEditPage, { order_id: _order._id, 
                                           item_ord_ind: objaux[1], 
                                           item_code: objaux[0], 
                                           creation_user: _order.creation_user,
                                           res_code: this._res_code,
                                           table_code: this._table_code});
    }

    /**
     * Show order additions detail
     * @param {OrderAddition} _pAdition
     */
    showAdditionsDetail( _pAdition : OrderAddition, _pOrder : Order ):void{
        let _lUserDetail = UserDetails.findOne({ user_id: Meteor.userId() });
        if(_lUserDetail.current_restaurant && _lUserDetail.current_table){
            this._res_code   = _lUserDetail.current_restaurant;
        }
        this._navCtrl.push(AdditionEditPage, { order_addition : _pAdition, order : _pOrder, restaurant : this._res_code });
    }

    ionViewDidEnter() {
    }

    ionViewDidLeave() {
    }

    ionViewWillLeave() {
        this._restaurantSub.unsubscribe();
        this._ordersSub.unsubscribe();
        this._itemsSub.unsubscribe();
        this._restaurantThumbSub.unsubscribe();
        this._userDetailSub.unsubscribe();
    }

    ionViewWillUnload() {
    }

    ngOnDestroy() {
    }

    getRestaurantThumb(_id: string): string {
        let _imageThumb;
        _imageThumb = RestaurantImageThumbs.find().fetch().filter((i) => i.restaurantId === _id)[0];
        if (_imageThumb) {
        return _imageThumb.url;
        }
    }
}