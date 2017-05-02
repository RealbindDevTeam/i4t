import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Router } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { Restaurant, RestaurantSchedule, RestaurantFinancialElement } from '../../../../../../../both/models/restaurant/restaurant.model';
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
import { FinancialBase } from '../../../../../../../both/shared-components/restaurant/financial-info/financial-base';
import { FinancialCheckBox } from '../../../../../../../both/shared-components/restaurant/financial-info/financial-checkbox';
import { FinancialDropDown } from '../../../../../../../both/shared-components/restaurant/financial-info/financial-dropdown';
import { FinancialTextBox } from '../../../../../../../both/shared-components/restaurant/financial-info/financial-textbox';

import template from './restaurant-register.component.html';
import style from './restaurant-register.component.scss';

@Component({
    selector: 'restaurant-register',
    template,
    styles: [style]
})
export class RestaurantRegisterComponent implements OnInit, OnDestroy {

    private _restaurantForm: FormGroup;
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

    private _paymentMethods: PaymentMethod[];
    private _paymentMethodsList: PaymentMethod[];
    
    private _filesToUpload: Array<File>;
    private _restaurantImageToInsert: File;
    private _createImage: boolean;
    private _nameImageFile: string;
    public _selectedIndex: number = 0;

    private _selectedCountryValue: string;
    private _selectedCityValue: string;
    private _restaurantCurrency: string = '';
    private _countryIndicative: string;
    private _restaurantCurrencyId: string = '';

    private _schedule: RestaurantSchedule;
    private _taxPercentage: number = 0;
    private _tipPercentage: number = 0;

    private _financialElements: FinancialBase<any>[] = [];
    private _showFinancialElements: boolean = false;

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
            phone: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 30 ) ] ),
            webPage: new FormControl( '', [ Validators.minLength( 1 ), Validators.maxLength( 40 ) ] ),
            email: new FormControl( '', [ Validators.minLength( 1 ), Validators.maxLength( 40 ) ] ),
            invoiceCode: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 20 ) ] ),
            image: new FormControl( '' ),
            paymentMethods: this._paymentsFormGroup,
        });

        this._hoursSub = MeteorObservable.subscribe( 'hours' ).subscribe( () => {
            this._ngZone.run( () => {
                this._hours = Hours.find( {}, { sort: { hour: 1 } } );
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
        this._currencySub = MeteorObservable.subscribe( 'currencies' ).subscribe();

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
            if( this._restaurantForm.controls['invoiceCode'].valid ){
                return true;
            } else {
                return false;
            }
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
        this._restaurantForm.controls['paymentMethods'].reset();
        this._restaurantForm.controls['name'].reset();
        this._restaurantForm.controls['address'].reset();
        this._restaurantForm.controls['phone'].reset();
        this._restaurantForm.controls['webPage'].reset();
        this._restaurantForm.controls['email'].reset();
        this._restaurantForm.controls['invoiceCode'].reset();       
       
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

        let arrPay:any[] = Object.keys( this._restaurantForm.value.paymentMethods );
        let _lPaymentMethodsToInsert: string[] = [];

        arrPay.forEach( ( pay ) => {
            if( this._restaurantForm.value.paymentMethods[ pay ] ){
                let _lPayment:PaymentMethod = this._paymentMethodsList.filter( p => p.name === pay )[0];
                _lPaymentMethodsToInsert.push( _lPayment._id );
            }
        });

        let _lNewRestaurant;
        /*let _lNewRestaurant = Restaurants.collection.insert({
            creation_user: Meteor.userId(),
            creation_date: new Date(),
            modification_user: '-',
            modification_date: new Date(),
            countryId: this._restaurantForm.value.country,
            cityId: this._restaurantForm.value.city,
            name: this._restaurantForm.value.name,
            currencyId: this._restaurantCurrencyId,
            address: this._restaurantForm.value.address,
            indicative: this._countryIndicative,
            phone: this._restaurantForm.value.phone,
            webPage: this._restaurantForm.value.webPage,
            email: this._restaurantForm.value.email,
            restaurant_code: this.generateRestaurantCode(),
            invoice_code: this._restaurantForm.value.invoiceCode,
            tip_percentage: this._tipPercentage,
            tax_percentage: this._taxPercentage,
            paymentMethods: _lPaymentMethodsToInsert,
            location: {
                    lat: 0,
                    lng: 0
            },
            schedule: this._schedule,            
            tables_quantity: 0,
            orderNumberCount: 0,
            max_jobs: 5                
        });*/

        if( this._createImage ){
            uploadRestaurantImage( this._restaurantImageToInsert, 
                                   Meteor.userId(), 
                                   _lNewRestaurant ).then( ( result ) => {

            }).catch( ( error ) => {
                alert('Upload image error. Only accept .png, .jpg, .jpeg files.');
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
        
        let _lCountry: Country;
        Countries.find( { _id: _country } ).fetch().forEach( (c) => {
            _lCountry = c;
        });
        let _lCurrency: Currency;
        Currencies.find( { _id: _lCountry.currencyId } ).fetch().forEach( (cu) => {
            _lCurrency = cu;
        });    
        this._restaurantCurrencyId = _lCurrency._id;
        this._restaurantCurrency = _lCurrency.code + ' - ' + this.itemNameTraduction( _lCurrency.name );
        this._countryIndicative = _lCountry.indicative;
        this.createFinancialForm( _lCountry.financialInformation );
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
     * Get tax percentage slider value
     * @param {any} _event 
     */
    onTaxPercentageChange( _event:any ):void{
        this._taxPercentage = _event.value;
    }

    /**
     * Get tip percentage slider value
     * @param {any} _event 
     */
    onTipPercentageChange( _event:any ):void{
        this._tipPercentage = _event.value;
    }

    createFinancialForm( _pFinancialInformation: RestaurantFinancialElement[] ):void{
        _pFinancialInformation.forEach( (element) => {
            if( element.controlType === 'textbox' ){
                this._financialElements.push( new FinancialTextBox( {
                                                                        key: element.key,
                                                                        label: element.label,
                                                                        value: element.value,
                                                                        required: element.required,
                                                                        order: element.order
                                                                    }
                                                                  ) 
                                            );
            } else if( element.controlType === 'checkbox' ){
                this._financialElements.push( new FinancialCheckBox( {
                                                                        key: element.key,
                                                                        label: element.label,
                                                                        value: element.value,
                                                                        required: element.required,
                                                                        order: element.order
                                                                     } 
                                                                   )
                                            );
            }
        });
        this._financialElements.sort( ( a, b ) => a.order - b.order );
        this._showFinancialElements = true;
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
