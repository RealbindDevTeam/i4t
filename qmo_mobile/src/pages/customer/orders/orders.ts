import { Component, OnInit, OnDestroy } from '@angular/core';
import { App, NavController, NavParams, AlertController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { Subscription, Subject, Observable } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';
import { Tables } from 'qmo_web/both/collections/restaurant/table.collection';
import { Items } from 'qmo_web/both/collections/administration/item.collection';
import { Table } from 'qmo_web/both/models/restaurant/table.model';
import { Restaurant } from 'qmo_web/both/models/restaurant/restaurant.model';
import { Restaurants } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { Storage } from '@ionic/storage';
import { CodeTypeSelectPage } from '../code-type-select/code-type-select';
import { SectionsPage } from '../sections/sections';
import { ItemEditPage } from '../item-edit/item-edit';

@Component({
    selector: 'page-orders',
    templateUrl: 'orders.html'
})
export class OrdersPage implements OnInit, OnDestroy {

    private _userLang: string;

    private _userDetail;
    private _userDetailSub: Subscription;
    private _orders;
    private _allOrders;
    private _ordersSub: Subscription;
    private _restaurants;
    private _restaurantSub: Subscription;
    private _items;
    private _itemsSub: Subscription;
    private _table_code: string = "";
    private _res_code: string = "";
    private _statusArray: string[];
    private _currentUserId: string;
    private _orderIndex: number = -1;
    private selected: string = "me";

    alert_not: string;

    constructor(public _navCtrl: NavController, public _navParams: NavParams, public _app: App, public _translate: TranslateService,
        public _storage: Storage, public alertCtrl: AlertController) {
        this._userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(this._userLang);
        this._currentUserId = Meteor.userId();
        this._statusArray = ['REGISTERED', 'CONFIRMED', 'IN_PROGRESS'];
    }

    ngOnInit() {
        console.log('entra a ngOnInit');
        this._userDetailSub = MeteorObservable.subscribe('getUserDetailsByUser', Meteor.userId()).subscribe();

        this._storage.ready().then(() => {
            this._storage.get('trobj').then((val_obj) => {
                if (val_obj != null) {
                    this._table_code = val_obj.evalc_tb;
                    this._res_code = val_obj.edoc_rs;

                    if ((this._table_code == null) && (this._res_code == null)) {
                        this._table_code = "";
                        this._res_code = "";
                    } else {
                        this._restaurantSub = MeteorObservable.subscribe('getRestaurantByCurrentUser', Meteor.userId()).subscribe(() => {
                            this._restaurants = Restaurants.find({});
                        });
                        this._ordersSub = MeteorObservable.subscribe('getOrdersByTableId', this._res_code, this._table_code, this._statusArray).subscribe(() => {
                            this._orders = Orders.find({ creation_user: this._currentUserId });
                            this._allOrders = Orders.find({});
                        });
                        this._itemsSub = MeteorObservable.subscribe('itemsByRestaurant', this._res_code).subscribe(() => {
                            this._items = Items.find({});
                        });
                    }
                }
            });
        });
    }

    goToNewOrder() {
        this._userDetail = UserDetails.collection.findOne({ user_id: Meteor.userId() });

        if (this._userDetail.current_table == "") {
            //this._app.getRootNav().push(CodeTypeSelectPage);
            this._navCtrl.push(CodeTypeSelectPage);
        } else {
            MeteorObservable.call('getCurrentRestaurantByUser', this._userDetail.current_restaurant).subscribe((restaurant: Restaurant) => {
                if (restaurant == null) {
                    //this._app.getRootNav().push(CodeTypeSelectPage);
                    this._navCtrl.push(CodeTypeSelectPage);

                } else {
                    //this._app.getRootNav().push(SectionsPage, { res_id: restaurant._id, table_id: this._userDetail.current_table });
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
        console.log('entra a ionViewWillEnter');
        this.selected = "me";
        this._storage.ready().then(() => {
            this._storage.get('trobj').then((val_obj) => {
                if (val_obj != null) {
                    this._table_code = val_obj.evalc_tb
                    this._res_code = val_obj.edoc_rs

                    if ((this._table_code == null) && (this._res_code == null)) {
                        this._table_code = "";
                        this._res_code = "";
                    } else {
                        this._restaurantSub = MeteorObservable.subscribe('getRestaurantByCurrentUser', Meteor.userId()).subscribe(() => {
                            this._restaurants = Restaurants.find({});
                        });
                        this._ordersSub = MeteorObservable.subscribe('getOrdersByTableId', this._res_code, this._table_code, this._statusArray).subscribe(() => {
                            this._orders = Orders.find({ creation_user: this._currentUserId });
                            this._allOrders = Orders.find({});
                        });

                        this._itemsSub = MeteorObservable.subscribe('itemsByRestaurant', this._res_code).subscribe(() => {
                            this._items = Items.find({});
                        });
                    }
                }
            });
        });
    }

    filterOrders(orders_selected) {
        if (orders_selected == 'all') {
            this._orders = Orders.find({});
            this._orderIndex = -1;
        } else if (orders_selected == 'me') {
            this._orders = Orders.find({ creation_user: this._currentUserId });
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
                        if (_order.status === 'REGISTERED') {
                            Orders.update({ _id: _order._id }, {
                                $set: {
                                    status: 'CANCELED', modification_user: Meteor.userId(),
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
                        if (_order.status === 'REGISTERED') {
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
                                        status: 'CONFIRMED', modification_user: Meteor.userId(),
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

    goToItemEdit(_order: any, _itemId: string) {
        let garnishes: any[];
        let additions: any[];
        _order.items.forEach((orderItem) => {
            if (orderItem.itemId === _itemId) {
                this._navCtrl.push(ItemEditPage, { order_id: _order._id, item_obj: orderItem });
            }
        });
    }

    ionViewDidEnter() {
    }

    ionViewDidLeave() {
    }

    ionViewWillLeave() {
        if ((this._table_code != "") && (this._res_code != "")) {
            this._restaurantSub.unsubscribe();
            this._ordersSub.unsubscribe();
            this._itemsSub.unsubscribe();
        }
        console.log('entra a ionViewWillLeave');
    }

    ionViewWillUnload() {
    }

    ngOnDestroy() {
    }
}
