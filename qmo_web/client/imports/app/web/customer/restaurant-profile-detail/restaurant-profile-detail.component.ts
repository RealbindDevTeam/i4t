import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Location } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { Restaurant, RestaurantProfile, RestaurantImageThumb, RestaurantProfileImage, RestaurantProfileImageThumb } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants, RestaurantsProfile, RestaurantImageThumbs, RestaurantProfileImages, RestaurantProfileImageThumbs } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Country } from '../../../../../../both/models/settings/country.model';
import { Countries } from '../../../../../../both/collections/settings/country.collection';
import { City } from '../../../../../../both/models/settings/city.model';
import { Cities } from '../../../../../../both/collections/settings/city.collection';
import { Currency } from '../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../both/collections/general/currency.collection';
import { PaymentMethod } from '../../../../../../both/models/general/paymentMethod.model';
import { PaymentMethods } from '../../../../../../both/collections/general/paymentMethod.collection';

@Component({
    selector: 'restaurant-profile-detail',
    templateUrl: './restaurant-profile-detail.component.html',
    styleUrls: [ './restaurant-profile-detail.component.scss' ]
})
export class RestaurantProFileDetailComponent implements OnInit, OnDestroy {

    private restaurantId                : string;

    private _restaurantSub              : Subscription;
    private _restaurantProfileSub       : Subscription;
    private _restaurantImageThumbSub    : Subscription;
    private _restaurantProfileImgsub    : Subscription;
    private _restaurantProfileImgThumSub: Subscription;
    private _countriesSub               : Subscription;
    private _citiesSub                  : Subscription;
    private _currencySub                : Subscription;
    private _paymentMethodSub           : Subscription;

    private _restaurants                : Observable<Restaurant[]>;;
    private _restaurantsProfile         : Observable<RestaurantProfile[]>;
    private _restaurantsImgThumb        : Observable<RestaurantImageThumb[]>;
    private _restaurantProfileImages    : Observable<RestaurantProfileImage[]>;
    private _restaurantProfileImgThumbs : Observable<RestaurantProfileImageThumb[]>;
    private _restaurantPaymentMethods   : Observable<PaymentMethod[]>;

    private _restaurantCountry          : string;
    private _restaurantCity             : string;
    private _restaurantCurrency         : string = '';
    
    /**
     * RestaurantProFileDetailComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     * @param {UserLanguageService} _userLanguageService 
     * @param {ActivatedRoute} _activatedRoute
     * @param {Router} _router
     */
    constructor( private _translate: TranslateService,
                 private _ngZone: NgZone,
                 private _userLanguageService: UserLanguageService,
                 private _activatedRoute: ActivatedRoute,
                 private _router: Router,
                 private readonly _location: Location ){
        if( Meteor.user() !== undefined && Meteor.user() !== null ){
            _translate.use(this._userLanguageService.getLanguage(Meteor.user()));
            _translate.setDefaultLang('en');
        } else {
            _translate.use( navigator.language.split('-')[0] );
            _translate.setDefaultLang('en');
        }
        this._activatedRoute.params.forEach( ( params: Params ) => {
            this.restaurantId = params['param1'];
        });
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this._location.replaceState("/app/restaurant-detail");
        this.removeSubscriptions();
        if( this.restaurantId !== null && this.restaurantId !== undefined ){
            this._restaurantSub = MeteorObservable.subscribe( 'getRestaurantById', this.restaurantId ).subscribe( () => {
                this._ngZone.run( () => {
                    this._restaurants = Restaurants.find( { _id: this.restaurantId } ).zone();
                    let _lRestaurant:Restaurant = Restaurants.findOne( { _id: this.restaurantId } );
                    this._countriesSub = MeteorObservable.subscribe( 'getCountryByRestaurantId', this.restaurantId ).subscribe( () => {
                        this._ngZone.run( () => {
                            let _lCountry:Country = Countries.findOne( { _id: _lRestaurant.countryId } );
                            this._restaurantCountry = this.itemNameTraduction( _lCountry.name );
                        });
                    });
                    this._citiesSub = MeteorObservable.subscribe( 'getCityByRestaurantId', this.restaurantId ).subscribe( () => {
                        this._ngZone.run( () => {
                            let _lCity:City = Cities.findOne( { _id: _lRestaurant.cityId } );
                            this._restaurantCity = this.itemNameTraduction( _lCity.name );
                        });
                    });
                    this._currencySub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', [ this.restaurantId ] ).subscribe( () => {
                        this._ngZone.run( () => {
                            let find: Currency = Currencies.findOne( { _id: _lRestaurant.currencyId } );
                            this._restaurantCurrency = find.code + ' - ' + this.itemNameTraduction( find.name );
                        });
                    });
                    this._paymentMethodSub = MeteorObservable.subscribe( 'getPaymentMethodsByrestaurantId', this.restaurantId ).subscribe( () => {
                        this._ngZone.run( () => {
                            this._restaurantPaymentMethods = PaymentMethods.find( { _id: { $in: _lRestaurant.paymentMethods } , isActive: true } ).zone();
                        });
                    });
                });
            });
            this._restaurantProfileSub = MeteorObservable.subscribe( 'getRestaurantProfile', this.restaurantId ).subscribe( () => {
                this._ngZone.run( () => {
                    this._restaurantsProfile = RestaurantsProfile.find( { restaurant_id: this.restaurantId } ).zone();
                });
            });
            this._restaurantImageThumbSub = MeteorObservable.subscribe( 'restaurantImageThumbsByRestaurantId', this.restaurantId ).subscribe();
            this._restaurantProfileImgsub = MeteorObservable.subscribe( 'getRestaurantProfileImagesByRestaurantId', this.restaurantId ).subscribe( () => {
                this._ngZone.run( () => {
                    this._restaurantProfileImages = RestaurantProfileImages.find( { restaurantId: this.restaurantId } ).zone();
                });
            });
            this._restaurantProfileImgThumSub = MeteorObservable.subscribe( 'getRestaurantProfileImageThumbsByRestaurantId', this.restaurantId ).subscribe( () => {
                this._ngZone.run( () => {
                    this._restaurantProfileImgThumbs = RestaurantProfileImageThumbs.find( { restaurantId: this.restaurantId } ).zone();
                });
            });
        } else {
            if( Meteor.user() !== undefined && Meteor.user() !== null ){
                this._router.navigate(['/app/orders']);
            } else {
                // Redireccionar al catalogo de restaurantes si no hay usuario logueado
                this._router.navigate(['/app/orders']);                
            }
        }
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._restaurantSub ){ this._restaurantSub.unsubscribe(); }
        if( this._restaurantProfileSub ){ this._restaurantProfileSub.unsubscribe(); }
        if( this._restaurantImageThumbSub ){ this._restaurantImageThumbSub.unsubscribe(); }
        if( this._restaurantProfileImgsub ){ this._restaurantProfileImgsub.unsubscribe(); }
        if( this._restaurantProfileImgThumSub ){ this._restaurantProfileImgThumSub.unsubscribe(); }
        if( this._countriesSub ){ this._countriesSub.unsubscribe(); }
        if( this._citiesSub ){ this._citiesSub.unsubscribe(); }
        if( this._currencySub ){ this._currencySub.unsubscribe(); }
        if( this._paymentMethodSub ){ this._paymentMethodSub.unsubscribe(); }
    }

    /**
     * Get Restaurant Image
     * @param {string} _pRestaurantId
     */
    getRestaurantImage( _pRestaurantId: string ):string {
        let _lRestaurantImageThumb: RestaurantImageThumb = RestaurantImageThumbs.findOne( { restaurantId: _pRestaurantId } );
        if ( _lRestaurantImageThumb ) {
            return _lRestaurantImageThumb.url
        } else {
            return '/images/default-restaurant.png';
        }
    }

    /**
     * Function to translate information
     * @param {string} _itemName
     */
    itemNameTraduction(_itemName: string): string {
        var _wordTraduced: string;
        this._translate.get(_itemName).subscribe((res: string) => {
            _wordTraduced = res;
        });
        return _wordTraduced;
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this.removeSubscriptions();
    }
}