import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { MdSnackBar } from '@angular/material';
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
    public _garnishFoodToEdit       : GarnishFood;
    private _editForm               : FormGroup;
    private _currenciesFormGroup    : FormGroup = new FormGroup({});
    private _taxesFormGroup         : FormGroup = new FormGroup({});

    private _garnishFoodCol         : Observable<GarnishFood[]>;
    private _currencies             : Observable<Currency[]>;

    private _garnishFoodSub         : Subscription;
    private _restaurantSub          : Subscription;
    private _currenciesSub          : Subscription;
    private _countriesSub           : Subscription;

    private _restaurantsList        : Restaurant[];
    private _restaurantCurrencies   : string [] = [];
    private _showCurrencies         : boolean = false;
    private _restaurantTaxes        : string [] = [];
    private _showTaxes              : boolean = false;

    /**
     * GarnishFoodEditComponent constructor
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {MdDialogRef<any>} _dialogRef
     */
    constructor( private _formBuilder: FormBuilder, 
                 private _translate: TranslateService, 
                 public _dialogRef: MdDialogRef<any>, 
                 private _ngZone: NgZone, 
                 public snackBar: MdSnackBar ){
        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( userLang );
        this._restaurantsList = [];
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
            editCurrencies: this._currenciesFormGroup,
            editTaxes: this._taxesFormGroup
        });

        this._garnishFoodCol = GarnishFoodCol.find( { } ).zone();
        this._garnishFoodSub = MeteorObservable.subscribe( 'garnishFood', this._user ).subscribe();
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurantsList = Restaurants.collection.find({}).fetch();
                Restaurants.collection.find({}).fetch().forEach( ( res ) =>{
                    _lRestaurantsId.push( res._id );
                });
                this._countriesSub = MeteorObservable.subscribe( 'getCountriesByRestaurantsId', _lRestaurantsId ).subscribe();
                this._currenciesSub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', _lRestaurantsId ).subscribe( () => {
                    this._ngZone.run( () => {
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
                        Restaurants.collection.find({}).fetch().forEach( ( restaurant ) => {
                            let _lCountry: Country = Countries.findOne( { _id: restaurant.countryId } );
                            if( this._restaurantCurrencies.indexOf( restaurant.currencyId ) <= -1 ){
                                let _lCurrency: Currency = Currencies.findOne( { _id: restaurant.currencyId } );
                                let _initValue: string = '';
                                if( _lCurrency.decimal !== 0 ){
                                    for( let i = 0; i < ( _lCurrency.decimal ).toString().slice( ( _lCurrency.decimal.toString().indexOf( '.' ) ), ( _lCurrency.decimal.toString().length ) ).length - 1; i++ ){
                                        _initValue += '0';
                                    }
                                    _initValue = '.' + _initValue;
                                } else {
                                    _initValue = '0';
                                }
                                if( this._currenciesFormGroup.contains( restaurant.currencyId ) ){
                                    this._currenciesFormGroup.controls[ restaurant.currencyId ].setValue( _initValue );
                                } else {
                                    let control: FormControl = new FormControl( _initValue, [ Validators.required ] );
                                    this._currenciesFormGroup.addControl( restaurant.currencyId, control );
                                }
                                this._restaurantCurrencies.push( restaurant.currencyId );
                                if( _lCountry.itemsWithDifferentTax === true ){
                                    if( this._taxesFormGroup.contains( restaurant.currencyId ) ){
                                        this._taxesFormGroup.controls[ restaurant.currencyId ].setValue( '' );
                                    } else {
                                        let control: FormControl = new FormControl( '', [ Validators.required ] );
                                        this._taxesFormGroup.addControl( restaurant.currencyId, control );
                                    }
                                    this._restaurantTaxes.push( restaurant.currencyId );
                                }
                            }
                        });
                        this._restaurantCurrencies.length > 0 ? this._showCurrencies = true : this._showCurrencies = false;
                        this._restaurantTaxes.length > 0 ? this._showTaxes = true : this._showTaxes = false;
                        this._currencies = Currencies.find( { } ).zone();
                    });
                });
            });
        });
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
                    let _lGarnishFoodRestaurant: GarnishFoodRestaurant = { restaurantId: '', price: 0 };
                    let restau:Restaurant = Restaurants.findOne( { name: res.name } );
                    
                    _lGarnishFoodRestaurant.restaurantId = restau._id;
                    _lGarnishFoodRestaurant.price = this._editForm.value.editCurrencies[ cur ];
                    
                    if( this._editForm.value.editTaxes[ cur ] !== undefined ){
                        _lGarnishFoodRestaurant.garnishFoodTax = this._editForm.value.editTaxes[ cur ];
                    }

                    _lGarnishFoodRestaurantsToInsert.push( _lGarnishFoodRestaurant );
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

            let _lMessage:string = this.itemNameTraduction( 'GARNISHFOOD.GARNISH_FOOD_EDITED' );
            this.snackBar.open( _lMessage, '',{
                duration: 2500
            });

            this._dialogRef.close();
        }
    }

    /**
     * Return traduction
     * @param {string} itemName 
     */
    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
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