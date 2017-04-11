import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Router } from '@angular/router';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { Restaurant, RestaurantSchedule } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Hours } from '../../../../../../../both/collections/general/hours.collection';
import { Hour } from '../../../../../../../both/models/general/hour.model';
import { Currency } from '../../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../../both/collections/general/currency.collection';
import { PaymentMethod } from '../../../../../../../both/models/general/paymentMethod.model';
import { PaymentMethods } from '../../../../../../../both/collections/general/paymentMethod.collection';
import { Countries } from '../../../../../../../both/collections/settings/country.collection';
import { Country } from '../../../../../../../both/models/settings/country.model'; 
import { City } from '../../../../../../../both/models/settings/city.model';
import { Cities } from '../../../../../../../both/collections/settings/city.collection';
import { uploadRestaurantImage, createRestaurantCode } from '../../../../../../../both/methods/restaurant/restaurant.methods';
import { Meteor } from 'meteor/meteor';

import template from './restaurant-register.component.html';
import style from './restaurant-register.component.scss';

@Component({
    selector: 'restaurant-register',
    template,
    styles: [style]
})
export class RestaurantRegisterComponent implements OnInit, OnDestroy {

    private _restaurantForm: FormGroup;
    private _currenciesFormGroup: FormGroup = new FormGroup({});
    private _paymentsFormGroup: FormGroup = new FormGroup({});

    private _restaurantSub: Subscription;
    private _hoursSub: Subscription;
    private _currencySub: Subscription;
    private _countriesSub: Subscription;
    private _citiesSub: Subscription;
    private _paymentMethodsSub: Subscription;
    private _restaurantImagesSub: Subscription;

    private _hours: Observable<Hour[]>;
    private _countries: Observable<Country[]>;
    private _cities: Observable<City[]>;
    
    private _currencies: Currency[];
    private _currenciesList: Currency[];
    private _paymentMethods: PaymentMethod[];
    private _paymentMethodsList: PaymentMethod[];
    
    private _filesToUpload: Array<File>;
    private _restaurantImageToInsert: File;
    private _createImage: boolean;
    private _nameImageFile: string;
    public _selectedIndex: number = 0;

    private _selectedCountryValue: string;
    private _selectedCityValue: string;

    private _create_countryId: string;
    private _create_cityId: string;
    private _create_name: string;
    private _create_address: string;
    private _create_indicative: string;
    private _create_phone: string;
    private _create_webpage: string;
    private _create_email: string;
    private _create_invoice_code: string;
    private _create_tip_percentage: number;
    private _create_tax_percentage: number;
    private _create_currencies: string[];
    private _create_paymentMethods: string[];

    private _schedule: RestaurantSchedule;

    /**
     * RestaurantRegisterComponent constructor
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {NgZone} _ngZone
     * @param {Router} _router
     */
    constructor( private _formBuilder: FormBuilder, private _translate: TranslateService, private _ngZone: NgZone, private _router: Router ){
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
        this._selectedCountryValue = "";
        this._selectedCityValue = "";
        this._nameImageFile = "";
        this._currencies = [];
        this._currenciesList = [];
        this._paymentMethods = [];
        this._paymentMethodsList = [];
        this._filesToUpload = [];
        this._createImage = false;
    }

    /**
     * Implements ngOnInit implementation
     */
    ngOnInit() {                    
        this._restaurantForm = new FormGroup({
            country: new FormControl( '', [ Validators.required ] ),
            city: new FormControl( '', [ Validators.required ] ),
            name: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 70 ) ] ),
            address: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 90 ) ] ),
            indicative: new FormControl( '', [ Validators.maxLength( 3 ) ] ),
            phone: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 40 ) ] ),
            webPage: new FormControl( '', [ Validators.minLength( 1 ), Validators.maxLength( 40 ) ] ),
            email: new FormControl( '', [ Validators.minLength( 1 ), Validators.maxLength( 40 ) ] ),
            invoiceCode: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 20 ) ] ),
            tipPercentage: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 3 ) ] ),
            taxPercentage: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 3 ) ] ),
            image: new FormControl( '' ),
            currencies: this._currenciesFormGroup,
            paymentMethods: this._paymentsFormGroup,
        });

        this._hoursSub = MeteorObservable.subscribe( 'hours' ).subscribe( () => {
            this._ngZone.run( () => {
                this._hours = Hours.find( {}, { sort: { hour: 1 } } );
            });
        });

        this._currencySub = MeteorObservable.subscribe( 'currencies' ).subscribe( () => {
            this._ngZone.run( () => {
                this._currencies = Currencies.collection.find( { } ).fetch();
                for ( let cur of this._currencies ) {
                    let currencyTranslated:Currency = {
                        _id: cur._id,
                        isActive: cur.isActive,
                        name: this.itemNameTraduction( cur.name )
                    };                 
                    this._currenciesList.push( currencyTranslated );
                    let control: FormControl = new FormControl( false );
                    this._currenciesFormGroup.addControl( currencyTranslated.name, control );
                }
            });
        });

        this._paymentMethodsSub = MeteorObservable.subscribe( 'paymentMethods' ).subscribe( () => {
            this._ngZone.run( () => {
                this._paymentMethods = PaymentMethods.collection.find( { } ).fetch();
                for( let pay of this._paymentMethods ){
                    let paymentTranslated:PaymentMethod = {
                        _id: pay._id,
                        isActive: pay.isActive,
                        name: this.itemNameTraduction( pay.name )
                    };
                    this._paymentMethodsList.push( paymentTranslated );
                    let control: FormControl = new FormControl( false );
                    this._paymentsFormGroup.addControl( paymentTranslated.name, control );
                }
            });
        });

        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', Meteor.userId() ).subscribe();     
        this._countries = Countries.find( { } ).zone();
        this._countriesSub = MeteorObservable.subscribe( 'countries' ).subscribe();
        this._citiesSub = MeteorObservable.subscribe( 'cities' ).subscribe();
        this._restaurantImagesSub = MeteorObservable.subscribe( 'restaurantImages', Meteor.userId() ).subscribe();

        this._schedule = {
            monday: {
                isActive: false,
                opening_time: '',
                closing_time: ''
            },
            tuesday: {
                isActive: false,
                opening_time: '',
                closing_time: ''
            },
            wednesday: {
                isActive: false,
                opening_time: '',
                closing_time: ''
            },
            thursday: {
                isActive: false,
                opening_time: '',
                closing_time: ''
            },
            friday: {
                isActive: false,
                opening_time: '',
                closing_time: ''
            },
            saturday: {
                isActive: false,
                opening_time: '',
                closing_time: ''
            },
            sunday: {
                isActive: false,
                opening_time: '',
                closing_time: ''
            }
        };
    }

    /**
     * This function get selectedIndex
     */
    get selectedIndex(): number {
        return this._selectedIndex;
    }

    /**
     * This function set selectedIndex
     * @param {number} _selectedIndex
     */
    set selectedIndex( _selectedIndex: number ) {
        this._selectedIndex = _selectedIndex;
    }

    /**
     * This fuction allow wizard to create restaurant
     */
    canFinish(): boolean {
        return this._restaurantForm.valid;
    }

    /**
     * This function allow move in wizard tabs
     * @param {number} _index
     */
    canMove( _index: number ): boolean {
        switch ( _index ) {
        case 0:
            return true;
        case 1:
            if( this._restaurantForm.controls['country'].valid && this._restaurantForm.controls['city'].valid
                && this._restaurantForm.controls['name'].valid && this._restaurantForm.controls['address'].valid
                && this._restaurantForm.controls['phone'].valid ){
                return true;
            } else {
                return false;
            }
        case 2:
            if( this._restaurantForm.controls['invoiceCode'].valid && this._restaurantForm.controls['tipPercentage'].valid
                && this._restaurantForm.controls['taxPercentage'].valid ){
                return true;
            } else {
                return false;
            }
        case 3:
            return true;
        case 4:
            return true;
        default:
            return true;
        }
    }

    /**
     * This function move to the next tab
     */
    next(): void {
        if( this.canMove( this.selectedIndex + 1 ) ) {
            this.selectedIndex ++;
        }
    }

    /**
     * This function move to the previous tab
     */
    previous(): void {
        if( this.selectedIndex === 0 ) {
            return;
        }
        if( this.canMove( this.selectedIndex - 1 ) ) {
            this.selectedIndex --;
        }
    }

    /**
     * Function to cancel add Restaurant 
     */
    cancel():void{
        if( this._selectedCountryValue !== "" ){ this._selectedCountryValue = ""; }
        if( this._selectedCityValue !== "" ){ this._selectedCityValue = ""; }    
        this._restaurantForm.controls['currencies'].reset();
        this._restaurantForm.controls['paymentMethods'].reset();
        this._restaurantForm.controls['name'].reset();
        this._restaurantForm.controls['address'].reset();
        this._restaurantForm.controls['indicative'].reset();
        this._restaurantForm.controls['phone'].reset();
        this._restaurantForm.controls['webPage'].reset();
        this._restaurantForm.controls['email'].reset();
        this._restaurantForm.controls['invoiceCode'].reset();
        this._restaurantForm.controls['tipPercentage'].reset();
        this._restaurantForm.controls['taxPercentage'].reset();           
       
        this._router.navigate( [ 'app/restaurant' ] );
    }

    /**
     * Function to add Restaurant
     */
    addRestaurant(): void{
        if(!Meteor.userId()){
            alert('Please log in to add a restaurant');
            return;
        }

        let arr:any[] = Object.keys( this._restaurantForm.value.currencies );
        let _lCurrenciesToInsert: string[] = [];

        arr.forEach( ( cur ) => {
            if( this._restaurantForm.value.currencies[ cur ] ){
                let _lCurr:Currency = this._currenciesList.filter( c => c.name === cur )[0];
                _lCurrenciesToInsert.push( _lCurr._id );
            }
        });

        let arrPay:any[] = Object.keys( this._restaurantForm.value.paymentMethods );
        let _lPaymentMethodsToInsert: string[] = [];

        arrPay.forEach( ( pay ) => {
            if( this._restaurantForm.value.paymentMethods[ pay ] ){
                let _lPayment:PaymentMethod = this._paymentMethodsList.filter( p => p.name === pay )[0];
                _lPaymentMethodsToInsert.push( _lPayment._id );
            }
        });

        if( this._createImage ){
            this._create_countryId = this._restaurantForm.value.country;
            this._create_cityId = this._restaurantForm.value.city;
            this._create_name = this._restaurantForm.value.name;
            this._create_address = this._restaurantForm.value.address;
            this._create_indicative = this._restaurantForm.value.indicative;
            this._create_phone = this._restaurantForm.value.phone;
            this._create_webpage = this._restaurantForm.value.webPage;
            this._create_email = this._restaurantForm.value.email;
            this._create_invoice_code = this._restaurantForm.value.invoiceCode;
            this._create_tip_percentage = this._restaurantForm.value.tipPercentage;
            this._create_tax_percentage = this._restaurantForm.value.taxPercentage;
            this._create_currencies = _lCurrenciesToInsert;
            this._create_paymentMethods = _lPaymentMethodsToInsert;

            uploadRestaurantImage( this._restaurantImageToInsert, Meteor.userId() ).then( ( result ) => {
                Restaurants.insert({
                    creation_user: Meteor.userId(),
                    creation_date: new Date(),
                    modification_user: '-',
                    modification_date: new Date(),
                    countryId: this._create_countryId,
                    cityId: this._create_cityId,
                    name: this._create_name,
                    address: this._create_address,
                    indicative: this._create_indicative,
                    phone: this._create_phone,
                    restaurant_code: this.generateRestaurantCode(),
                    webPage: this._create_webpage,
                    email: this._create_email,
                    invoice_code: this._create_invoice_code,
                    tip_percentage: this._create_tip_percentage,
                    tax_percentage: this._create_tax_percentage,
                    currencies: this._create_currencies,
                    paymentMethods: this._create_paymentMethods,
                    restaurantImageId: result._id,
                    urlImage: result.url,
                    location: {
                        lat: 0,
                        lng: 0
                    },
                    schedule: this._schedule,
                    tables_quantity: 0,
                    orderNumberCount: 0                
                });
            }).catch( ( error ) => {
                alert('Upload image error. Only accept .png, .jpg, .jpeg files.');
            });                   
        } else {
            Restaurants.insert({
                creation_user: Meteor.userId(),
                creation_date: new Date(),
                modification_user: '-',
                modification_date: new Date(),
                countryId: this._restaurantForm.value.country,
                cityId: this._restaurantForm.value.city,
                name: this._restaurantForm.value.name,
                address: this._restaurantForm.value.address,
                indicative: this._restaurantForm.value.indicative,
                phone: this._restaurantForm.value.phone,
                webPage: this._restaurantForm.value.webPage,
                email: this._restaurantForm.value.email,
                restaurant_code: this.generateRestaurantCode(),
                invoice_code: this._restaurantForm.value.invoiceCode,
                tip_percentage: this._restaurantForm.value.tipPercentage,
                tax_percentage: this._restaurantForm.value.taxPercentage,
                currencies: this._restaurantForm.value.currencies,
                paymentMethods: this._restaurantForm.value.paymentMethods,
                restaurantImageId: '-',
                urlImage: '-',
                location: {
                        lat: 0,
                        lng: 0
                },
                schedule: this._schedule,            
                tables_quantity: 0,
                orderNumberCount: 0                
            });
        }            
        this.cancel();
    }

    /**
     * Function to translate information
     * @param {string} _itemName
     */
    itemNameTraduction( _itemName: string ): string{
        var _wordTraduced: string;
        this._translate.get( _itemName ).subscribe( ( res: string ) => {
            _wordTraduced = res; 
        });
        return _wordTraduced;
    }

    /**
     * Function to change country
     * @param {string} _country
     */
    changeCountry( _country ){
        this._selectedCountryValue = _country;
        this._restaurantForm.controls['country'].setValue( _country );
        this._cities = Cities.find( { country: _country } ).zone();
    }

    /**
     * Function to change city
     * @param {string} _city
     */
    changeCity( _city ){
        this._selectedCityValue = _city;
        this._restaurantForm.controls['city'].setValue( _city );
    }

    /**
     * Function to receive schedule from schedule component
     * @param {any} _event 
     */
    receiveSchedule( _event:any ):void{
        this._schedule = _event;
    }

    /**
     * When user change Image, this function allow insert in the store
     * @param {any} _fileInput
     */
    onChangeImage( _fileInput:any ):void{
        this._createImage = true;
        this._filesToUpload = <Array<File>> _fileInput.target.files;
        this._restaurantImageToInsert = this._filesToUpload[0];
        this._nameImageFile = this._restaurantImageToInsert.name;
    }

    /**
     * Function to generate Restaurant code
     */
    generateRestaurantCode():string{
        let _lCode:string = '';

        while( true ){
            _lCode = createRestaurantCode();
            if ( Restaurants.find( {restaurant_code: _lCode} ).cursor.count() === 0 ){
                break;
            }
        }
        return _lCode;
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy() {
        this._hoursSub.unsubscribe();
        this._restaurantSub.unsubscribe();
        this._countriesSub.unsubscribe();
        this._citiesSub.unsubscribe();
        this._restaurantImagesSub.unsubscribe();
        this._currencySub.unsubscribe();
        this._paymentMethodsSub.unsubscribe();
    }
}
