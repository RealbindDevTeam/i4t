import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { GarnishFoodCol } from '../../../../../../../both/collections/administration/garnish-food.collection';
import { GarnishFood, GarnishFoodRestaurant, GarnishFoodPrice } from '../../../../../../../both/models/administration/garnish-food.model';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { Currency } from '../../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../../both/collections/general/currency.collection';
import { Country } from '../../../../../../../both/models/settings/country.model';
import { Countries } from '../../../../../../../both/collections/settings/country.collection';

import template from './garnish-food-edit.component.html';
import style from './garnish-food-edit.component.scss';

@Component({
    selector: 'garnishFood-edit',
    template,
    styles: [ style ]
})
export class GarnishFoodEditComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    public _garnishFoodToEdit: GarnishFood;
    private _editForm: FormGroup;
    private _restaurantsFormGroup: FormGroup = new FormGroup({});
    private _currenciesFormGroup: FormGroup = new FormGroup({});
    private _taxesFormGroup: FormGroup = new FormGroup({});

    private _garnishFoodCol: Observable<GarnishFood[]>;
    private _restaurants: Observable<Restaurant[]>;
    private _currencies: Observable<Currency[]>;

    private _garnishFoodSub: Subscription;
    private _restaurantSub: Subscription;
    private _currenciesSub: Subscription;
    private _countriesSub: Subscription;

    private _restaurantsList: Restaurant[];
    private _garnishFoodRestaurants:GarnishFoodRestaurant[];
    private _restaurantCreation: Restaurant[];
    private _edition_restaurants: string[];
    private _garnishFoodPrices: GarnishFoodPrice[];

    private _restaurantCurrencies: string [] = [];
    private _showCurrencies: boolean = false;
    private _restaurantTaxes: string [] = [];
    private _showTaxes: boolean = false;

    /**
     * GarnishFoodEditComponent constructor
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor( private _formBuilder: FormBuilder, private _translate: TranslateService, public _dialogRef: MdDialogRef<any>, private _ngZone: NgZone ){
        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( userLang );
        this._edition_restaurants = [];
        this._restaurantsList = [];
        this._garnishFoodRestaurants = [];
        this._restaurantCreation = [];
        this._garnishFoodPrices = [];
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        let _lRestaurantsId: string[] = [];
        this._editForm = this._formBuilder.group({
            editId: [ this._garnishFoodToEdit._id ],
            editName: [ this._garnishFoodToEdit.name, Validators.required ],
            editIsActive: [ this._garnishFoodToEdit.is_active ],
            editRestaurants: this._restaurantsFormGroup,
            editCurrencies: this._currenciesFormGroup,
            editTaxes: this._taxesFormGroup
        });
        this._garnishFoodRestaurants = this._garnishFoodToEdit.restaurants;

        if( this._garnishFoodToEdit.prices.length > 0 ){
            this._showCurrencies = true;
            this._garnishFoodToEdit.prices.forEach( (p) => {
                let control: FormControl = new FormControl( p.price, [ Validators.required ] );
                this._currenciesFormGroup.addControl( p.currencyId, control );
                this._restaurantCurrencies.push( p.currencyId );

                if( p.garnishFoodTax !== undefined ){
                    this._showTaxes = true;
                    let controlTax: FormControl = new FormControl( p.garnishFoodTax, [ Validators.required ] );
                    this._taxesFormGroup.addControl( p.currencyId, controlTax );
                    this._restaurantTaxes.push( p.currencyId );
                }
            });
        }

        this._garnishFoodCol = GarnishFoodCol.find( { } ).zone();
        this._garnishFoodSub = MeteorObservable.subscribe( 'garnishFood', this._user ).subscribe();
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { } ).zone();
                this._restaurantCreation = Restaurants.collection.find( { } ).fetch();
                for( let rest of this._restaurantCreation ){
                    _lRestaurantsId.push( rest._id );
                    let restaurant:Restaurant = rest;   
                    let find = this._garnishFoodRestaurants.filter( r => r.restaurantId === restaurant._id );

                    if( find.length > 0 ){
                        let control: FormControl = new FormControl( true );                                          
                        this._restaurantsFormGroup.addControl( restaurant.name, control );  
                        this._restaurantsList.push( restaurant );
                    } else {
                        let control: FormControl = new FormControl( false );                                          
                        this._restaurantsFormGroup.addControl( restaurant.name, control );  
                        this._restaurantsList.push( restaurant );
                    }       
                }
                this._countriesSub = MeteorObservable.subscribe( 'getCountriesByRestaurantsId', _lRestaurantsId ).subscribe();
                this._currenciesSub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', _lRestaurantsId ).subscribe();
                this._currencies = Currencies.find( { } ).zone();
            });
        } );
    }

    /**
     * Function to edit Garnish Food
     */
    editGarnishFood():void{
        if( !Meteor.userId() ){
            alert('Please log in to add a restaurant');
            return;
        }

        if( this._editForm.valid ){
            let arrCur:any[] = Object.keys( this._editForm.value.editCurrencies );
            let _lGarnishFoodRestaurantsToInsert: GarnishFoodRestaurant[] = [];
            let _lGarnishFoodPricesToInsert: GarnishFoodPrice[] = [];

            arrCur.forEach( ( cur ) => {
                let find: Restaurant[] = this._restaurantsList.filter( r => r.currencyId === cur );
                for( let res of find ){
                    if( this._editForm.value.editRestaurants[ res.name ] ){
                        let _lGarnishFoodRestaurant: GarnishFoodRestaurant = { restaurantId: '', price: 0 };
                        let restau:Restaurant = Restaurants.findOne( { name: res.name } );
                        
                        _lGarnishFoodRestaurant.restaurantId = restau._id;
                        _lGarnishFoodRestaurant.price = this._editForm.value.editCurrencies[ cur ];
                        
                        if( this._editForm.value.editTaxes[ cur ] !== undefined ){
                            _lGarnishFoodRestaurant.garnishFoodTax = this._editForm.value.editTaxes[ cur ];
                        }

                        _lGarnishFoodRestaurantsToInsert.push( _lGarnishFoodRestaurant );
                    }
                }
                let _lGarnishFoodPrice: GarnishFoodPrice = { currencyId: '', price: 0 };
                _lGarnishFoodPrice.currencyId = cur;
                _lGarnishFoodPrice.price = this._editForm.value.editCurrencies[ cur ];
                if( this._editForm.value.editTaxes[ cur ] !== undefined ){
                    _lGarnishFoodPrice.garnishFoodTax = this._editForm.value.editTaxes[ cur ];
                }
                _lGarnishFoodPricesToInsert.push( _lGarnishFoodPrice );
            });

            GarnishFoodCol.update( this._editForm.value.editId,{
                $set: {
                    modification_user: this._user,
                    modification_date: new Date(),
                    name: this._editForm.value.editName,
                    is_active: this._editForm.value.editIsActive,
                    restaurants: _lGarnishFoodRestaurantsToInsert,
                    prices: _lGarnishFoodPricesToInsert
                }
            });
            this._dialogRef.close();
        }
    }

    /**
     * This function allow create garnish food price with diferent currencies
     * @param {string} _pRestaurantName 
     * @param {any} _pEvent 
     */
    onCheckRestaurant( _pRestaurantName: string, _pEvent:any ):void{
        let _lRestaurant: Restaurant = this._restaurantsList.filter( r => r.name === _pRestaurantName )[0];
        if( _pEvent.checked ){
            let _lCountry: Country = Countries.findOne( { _id: _lRestaurant.countryId } );
            if( this._restaurantCurrencies.indexOf( _lRestaurant.currencyId ) <= -1 ){
                let _lCurrency: Currency = Currencies.findOne( { _id: _lRestaurant.currencyId } );
                let _initValue: string = '';
                if( _lCurrency.decimal !== 0 ){
                    for( let i = 0; i < ( _lCurrency.decimal ).toString().slice( ( _lCurrency.decimal.toString().indexOf( '.' ) ), ( _lCurrency.decimal.toString().length ) ).length - 1; i++ ){
                        _initValue += '0';
                    }
                    _initValue = '.' + _initValue;
                }
                if( this._currenciesFormGroup.contains( _lRestaurant.currencyId ) ){
                    this._currenciesFormGroup.controls[ _lRestaurant.currencyId ].setValue( _initValue );
                } else {
                    let control: FormControl = new FormControl( _initValue, [ Validators.required ] );
                    this._currenciesFormGroup.addControl( _lRestaurant.currencyId, control );
                }
                this._restaurantCurrencies.push( _lRestaurant.currencyId );
                if( _lCountry.itemsWithDifferentTax === true ){
                    if( this._taxesFormGroup.contains( _lRestaurant.currencyId ) ){
                        this._taxesFormGroup.controls[ _lRestaurant.currencyId ].setValue( '' );
                    } else {
                        let control: FormControl = new FormControl( '', [ Validators.required ] );
                        this._taxesFormGroup.addControl( _lRestaurant.currencyId, control );
                    }
                    this._restaurantTaxes.push( _lRestaurant.currencyId );
                }
            }
        } else {
            let _aux:number = 0;
            let _auxTax:number = 0;
            let arr:any[] = Object.keys( this._editForm.value.editRestaurants );
             arr.forEach( ( rest ) => {
                if( this._editForm.value.editRestaurants[ rest ] ){
                    let _lRes: Restaurant = this._restaurantsList.filter( r => r.name === rest )[0];
                    if( _lRestaurant.currencyId === _lRes.currencyId ){
                        _aux ++;             
                    }
                    let _lCountry: Country = Countries.findOne( { _id: _lRes.countryId } );
                    if( _lCountry.itemsWithDifferentTax === true ){
                        _auxTax ++;
                    }
                }            
            });
            if( _aux === 0 ){
                this._restaurantCurrencies.splice( this._restaurantCurrencies.indexOf( _lRestaurant.currencyId ), 1 );
                if( this._currenciesFormGroup.contains( _lRestaurant.currencyId ) ){
                    this._currenciesFormGroup.removeControl( _lRestaurant.currencyId );
                }
            }
            if( _auxTax === 0 ){
                this._restaurantTaxes.splice( this._restaurantTaxes.indexOf( _lRestaurant.currencyId ), 1 );
                if( this._taxesFormGroup.contains( _lRestaurant.currencyId ) ){
                    this._taxesFormGroup.removeControl( _lRestaurant.currencyId );
                }
            }
        }

        this._restaurantCurrencies.length > 0 ? this._showCurrencies = true : this._showCurrencies = false;
        this._restaurantTaxes.length > 0 ? this._showTaxes = true : this._showTaxes = false;
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._garnishFoodSub.unsubscribe();
        this._restaurantSub.unsubscribe();
        this._currenciesSub.unsubscribe();
        this._countriesSub.unsubscribe();
    }
}