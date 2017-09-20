import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { AlertController, LoadingController, NavController, NavParams } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UserLanguageService } from 'qmo_web/client/imports/app/shared/services/user-language.service';
import { Tables } from 'qmo_web/both/collections/restaurant/table.collection';
import { Restaurants, RestaurantImageThumbs } from 'qmo_web/both/collections/restaurant/restaurant.collection';

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

    private _restaurant: any;
    private _table: any;

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
        }
    }

    getRestaurantThumb(_id: string): string {
        let _imageThumb;
        _imageThumb = RestaurantImageThumbs.find().fetch().filter((i) => i.restaurantId === _id)[0];
        if (_imageThumb) {
            return _imageThumb.url;
        } else {
            return 'assets/img/default-restaurant.png';
        }
    }

    exitRestaurant() {
        //TODO
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
    }
}


