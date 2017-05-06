import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { Additions } from '../../../../../../../both/collections/administration/addition.collection';
import { Addition, AdditionRestaurant, AdditionPrice } from '../../../../../../../both/models/administration/addition.model';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { Currency } from '../../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../../both/collections/general/currency.collection';
import { Country } from '../../../../../../../both/models/settings/country.model';
import { Countries } from '../../../../../../../both/collections/settings/country.collection';

import template from './addition-edit.component.html';
import style from './addition-edit.component.scss';

@Component({
    selector: 'addition-edit',
    template,
    styles: [ style ]
})
export class AdditionEditComponent implements OnInit, OnDestroy {
    
    private _user = Meteor.userId();
    public _additionToEdit: Addition;
    private _editForm: FormGroup;
    private _restaurantsFormGroup: FormGroup = new FormGroup({});
    private _currenciesFormGroup: FormGroup = new FormGroup({});    
    private _taxesFormGroup: FormGroup = new FormGroup({});

    private _additions: Observable<Addition[]>;
    private _restaurants: Observable<Restaurant[]>;
    private _currencies: Observable<Currency[]>;

    private _additionSub: Subscription;
    private _restaurantSub: Subscription;
    private _currenciesSub: Subscription;
    private _countriesSub: Subscription;

    private _restaurantsList: Restaurant[];
    private _additionRestaurants:AdditionRestaurant[];
    private _restaurantCreation: Restaurant[];
    private _edition_restaurants: string[];
    private _additionPrices: AdditionPrice[];

    private _restaurantCurrencies: string [] = [];
    private _showCurrencies: boolean = false;
    private _restaurantTaxes: string [] = [];
    private _showTaxes: boolean = false;

    /**
     * AdditionEditComponent constructor
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} translate
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor( private _formBuilder: FormBuilder, private _translate: TranslateService, public _dialogRef: MdDialogRef<any>, private _ngZone: NgZone ){
        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(userLang);  
        this._edition_restaurants = [];
        this._restaurantsList = [];
        this._additionRestaurants = [];
        this._restaurantCreation = [];
        this._additionPrices = [];
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        let _lRestaurantsId: string[] = [];
        this._editForm = this._formBuilder.group({
            editId: [ this._additionToEdit._id ],
            editName: [ this._additionToEdit.name, Validators.required ],
            editIsActive: [ this._additionToEdit.is_active ],
            editRestaurants: this._restaurantsFormGroup,
            editCurrencies: this._currenciesFormGroup,
            editTaxes: this._taxesFormGroup
        });
        this._additionRestaurants = this._additionToEdit.restaurants;

        if( this._additionToEdit.prices.length > 0 ){
            this._showCurrencies = true;
            this._additionToEdit.prices.forEach( (p) => {
                let control: FormControl = new FormControl( p.price, [ Validators.required ] );
                this._currenciesFormGroup.addControl( p.currencyId, control );
                this._restaurantCurrencies.push( p.currencyId );

                if( p.additionTax !== undefined ){
                    this._showTaxes = true;
                    let controlTax: FormControl = new FormControl( p.additionTax, [ Validators.required ] );
                    this._taxesFormGroup.addControl( p.currencyId, controlTax );
                    this._restaurantTaxes.push( p.currencyId );
                }
            });
        }

        this._additions = Additions.find( { } ).zone();
        this._additionSub = MeteorObservable.subscribe( 'additions', this._user ).subscribe();
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { } ).zone();
                this._restaurantCreation = Restaurants.collection.find().fetch();
                for( let rest of this._restaurantCreation ){ 
                    _lRestaurantsId.push( rest._id );
                    let restaurant:Restaurant = rest;    
                    let find = this._additionRestaurants.filter( r => r.restaurantId === restaurant._id );

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
        });
    }

    /**
     * Function to edit Addition
     */
    editAddition():void{
        if( !Meteor.userId() ){
            alert('Please log in to add a restaurant');
            return;
        }

        if( this._editForm.valid ){
            let arrCur:any[] = Object.keys( this._editForm.value.editCurrencies );
            let _lAdditionRestaurantsToInsert: AdditionRestaurant[] = [];
            let _lAdditionPricesToInsert: AdditionPrice[] = [];

            arrCur.forEach( ( cur ) => {
                let find: Restaurant[] = this._restaurantsList.filter( r => r.currencyId === cur );
                for( let res of find ){
                    if( this._editForm.value.editRestaurants[ res.name ] ){
                        let _lAdditionRestaurant: AdditionRestaurant = { restaurantId: '', price: 0 };
                        let restau:Restaurant = Restaurants.findOne( { name: res.name } );

                        _lAdditionRestaurant.restaurantId = restau._id;
                        _lAdditionRestaurant.price = this._editForm.value.editCurrencies[ cur ];

                        if( this._editForm.value.editTaxes[ cur ] !== undefined ){
                            _lAdditionRestaurant.additionTax = this._editForm.value.editTaxes[ cur ];
                        }

                        _lAdditionRestaurantsToInsert.push( _lAdditionRestaurant );
                    }
                }
                let _lAdditionPrice: AdditionPrice = { currencyId: '', price: 0 };
                _lAdditionPrice.currencyId = cur;
                _lAdditionPrice.price = this._editForm.value.editCurrencies[ cur ];
                if( this._editForm.value.editTaxes[ cur ] !== undefined ){
                    _lAdditionPrice.additionTax = this._editForm.value.editTaxes[ cur ];
                }
                _lAdditionPricesToInsert.push( _lAdditionPrice );
            });

            Additions.update( this._editForm.value.editId,{
                $set: {
                    modification_user: this._user,
                    modification_date: new Date(),
                    name: this._editForm.value.editName,
                    is_active: this._editForm.value.editIsActive,
                    restaurants: _lAdditionRestaurantsToInsert,
                    prices: _lAdditionPricesToInsert
                }
            });
            this._dialogRef.close();          
        }
    }

    /**
     * This function allow create addition price with diferent currencies
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
        this._additionSub.unsubscribe();
        this._restaurantSub.unsubscribe();
        this._currenciesSub.unsubscribe();
        this._countriesSub.unsubscribe();
    }
}