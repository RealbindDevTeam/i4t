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
import { Restaurants, RestaurantImages, RestaurantImageThumbs } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { Restaurant, RestaurantSchedule, RestaurantImage, RestaurantFinancialElement, RestaurantImageThumb } from '../../../../../../../both/models/restaurant/restaurant.model';
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
import { FinancialBase } from '../../../../../../../both/shared-components/restaurant/financial-info/financial-base';
import { FinancialCheckBox } from '../../../../../../../both/shared-components/restaurant/financial-info/financial-checkbox';
import { FinancialDropDown } from '../../../../../../../both/shared-components/restaurant/financial-info/financial-dropdown';
import { FinancialTextBox } from '../../../../../../../both/shared-components/restaurant/financial-info/financial-textbox';
import { FinancialText } from '../../../../../../../both/shared-components/restaurant/financial-info/financial-text';
import { FinancialSlider } from '../../../../../../../both/shared-components/restaurant/financial-info/financial-slider';

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
    private _paymentsFormGroup: FormGroup = new FormGroup({});

    private _restaurantSub: Subscription;
    private _hoursSub: Subscription;
    private _currencySub: Subscription;
    private _countriesSub: Subscription;
    private _citiesSub: Subscription;
    private _paymentMethodsSub: Subscription;
    private _restaurantImagesSub: Subscription;
    private _restaurantImageThumbsSub: Subscription;

    private _hours: Observable<Hour[]>;
    private _countries: Observable<Country[]>;
    private _cities: Observable<City[]>;
    private _currencies: Observable<Currency[]>;

    private _paymentMethods: PaymentMethod[] = [];
    private _paymentMethodsList: PaymentMethod[] = [];
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

    private _restaurantCurrency: string = '';
    private _countryIndicative: string;

    private _edition_schedule: RestaurantSchedule;

    private _scheduleToEdit: RestaurantSchedule;
    private _financialElements: FinancialBase<any>[] = [];
    private _showFinancialElements: boolean = false;
    private _restaurantFinancialInformation: Object = {};
    private _financialInformation: RestaurantFinancialElement[] = [];

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
            phone: [ this._restaurantToEdit.phone ],
            webPage: [ this._restaurantToEdit.webPage ],
            email: [ this._restaurantToEdit.email ],
            editImage: [ '' ],
            paymentMethods: this._paymentsFormGroup,
        });

        this._selectedCountryValue = this._restaurantToEdit.countryId;
        this._restaurantCountryValue = this._restaurantToEdit.countryId;
        this._selectedCityValue = this._restaurantToEdit.cityId;
        this._restaurantCityValue = this._restaurantToEdit.cityId;
        this._restaurantPaymentMethods = this._restaurantToEdit.paymentMethods;
        this._scheduleToEdit = this._restaurantToEdit.schedule;
        this._countryIndicative = this._restaurantToEdit.indicative;

        this._hoursSub = MeteorObservable.subscribe( 'hours' ).subscribe( () => {
            this._ngZone.run( () => {
                this._hours = Hours.find( {}, { sort: { hour: 1 } } );
            });
        });

        this._currencySub = MeteorObservable.subscribe( 'currencies' ).subscribe( () => {
            let find: Currency[] = Currencies.find().fetch().filter( c => c._id === this._restaurantToEdit.currencyId );
            if( find ){
                this._restaurantCurrency = find[0].code + ' - ' + this.itemNameTraduction( find[0].name );
            }
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
        this._restaurantImageThumbsSub = MeteorObservable.subscribe( 'restaurantImageThumbs', Meteor.userId() ).subscribe();
        
        let _lCountry: Country = Countries.findOne( { _id: this._restaurantToEdit.countryId } );
        this.createFinancialFormEditMode( _lCountry.financialInformation, this._restaurantToEdit.financialInformation );
    }

    /**
     * Get Restaurant Image Thumb
     */
    getRestaurantImage():string{
        let _lRestaurantImage: RestaurantImageThumb = RestaurantImageThumbs.find().fetch().filter( (r) => r.restaurantId === this._restaurantToEdit._id )[0];
        if( _lRestaurantImage ){
            return _lRestaurantImage.url
        }
    }

    /**
     * Funtion to edit Restaurant
     */
    editRestaurant():void{
        if(!Meteor.userId()){
            alert('Please log in to add a restaurant');
            return;
        }

        let arrPay:any[] = Object.keys( this._restaurantEditionForm.value.paymentMethods );
        let _lPaymentMethodsToInsert: string[] = [];

        arrPay.forEach( ( pay ) => {
            if( this._restaurantEditionForm.value.paymentMethods[ pay ] ){
                let _lPayment:PaymentMethod = this._paymentMethodsList.filter( p => p.name === pay )[0];
                _lPaymentMethodsToInsert.push( _lPayment._id );
            }
        });

        Restaurants.update( this._restaurantEditionForm.value.editId, {
            $set: {
                modification_user: Meteor.userId(),
                modification_date: new Date(),
                countryId: this._restaurantEditionForm.value.country,
                cityId: this._restaurantEditionForm.value.city,
                name: this._restaurantEditionForm.value.name,
                address: this._restaurantEditionForm.value.address,
                phone: this._restaurantEditionForm.value.phone,
                webPage: this._restaurantEditionForm.value.webPage,
                email: this._restaurantEditionForm.value.email,
                financialInformation: this._restaurantFinancialInformation,
                paymentMethods: _lPaymentMethodsToInsert,
                schedule: this._edition_schedule
            }
        });

        if( this._editImage ){
            let _lRestaurantImage: RestaurantImage = RestaurantImages.findOne( { restaurantId: this._restaurantEditionForm.value.editId } );
            let _lRestaurantImageThumb: RestaurantImageThumb = RestaurantImageThumbs.findOne( { restaurantId: this._restaurantEditionForm.value.editId } );
            RestaurantImages.remove( { _id: _lRestaurantImage._id } );
            RestaurantImageThumbs.remove( { _id: _lRestaurantImage._id } );

            uploadRestaurantImage( this._restaurantImageToEdit, 
                                   Meteor.userId(),
                                   this._restaurantEditionForm.value.editId ).then( ( result ) => {

            }).catch( ( error ) => {
                alert('Upload image error. Only accept .png, .jpg, .jpeg files.');
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
            let _lElementsValidated: boolean = true;
            if( this._showFinancialElements ){
                this._financialInformation.forEach( ( element ) => {
                    if( element.required !== undefined && element.required === true ){
                        let _lObjects: string[] = [];
                        _lObjects = Object.keys( this._restaurantFinancialInformation );
                        if( _lObjects.filter( e => e === element.key ).length === 0 ){
                            _lElementsValidated = false;
                        }
                    }
                });
                return _lElementsValidated;
            } else {
                return true;
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
     * Function to change country
     * @param {string} _country
     */
    changeCountry( _country ){
        this._selectedCountryValue = _country;
        this._restaurantEditionForm.controls['country'].setValue( _country );
        this._cities = Cities.find( { country: _country } ).zone();
        
        let _lCountry: Country;
        Countries.find( { _id: _country } ).fetch().forEach( (c) => {
            _lCountry = c;
        }); 
        let _lCurrency: Currency;
        Currencies.find( { _id: _lCountry.currencyId } ).fetch().forEach( (cu) => {
            _lCurrency = cu;
        });    
        this._restaurantCurrency = _lCurrency.code + ' - ' + this.itemNameTraduction( _lCurrency.name );
        this._countryIndicative = _lCountry.indicative;

        this._showFinancialElements = false;
        this._financialElements = [];
        this._restaurantFinancialInformation = {};
        this._financialInformation = _lCountry.financialInformation;
        this.createFinancialForm( this._financialInformation );
    }

    /**
     * Function to change city
     * @param {string} _city
     */
    changeCity( _city ){
        this._selectedCityValue = _city;
        this._restaurantEditionForm.controls['city'].setValue( _city );
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
     * Create Financial form from restaurant template
     * @param {RestaurantFinancialElement[]} _pFinancialInformation 
     */
    createFinancialForm( _pFinancialInformation: RestaurantFinancialElement[] ):void{
        if( _pFinancialInformation.length > 0 ){
            _pFinancialInformation.forEach( ( element ) => {
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
                } else if( element.controlType === 'text' ){
                    this._financialElements.push( new FinancialText( { 
                                                                        key: element.key, 
                                                                        label: element.label, 
                                                                        order: element.order 
                                                                     } 
                                                                   )
                                                );
                } else if ( element.controlType === 'slider' ){
                    this._financialElements.push( new FinancialSlider( {
                                                                          key: element.key,
                                                                          label: element.label,
                                                                          order: element.order,
                                                                          value: element.value,
                                                                          minValue: element.minValue,
                                                                          maxValue: element.maxValue,
                                                                          stepValue: element.stepValue
                    } ) );
                }
            });
            this._financialElements.sort( ( a, b ) => a.order - b.order );
            this._showFinancialElements = true;
        }
    }

    /**
     * Set Restaurant Financial Information
     * @param {Object} _event 
     */
    setRestaurantFinancialInfo( _event: Object ):void{
        this._restaurantFinancialInformation = _event;
    }

    /**
     * Create Financial form from restaurant template in edit mode
     * @param {RestaurantFinancialElement[]} _pFinancialInformation 
     */
    createFinancialFormEditMode( _pFinancialInformation: RestaurantFinancialElement[], _pRestaurantFinancialInfo: Object ):void{
        if( _pFinancialInformation.length > 0 ){
            _pFinancialInformation.forEach( ( element ) => {
                let _lValue: any;
                if( element.required !== undefined && element.required === true ){
                    let _lkey: string = Object.keys( _pRestaurantFinancialInfo ).filter( e => e === element.key )[0];
                    _lValue = _pRestaurantFinancialInfo[_lkey];
                }
                if( element.controlType === 'textbox' ){
                    this._financialElements.push( new FinancialTextBox( {
                                                                            key: element.key,
                                                                            label: element.label,
                                                                            value: _lValue === undefined ? element.value : _lValue,
                                                                            required: element.required,
                                                                            order: element.order
                                                                        }
                                                                    ) 
                                                );
                } else if( element.controlType === 'checkbox' ){
                    this._financialElements.push( new FinancialCheckBox( {
                                                                            key: element.key,
                                                                            label: element.label,
                                                                            value: _lValue === undefined ? element.value : _lValue,
                                                                            required: element.required,
                                                                            order: element.order
                                                                        } 
                                                                    )
                                                );
                } else if( element.controlType === 'text' ){
                    this._financialElements.push( new FinancialText( { 
                                                                        key: element.key, 
                                                                        label: element.label, 
                                                                        order: element.order 
                                                                     } 
                                                                   )
                                                );
                } else if ( element.controlType === 'slider' ){
                    this._financialElements.push( new FinancialSlider( {
                                                                          key: element.key,
                                                                          label: element.label,
                                                                          order: element.order,
                                                                          value: _lValue === undefined ? element.value : _lValue,
                                                                          minValue: element.minValue,
                                                                          maxValue: element.maxValue,
                                                                          stepValue: element.stepValue
                    } ) );
                }
            });
            this._financialElements.sort( ( a, b ) => a.order - b.order );
            this._showFinancialElements = true;
            this._restaurantFinancialInformation = _pRestaurantFinancialInfo;
        }
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
        this._restaurantImageThumbsSub.unsubscribe();
    }
}