import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { AlertController, LoadingController, NavController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UserLanguageService } from 'qmo_web/client/imports/app/shared/services/user-language.service';
import { Tables } from 'qmo_web/both/collections/restaurant/table.collection';
import { Restaurants, RestaurantImages, RestaurantImageThumbs } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { UserDetails } from 'qmo_web/both/collections/auth/user-detail.collection';
import { Orders } from 'qmo_web/both/collections/restaurant/order.collection';
import { Payments } from 'qmo_web/both/collections/restaurant/payment.collection';
import { WaiterCallDetails } from 'qmo_web/both/collections/restaurant/waiter-call-detail.collection';

@Component({
    selector: 'restaurant-exit',
    templateUrl: 'restaurant-exit.html'
})

export class RestaurantExitPage implements OnInit, OnDestroy {

    private _res_code: string = '';
    private _table_code: string = '';

    private _restaurantSub: Subscription;
    private _tablesSub: Subscription;
    private _restaurantThumbSub: Subscription;
    private _restaurantImagesSub: Subscription;
    private _userDetailSub: Subscription;
    private _ordersSub: Subscription;

    private _restaurant: any;
    private _table: any;
    private _orders: any;

    private _showWaiterCard: boolean = false;

    constructor(public _navCtrl: NavController,
        public _navParams: NavParams,
        public _alertCtrl: AlertController,
        public _loadingCtrl: LoadingController,
        private _translate: TranslateService,
        private _userLanguageService: UserLanguageService,
        private _ngZone: NgZone) {
        _translate.setDefaultLang('en');

        this._res_code = this._navParams.get("res_id");
        this._table_code = this._navParams.get("table_id");
    }

    ngOnInit() {
        this.removeSubscriptions();
        this.init();
    }

    ionViewWillEnter() {
        this.init();
    }

    init() {
        this._translate.use(this._userLanguageService.getLanguage(Meteor.user()));

        if (this._res_code !== '' && this._table_code !== '') {
            this._restaurantSub = MeteorObservable.subscribe('getRestaurantByCurrentUser', Meteor.userId()).subscribe(() => {
                this._ngZone.run(() => {
                    this._tablesSub = MeteorObservable.subscribe('getTableById', this._table_code).subscribe();
                    this._restaurant = Restaurants.findOne({ _id: this._res_code });
                    this._table = Tables.findOne({ _id: this._table_code });
                });
            });

            this._restaurantThumbSub = MeteorObservable.subscribe('restaurantImageThumbsByUserId', Meteor.userId()).subscribe();
            this._restaurantImagesSub = MeteorObservable.subscribe('restaurantImageByUserId', Meteor.userId()).subscribe();
            this._userDetailSub = MeteorObservable.subscribe('getUserDetailsByUser', Meteor.userId()).subscribe();

            this._ordersSub = MeteorObservable.subscribe('getOrdersByUserId', Meteor.userId(), ['ORDER_STATUS.REGISTERED', 'ORDER_STATUS.IN_PROCESS', 'ORDER_STATUS.PREPARED',
                'ORDER_STATUS.DELIVERED', 'ORDER_STATUS.PENDING_CONFIRM']).subscribe(() => {
                    this._ngZone.run(() => {
                        this._orders = Orders.find({}).zone();
                        this._orders.subscribe(() => { this.validateOrdersMarkedToCancel(); });
                    });
                });
        }
    }

    getRestaurantImage(_id: string): string {
        let _image;
        _image = RestaurantImages.find().fetch().filter((i) => i.restaurantId === _id)[0];
        if (_image) {
            return _image.url;
        } else {
            return 'assets/img/default-restaurant.png';
        }
    }

    exitRestaurant() {
        let userDetail = UserDetails.findOne({ user_id: Meteor.userId() })._id;
        console.log(userDetail);

        let _lOrdersRegisteredStatus: number = Orders.collection.find({ creation_user: Meteor.userId(), restaurantId: this._res_code, tableId: this._table_code, status: 'ORDER_STATUS.REGISTERED' }).count();
        let _lOrdersInProcessStatus: number = Orders.collection.find({ creation_user: Meteor.userId(), restaurantId: this._res_code, tableId: this._table_code, status: 'ORDER_STATUS.IN_PROCESS' }).count();
        let _lOrdersPreparedStatus: number = Orders.collection.find({ creation_user: Meteor.userId(), restaurantId: this._res_code, tableId: this._table_code, status: 'ORDER_STATUS.PREPARED' }).count();
        let _lOrdersDeliveredStatus: number = Orders.collection.find({ creation_user: Meteor.userId(), restaurantId: this._res_code, tableId: this._table_code, status: 'ORDER_STATUS.DELIVERED', toPay: false }).count();
        let _lOrdersToConfirm: number = Orders.collection.find({ restaurantId: this._res_code, tableId: this._table_code, 'translateInfo.firstOrderOwner': Meteor.userId(), 'translateInfo.markedToTranslate': true, status: 'ORDER_STATUS.PENDING_CONFIRM', toPay: false }).count();
        let _lOrdersWithPendingConfirmation: number = Orders.collection.find({ restaurantId: this._res_code, tableId: this._table_code, 'translateInfo.lastOrderOwner': Meteor.userId(), 'translateInfo.markedToTranslate': true, status: 'ORDER_STATUS.PENDING_CONFIRM', toPay: false }).count();
        let _lUserWaiterCallsCount: number = WaiterCallDetails.collection.find({ restaurant_id: this._res_code, table_id: this._table_code, type: 'CALL_OF_CUSTOMER', user_id: Meteor.userId(), status: 'completed' }).count();
        let _lUserPaymentsCount: number = Payments.collection.find({ creation_user: Meteor.userId(), restaurantId: this._res_code, tableId: this._table_code, status: 'PAYMENT.NO_PAID', received: false }).count();

        if (_lOrdersRegisteredStatus === 0 && _lOrdersInProcessStatus === 0 && _lOrdersPreparedStatus === 0
            && _lOrdersDeliveredStatus === 0 && _lOrdersToConfirm === 0 && _lOrdersWithPendingConfirmation === 0
            && _lUserWaiterCallsCount === 0 && _lUserPaymentsCount === 0) {

            let confirm = this._alertCtrl.create({
                title: this.itemNameTraduction('EXIT_TABLE.RESTAURANT_EXIT'),
                message: this.itemNameTraduction('EXIT_TABLE.RESTAURANT_EXIT_CONFIRM'),
                buttons: [
                    {
                        text: this.itemNameTraduction('NO'),
                        handler: () => {
                            console.log('Disagree clicked');
                        }
                    },
                    {
                        text: this.itemNameTraduction( 'YES' ),
                        handler: () => {
                          console.log('Agree clicked');
                        }
                    }
                ]
            });
            confirm.present();

        } else {

        }
    }

    cancelWaiterCall() {
        console.log('cancelWaiterCall');
    }

    itemNameTraduction(itemName: string): string {
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res;
        });
        return wordTraduced;
    }

    /**
     * Validate orders marked to cancel
     */
    validateOrdersMarkedToCancel(): void {
        let _lOrdersToCancelCount: number = Orders.collection.find({ creation_user: Meteor.userId(), status: { $in: ['ORDER_STATUS.IN_PROCESS', 'ORDER_STATUS.PREPARED'] }, markedToCancel: true }).count();
        _lOrdersToCancelCount > 0 ? this._showWaiterCard = true : this._showWaiterCard = false;
    }

    ngOnDestroy() {
        this.removeSubscriptions();
    }

    ionViewWillLeave() {
        this.removeSubscriptions();
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions(): void {
        if (this._restaurantSub) { this._restaurantSub.unsubscribe(); }
        if (this._tablesSub) { this._tablesSub.unsubscribe(); }
        if (this._restaurantThumbSub) { this._restaurantThumbSub.unsubscribe(); }
        if (this._restaurantImagesSub) { this._restaurantImagesSub.unsubscribe(); }
        if (this._userDetailSub) { this._userDetailSub.unsubscribe(); }
        if (this._ordersSub) { this._ordersSub.unsubscribe(); }
    }
}


