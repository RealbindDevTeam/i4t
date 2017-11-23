import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, CameraPosition, MarkerOptions, Marker } from '@ionic-native/google-maps';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams, ModalController, LoadingController, ToastController } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable, Subscription } from 'rxjs';
import { Country } from 'qmo_web/both/models/settings/country.model';
import { Countries } from 'qmo_web/both/collections/settings/country.collection';
import { City } from 'qmo_web/both/models/settings/city.model';
import { Cities } from 'qmo_web/both/collections/settings/city.collection';
import { PaymentMethod } from 'qmo_web/both/models/general/paymentMethod.model';
import { PaymentMethods } from 'qmo_web/both/collections/general/paymentMethod.collection';
import { Restaurant, RestaurantProfile, RestaurantImageThumb, RestaurantProfileImage } from 'qmo_web/both/models/restaurant/restaurant.model';
import { Restaurants, RestaurantsProfile, RestaurantImageThumbs, RestaurantProfileImages } from 'qmo_web/both/collections/restaurant/restaurant.collection';
import { ModalSchedule } from './modal-schedule/modal-schedule';

@Component({
    selector: 'page-restaurant-profile',
    templateUrl: 'restaurant-profile.html'
})
export class RestaurantProfilePage implements OnInit, OnDestroy {
    
    private _map                               : GoogleMap;
    private _countriesSubscription             : Subscription;
    private _citiesSubscription                : Subscription;
    private _restaurantProfileSubscription     : Subscription;
    private _restaurantProfileImgsSubscription : Subscription;
    private _paymentMethodsSubscription        : Subscription;

    private _restaurantsProfile                : RestaurantProfile;
    private _restaurantProfileImgs             : Observable<RestaurantProfileImage[]>;
    private _paymentMethods                    : Observable<PaymentMethod[]>;
    private _profileImgs                       : RestaurantProfileImage[] =[];
    private _restaurant                        : Restaurant = null;

    private _restaurantCountry                 : string;
    private _restaurantCity                    : string;
    private _showDescription                   : boolean = false;


    /**
     * Constructor implementation
     * @param _navParams 
     * @param _translate 
     * @param googleMaps 
     * @param _ngZone 
     */
    constructor(public _navParams: NavParams,
                public _translate: TranslateService,
                public _modalCtrl  : ModalController,
                private googleMaps: GoogleMaps,
                private _ngZone: NgZone){
        this._restaurant = this._navParams.get("restaurant");
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        this._countriesSubscription = MeteorObservable.subscribe( 'getCountryByRestaurantId', this._restaurant._id ).subscribe( () => {
            this._ngZone.run( () => {
                let _lCountry : Country = Countries.findOne( { _id: this._restaurant.countryId } );
                this._restaurantCountry = this.itemNameTraduction( _lCountry.name );
            });
        });
        
        this._citiesSubscription = MeteorObservable.subscribe( 'getCityByRestaurantId', this._restaurant._id ).subscribe( () => {
            this._ngZone.run( () => {
                let _lCity:City = Cities.findOne( { _id: this._restaurant.cityId } );
                this._restaurantCity = this.itemNameTraduction( _lCity.name );
            });
        });

        this._restaurantProfileSubscription = MeteorObservable.subscribe( 'getRestaurantProfile', this._restaurant._id ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurantsProfile = RestaurantsProfile.findOne( { restaurant_id: this._restaurant._id } );
                this.loadMap();
            });
        });

        this._restaurantProfileImgsSubscription = MeteorObservable.subscribe( 'getRestaurantProfileImagesByRestaurantId', this._restaurant._id ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurantProfileImgs = RestaurantProfileImages.find( { restaurantId: this._restaurant._id } ).zone();
                this.setRestaurantProfileImageThumbs();
                this._restaurantProfileImgs.subscribe( () => { 
                    this.setRestaurantProfileImageThumbs(); 
                });
            });
        });

        this._paymentMethodsSubscription = MeteorObservable.subscribe('getPaymentMethodsByrestaurantId', this._restaurant._id).subscribe(()=>{
            this._ngZone.run( () => {
                this._paymentMethods = PaymentMethods.find({}).zone();
            });
        });
    }

    /**
     * Set restaurant profile thumbs array
     */
    setRestaurantProfileImageThumbs():void{
        RestaurantProfileImages.find( { restaurantId: this._restaurant._id } ).fetch().forEach( ( img ) => {
            if( img ){
                this._profileImgs.push( img );
            }
        });
    }

    /**
     * Function to translate information
     * @param {string} _itemName
     */
    itemNameTraduction(itemName: string): string {
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
          wordTraduced = res;
        });
        return wordTraduced;
    }

    /**
     * Load map whit restaurant location
     */
    loadMap() {
        if(this._restaurantsProfile.location.lat && this._restaurantsProfile.location.lng){
            let mapOptions: GoogleMapOptions = {
                camera: {
                    target: {
                        lat: this._restaurantsProfile.location.lat,
                        lng: this._restaurantsProfile.location.lng
                    },
                    zoom: 18,
                    tilt: 30
                }
            };
            this._map = GoogleMaps.create('map_canvas', mapOptions);
            this._map.one(GoogleMapsEvent.MAP_READY).then(() => {
                this._map.addMarker({
                    title: 'Ionic',
                    icon: 'blue',
                    animation: 'DROP',
                    position: {
                        lat: this._restaurantsProfile.location.lat,
                        lng: this._restaurantsProfile.location.lng
                    }
                })
                .then(marker => {
                    marker.on(GoogleMapsEvent.MARKER_CLICK)
                        .subscribe(() => {
                        alert('clicked');
                    });
                });
            });
        }
    }

    /**
     * 
     */
    showInformation(){
        this._showDescription = !this._showDescription;
    }

    /**
     * Open password change modal
     */
    openSchedule() {
        let contactModal = this._modalCtrl.create(ModalSchedule, {
            restaurant : this._restaurant
        });
        contactModal.present();
    }

    /**
     * ngOndestroy implementation
     */
    ngOnDestroy(){
        if(this._countriesSubscription){ this._countriesSubscription };
        if(this._citiesSubscription){ this._citiesSubscription };
        if(this._restaurantProfileSubscription){ this._restaurantProfileSubscription };
        if(this._restaurantProfileImgsSubscription){ this._restaurantProfileImgsSubscription };
        if(this._paymentMethodsSubscription){ this._paymentMethodsSubscription };
    }
}