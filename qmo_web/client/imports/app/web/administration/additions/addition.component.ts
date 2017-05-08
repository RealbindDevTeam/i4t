import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Additions } from '../../../../../../both/collections/administration/addition.collection';
import { Addition, AdditionRestaurant, AdditionPrice } from '../../../../../../both/models/administration/addition.model';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Currency } from '../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../both/collections/general/currency.collection';
import { AdditionEditComponent } from './additions-edit/addition-edit.component';
import { Country } from '../../../../../../both/models/settings/country.model';
import { Countries } from '../../../../../../both/collections/settings/country.collection';

import template from './addition.component.html';
import style from './addition.component.scss';

@Component({
    selector: 'addition',
    template,
    styles: [ style ]
})
export class AdditionComponent implements OnInit, OnDestroy{

    private _user = Meteor.userId();
    private _additionForm: FormGroup;
    private _restaurantsFormGroup: FormGroup = new FormGroup({});
    private _currenciesFormGroup: FormGroup = new FormGroup({});
    private _taxesFormGroup: FormGroup = new FormGroup({});

    private _additions: Observable<Addition[]>;
    private _restaurants: Observable<Restaurant[]>;
    private _currencies: Observable<Currency[]>;

    private _additionsSub: Subscription;
    private _restaurantSub: Subscription;
    private _currenciesSub: Subscription;
    private _countriesSub: Subscription;
    
    private _restaurantList:Restaurant[];
    public _dialogRef: MdDialogRef<any>;
    private _showRestaurants: boolean = true;
    private _restaurantCurrencies: string [] = [];
    private _showCurrencies: boolean = false;
    private _restaurantTaxes: string [] = [];
    private _showTaxes: boolean = false;

    /**
     * AdditionComponent constructor
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {MdDialog} _dialog
     */
    constructor( private _formBuilder: FormBuilder, private _translate: TranslateService, public _dialog: MdDialog, private _ngZone: NgZone ) {
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
        this._restaurantList = [];
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        let _lRestaurantsId: string[] = [];
        this._additionForm = new FormGroup({
            name: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 50 ) ] ),
            restaurants: this._restaurantsFormGroup,
            currencies: this._currenciesFormGroup,
            taxes: this._taxesFormGroup 
        });        

        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { } ).zone();
                this._restaurantList = Restaurants.collection.find({}).fetch();
                for( let res of this._restaurantList ){
                    _lRestaurantsId.push( res._id );
                    let control: FormControl = new FormControl( false );
                    this._restaurantsFormGroup.addControl( res.name, control );
                }
                if( this._restaurantList.length === 0 ){
                    this._showRestaurants = false;
                }
                this._countriesSub = MeteorObservable.subscribe( 'getCountriesByRestaurantsId', _lRestaurantsId ).subscribe();
                this._currenciesSub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', _lRestaurantsId ).subscribe();
                this._currencies = Currencies.find( { } ).zone();
            });
        });

        this._additions = Additions.find( { } ).zone();
        this._additionsSub = MeteorObservable.subscribe( 'additions', this._user ).subscribe();
    }

    /**
     * Function to add Addition
     */
    addAddition():void{
        if( !Meteor.userId() ){
            alert( 'Please log in to add a restaurant' );
            return;
        }

        let arrCur:any[] = Object.keys( this._additionForm.value.currencies );
        let _lAdditionRestaurantsToInsert: AdditionRestaurant[] = [];
        let _lAdditionPricesToInsert: AdditionPrice[] = [];

        arrCur.forEach( ( cur ) => {
            let find: Restaurant[] = this._restaurantList.filter( r => r.currencyId === cur );
            for( let res of find ){
                if( this._additionForm.value.restaurants[ res.name ] ){
                    let restau:Restaurant = Restaurants.findOne( { name: res.name } );
                    let _lAdditionRestaurant: AdditionRestaurant = { restaurantId: '', price: 0 };

                    _lAdditionRestaurant.restaurantId = restau._id;
                    _lAdditionRestaurant.price = this._additionForm.value.currencies[ cur ];

                    if( this._additionForm.value.taxes[ cur ] !== undefined ){
                        _lAdditionRestaurant.additionTax = this._additionForm.value.taxes[ cur ];
                    }

                    _lAdditionRestaurantsToInsert.push( _lAdditionRestaurant );
                }
            }
            if( cur !== null && this._additionForm.value.currencies[ cur ] !== null ){
                let _lAdditionPrice: AdditionPrice = { currencyId: '', price: 0 };
                _lAdditionPrice.currencyId = cur;
                _lAdditionPrice.price = this._additionForm.value.currencies[ cur ];
                if( this._additionForm.value.taxes[ cur ] !== undefined ){
                    _lAdditionPrice.additionTax = this._additionForm.value.taxes[ cur ];
                }
                _lAdditionPricesToInsert.push( _lAdditionPrice );
            }
        });

        Additions.insert({
            creation_user: this._user,
            creation_date: new Date(),
            modification_user: '-',
            modification_date: new Date(),
            is_active: true,
            name: this._additionForm.value.name,
            restaurants: _lAdditionRestaurantsToInsert,
            prices: _lAdditionPricesToInsert
        });
        this.cancel();
    }

    /**
     * Function to update Addition status
     * @param {Addition} _addition 
     */
    updateStatus( _addition:Addition ):void{
        Additions.update( _addition._id, {
            $set: {
                is_active: !_addition.is_active,
                modification_date: new Date(),
                modification_user: this._user
            }
        });
    }

    /**
     * Function to cancel add Addition
     */
    cancel():void{
        this._additionForm.reset();    
        this._showCurrencies = false; 
        this._restaurantCurrencies = [];
        this._restaurantsFormGroup.reset();
        this._currenciesFormGroup.reset();
        this._taxesFormGroup.reset();
        this._showTaxes = false;
        this._restaurantTaxes = [];
    }

    /**
     * When user wants edit Addition, this function open dialog with Addition information
     * @param {Addition} _addition
     */
    open( _addition: Addition ){
        this._dialogRef = this._dialog.open( AdditionEditComponent, {
            disableClose : true,
            width: '80%'
        });
        this._dialogRef.componentInstance._additionToEdit = _addition;
        this._dialogRef.afterClosed().subscribe( result => {
            this._dialogRef = null;
        });
    }

    /**
     * This function allow create addition price with diferent currencies
     * @param {string} _pRestaurantName 
     * @param {any} _pEvent 
     */
    onCheckRestaurant( _pRestaurantName: string, _pEvent:any ):void{
        let _lRestaurant: Restaurant = this._restaurantList.filter( r => r.name === _pRestaurantName )[0];
        if( _pEvent.checked ){
            let _lCountry: Country = Countries.findOne( { _id: _lRestaurant.countryId } );
            if( this._restaurantCurrencies.indexOf( _lRestaurant.currencyId ) <= -1 ){
                let _lCurrency: Currency = Currencies.findOne( { _id: _lRestaurant.currencyId } );
                let _initValue: string = '';
                if( _lCurrency.decimal !== 0 ){
                    for( let i = 0; i < ( _lCurrency.decimal ).toString().slice( ( _lCurrency.decimal.toString().indexOf( '.' ) ), ( _lCurrency.decimal.toString().length ) ).length - 1; i++ ){
                        _initValue += '0';
                    }
                    _initValue = '0.' + _initValue;
                }
                let control: FormControl = new FormControl( _initValue, [ Validators.required ] );
                this._currenciesFormGroup.addControl( _lRestaurant.currencyId, control );
                this._restaurantCurrencies.push( _lRestaurant.currencyId );

                if( _lCountry.itemsWithDifferentTax === true ){
                    let control: FormControl = new FormControl( '0', [ Validators.required ] );
                    this._taxesFormGroup.addControl( _lRestaurant.currencyId, control );
                    this._restaurantTaxes.push( _lRestaurant.currencyId );
                }
            }
        } else {
            let _aux:number = 0;
            let _auxTax:number = 0;
            let arr:any[] = Object.keys( this._additionForm.value.restaurants );
             arr.forEach( ( rest ) => {
                if( this._additionForm.value.restaurants[ rest ] ){
                    let _lRes: Restaurant = this._restaurantList.filter( r => r.name === rest )[0];
                    if( _lRestaurant.currencyId === _lRes.currencyId ){
                        _aux ++;             
                    }
                    let _lCountry: Country = Countries.findOne( { _id: _lRes.countryId } );
                    if( _lCountry.itemsWithDifferentTax === true ){
                        _auxTax ++;
                    }
                }            
            });

            if( _aux === 0 ){ this._restaurantCurrencies.splice( this._restaurantCurrencies.indexOf( _lRestaurant.currencyId ), 1 ); }
            if( _auxTax === 0 ){ this._restaurantTaxes.splice( this._restaurantTaxes.indexOf( _lRestaurant.currencyId ), 1 ); }
        }
        this._restaurantCurrencies.length > 0 ? this._showCurrencies = true : this._showCurrencies = false;
        this._restaurantTaxes.length > 0 ? this._showTaxes = true : this._showTaxes = false;
    }

    /**
     * Function to show Addition Prices
     * @param {AdditionPrice[]} _pAdditionPrices
     */
    showAdditionPrices( _pAdditionPrices:AdditionPrice[] ):string{
        let _lPrices: string = '';
        _pAdditionPrices.forEach( ( ap ) => {
            let _lCurrency: Currency = Currencies.findOne( { _id: ap.currencyId } );
            if( _lCurrency ){
                let price: string = ap.price + ' ' + _lCurrency.code + ' / '
                _lPrices += price;
            }
        });
        return _lPrices;
    }

    /**
     * Function to show Addition Taxes
     * @param {AdditionPrice[]} _pAdditionPrices
     */
    showAdditionTaxes( _pAdditionPrices:AdditionPrice[] ):string{
        let _lTaxes: string = '';
        _pAdditionPrices.forEach( ( ap ) => {
            if( ap.additionTax ){
                let _lCurrency: Currency = Currencies.findOne( { _id: ap.currencyId } );
                if( _lCurrency ){
                    let tax: string = ap.additionTax + ' ' + _lCurrency.code + ' / '
                    _lTaxes += tax;
                }
            }
        });
        return _lTaxes;
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._additionsSub.unsubscribe();
        this._restaurantSub.unsubscribe();
        this._currenciesSub.unsubscribe();
        this._countriesSub.unsubscribe();
    }
}