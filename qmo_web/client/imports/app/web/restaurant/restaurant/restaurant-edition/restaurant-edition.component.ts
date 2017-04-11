import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { Meteor } from 'meteor/meteor';
import { Router, ActivatedRoute } from '@angular/router';
import { uploadRestaurantImage } from '../../../../../../../both/methods/restaurant/restaurant.methods';
import { MouseEvent } from "angular2-google-maps/core";
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

import template from './restaurant-edition.component.html';
import style from './restaurant-edition.component.scss';

@Component({
    selector: 'restaurant-edition',
    template,
    styles: [ style ]
})
export class RestaurantEditionComponent implements OnInit, OnDestroy {

    private _restaurantToEdit: Restaurant;
    private _restaurantEditionForm: FormGroup;
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

    private _currencies: Currency[] = [];
    private _currenciesList: Currency[] = [];
    private _paymentMethods: PaymentMethod[] = [];
    private _paymentMethodsList: PaymentMethod[] = [];
    private _restaurantCurrencies: string[] = [];
    private _restaurantPaymentMethods: string[] = [];

    private _filesToUpload: Array<File>;
    private _restaurantImageToEdit: File;
    private _editImage: boolean = false;
    private _nameImageFileEdit: string = "";
    public _selectedIndex: number = 0;
    private _restaurantEditImage: string;

    private _selectedCountryValue: string = "";
    private _selectedCityValue: string = "";

    private _restaurantCountryValue: string;
    private _restaurantCityValue: string;

    private _edition_id: string;
    private _edition_countryId: string;
    private _edition_cityId: string;
    private _edition_name: string;
    private _edition_address: string;
    private _edition_indicative: string;
    private _edition_phone: string;
    private _edition_webpage: string;
    private _edition_email: string;
    private _edition_invoice_code: string;
    private _edition_tip_percentage: number;
    private _edition_tax_percentage: number;
    private _edition_currencies: string[];
    private _edition_paymentMethods: string[];
    private _edition_schedule: RestaurantSchedule;

    private _scheduleToEdit: RestaurantSchedule;

    /**
     * RestaurantEditionComponent Constructor
     * @param {FormBuilder} _formBuilder 
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     * @param {ActivatedRoute} _route 
     * @param {Router} _router 
     */
    constructor( private _formBuilder: FormBuilder, private _translate: TranslateService, private _ngZone: NgZone, private _route: ActivatedRoute, private _router: Router ){
        this._route.queryParams.subscribe( params => {
            this._restaurantToEdit = JSON.parse( params[ "restaurant" ] );
        });
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit(){
        this._restaurantEditionForm = this._formBuilder.group({
            editId: [ this._restaurantToEdit._id ],
            country: [ this._restaurantToEdit.countryId ],
            city: [ this._restaurantToEdit.cityId ],
            name: [ this._restaurantToEdit.name ],
            address: [ this._restaurantToEdit.address ],
            indicative: [ this._restaurantToEdit.indicative ],
            phone: [ this._restaurantToEdit.phone ],
            webPage: [ this._restaurantToEdit.webPage ],
            email: [ this._restaurantToEdit.email ],
            invoiceCode: [ this._restaurantToEdit.invoice_code ],
            tipPercentage: [ this._restaurantToEdit.tip_percentage ],
            taxPercentage: [ this._restaurantToEdit.tax_percentage ],
            editImage: [ '' ],
            currencies: this._currenciesFormGroup,
            paymentMethods: this._paymentsFormGroup,
        });

        this._selectedCountryValue = this._restaurantToEdit.countryId;
        this._restaurantCountryValue = this._restaurantToEdit.countryId;
        this._selectedCityValue = this._restaurantToEdit.cityId;
        this._restaurantCityValue = this._restaurantToEdit.cityId;
        this._restaurantEditImage = this._restaurantToEdit.urlImage;
        this._restaurantCurrencies = this._restaurantToEdit.currencies;
        this._restaurantPaymentMethods = this._restaurantToEdit.paymentMethods;
        this._scheduleToEdit = this._restaurantToEdit.schedule;

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

                    let find = this._restaurantCurrencies.filter( c => c === currencyTranslated._id);

                    if( find.length > 0 ){
                        let control: FormControl = new FormControl( true );
                        this._currenciesFormGroup.addControl( currencyTranslated.name, control );
                        this._currenciesList.push( currencyTranslated );
                    } else {                        
                        let control: FormControl = new FormControl( false );
                        this._currenciesFormGroup.addControl( currencyTranslated.name, control );
                        this._currenciesList.push( currencyTranslated );
                    }
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

                    let find = this._restaurantPaymentMethods.filter( p => p === paymentTranslated._id );

                    if( find.length > 0 ){
                        let control: FormControl = new FormControl( true );
                        this._paymentsFormGroup.addControl( paymentTranslated.name, control );
                        this._paymentMethodsList.push( paymentTranslated );
                    } else {
                        let control: FormControl = new FormControl( false );
                        this._paymentsFormGroup.addControl( paymentTranslated.name, control );
                        this._paymentMethodsList.push( paymentTranslated );
                    }
                }
            });
        });

        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', Meteor.userId() ).subscribe();     
        this._countries = Countries.find( { } ).zone();
        this._countriesSub = MeteorObservable.subscribe( 'countries' ).subscribe();
        this._cities = Cities.find( { } ).zone();
        this._citiesSub = MeteorObservable.subscribe( 'cities' ).subscribe();
        this._restaurantImagesSub = MeteorObservable.subscribe( 'restaurantImages', Meteor.userId() ).subscribe();
    }

    /**
     * Funtion to edit Restaurant
     */
    editRestaurant():void{
        if(!Meteor.userId()){
            alert('Please log in to add a restaurant');
            return;
        }

        let arr:any[] = Object.keys( this._restaurantEditionForm.value.currencies );
        let _lCurrenciesToInsert: string[] = [];

        arr.forEach( ( cur ) => {
            if( this._restaurantEditionForm.value.currencies[ cur ] ){
                let _lCurr:Currency = this._currenciesList.filter( c => c.name === cur )[0];
                _lCurrenciesToInsert.push( _lCurr._id );
            }
        });

        let arrPay:any[] = Object.keys( this._restaurantEditionForm.value.paymentMethods );
        let _lPaymentMethodsToInsert: string[] = [];

        arrPay.forEach( ( pay ) => {
            if( this._restaurantEditionForm.value.paymentMethods[ pay ] ){
                let _lPayment:PaymentMethod = this._paymentMethodsList.filter( p => p.name === pay )[0];
                _lPaymentMethodsToInsert.push( _lPayment._id );
            }
        });

        if( this._editImage ){
            this._edition_id = this._restaurantEditionForm.value.editId;
            this._edition_countryId = this._restaurantEditionForm.value.country;
            this._edition_cityId = this._restaurantEditionForm.value.city;
            this._edition_name = this._restaurantEditionForm.value.name;
            this._edition_address = this._restaurantEditionForm.value.address;
            this._edition_indicative = this._restaurantEditionForm.value.indicative;
            this._edition_phone = this._restaurantEditionForm.value.phone;
            this._edition_webpage = this._restaurantEditionForm.value.webPage;
            this._edition_email = this._restaurantEditionForm.value.email;
            this._edition_invoice_code = this._restaurantEditionForm.value.invoiceCode;
            this._edition_tip_percentage = this._restaurantEditionForm.value.tipPercentage;
            this._edition_tax_percentage = this._restaurantEditionForm.value.taxPercentage;
            this._edition_currencies = _lCurrenciesToInsert;
            this._edition_paymentMethods = _lPaymentMethodsToInsert;

            uploadRestaurantImage( this._restaurantImageToEdit, Meteor.userId() ).then( ( result ) => {
                Restaurants.update( this._edition_id, {
                    $set: {
                        modification_user: Meteor.userId(),
                        modification_date: new Date(),
                        countryId: this._edition_countryId,
                        cityId: this._edition_cityId,
                        name: this._edition_name,
                        address: this._edition_address,
                        indicative: this._edition_indicative,
                        phone: this._edition_phone,
                        webPage: this._edition_webpage,
                        email: this._edition_email,
                        invoice_code: this._edition_invoice_code,
                        tip_percentage: this._edition_tip_percentage,
                        tax_percentage: this._edition_tax_percentage,
                        currencies: this._edition_currencies,
                        paymentMethods: this._edition_paymentMethods,
                        restaurantImageId: result._id,
                        urlImage: result.url,
                        schedule: this._edition_schedule
                    }
                });
            }).catch( ( error ) => {
                alert('Upload image error. Only accept .png, .jpg, .jpeg files.');
            });
        } else {
            Restaurants.update( this._restaurantEditionForm.value.editId, {
                $set: {
                    modification_user: Meteor.userId(),
                    modification_date: new Date(),
                    countryId: this._restaurantEditionForm.value.country,
                    cityId: this._restaurantEditionForm.value.city,
                    name: this._restaurantEditionForm.value.name,
                    address: this._restaurantEditionForm.value.address,
                    indicative: this._restaurantEditionForm.value.indicative,
                    phone: this._restaurantEditionForm.value.phone,
                    webPage: this._restaurantEditionForm.value.webPage,
                    email: this._restaurantEditionForm.value.email,
                    invoice_code: this._restaurantEditionForm.value.invoiceCode,
                    tip_percentage: this._restaurantEditionForm.value.tipPercentage,
                    tax_percentage: this._restaurantEditionForm.value.taxPercentage,
                    currencies: _lCurrenciesToInsert,
                    paymentMethods: _lPaymentMethodsToInsert,
                    schedule: this._edition_schedule
                }
            });
        }
        this.cancel();
    }

    /**
     * Function to cancel edition
     */
    cancel():void{
        this._router.navigate(['app/restaurant']);
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
        return this._restaurantEditionForm.valid;
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
            if( this._restaurantEditionForm.controls['country'].valid && this._restaurantEditionForm.controls['city'].valid
                && this._restaurantEditionForm.controls['name'].valid && this._restaurantEditionForm.controls['address'].valid
                && this._restaurantEditionForm.controls['phone'].valid ){
                return true;
            } else {
                return false;
            }
        case 2:
            if( this._restaurantEditionForm.controls['invoiceCode'].valid && this._restaurantEditionForm.controls['tipPercentage'].valid
                && this._restaurantEditionForm.controls['taxPercentage'].valid ){
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
     * When user change Image, this function allow update in the store
     * @param {any} _fileInput
     */
    onChangeImage( _fileInput:any ):void{
        this._editImage = true;
        this._filesToUpload = <Array<File>> _fileInput.target.files;
        this._restaurantImageToEdit = this._filesToUpload[0];
        this._nameImageFileEdit = this._restaurantImageToEdit.name;
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
     * This function receive schedule from iu-schedule component
     * @param {any} _event 
     */
    receiveSchedule( _event:any ):void{
        this._edition_schedule = _event;
    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
        this._restaurantSub.unsubscribe();
        this._hoursSub.unsubscribe();
        this._currencySub.unsubscribe();
        this._countriesSub.unsubscribe();
        this._citiesSub.unsubscribe();
        this._paymentMethodsSub.unsubscribe();
        this._restaurantImagesSub.unsubscribe();
    }
}