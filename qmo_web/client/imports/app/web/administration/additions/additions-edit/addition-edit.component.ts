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
    private _currenciesFormGroup: FormGroup = new FormGroup({});    
    private _taxesFormGroup: FormGroup = new FormGroup({});

    private _additions: Observable<Addition[]>;
    private _currencies: Observable<Currency[]>;

    private _additionSub: Subscription;
    private _restaurantSub: Subscription;
    private _currenciesSub: Subscription;
    private _countriesSub: Subscription;

    private _restaurantsList: Restaurant[];
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
            editCurrencies: this._currenciesFormGroup,
            editTaxes: this._taxesFormGroup
        });

        this._additions = Additions.find( { } ).zone();
        this._additionSub = MeteorObservable.subscribe( 'additions', this._user ).subscribe();
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurantsList = Restaurants.collection.find({}).fetch();
                Restaurants.collection.find({}).fetch().forEach( ( res ) =>{
                    _lRestaurantsId.push( res._id );
                });
                this._countriesSub = MeteorObservable.subscribe( 'getCountriesByRestaurantsId', _lRestaurantsId ).subscribe();
                this._currenciesSub = MeteorObservable.subscribe( 'getCurrenciesByRestaurantsId', _lRestaurantsId ).subscribe( () => {
                    this._ngZone.run( () => {
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

                        Restaurants.collection.find({}).fetch().forEach( ( restaurant ) => {
                            let _lCountry: Country = Countries.findOne( { _id: restaurant.countryId } );
                            if( this._restaurantCurrencies.indexOf( restaurant.currencyId ) <= -1 ){
                                let _lCurrency: Currency = Currencies.findOne( { _id: restaurant.currencyId } );
                                let _initValue: string = '';
                                if( _lCurrency.decimal !== 0 ){
                                    for( let i = 0; i < ( _lCurrency.decimal ).toString().slice( ( _lCurrency.decimal.toString().indexOf( '.' ) ), ( _lCurrency.decimal.toString().length ) ).length - 1; i++ ){
                                        _initValue += '0';
                                    }
                                    _initValue = '0.' + _initValue;
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
                                        let control: FormControl = new FormControl( '0', [ Validators.required ] );
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
                    let _lAdditionRestaurant: AdditionRestaurant = { restaurantId: '', price: 0 };
                    let restau:Restaurant = Restaurants.findOne( { name: res.name } );

                    _lAdditionRestaurant.restaurantId = restau._id;
                    _lAdditionRestaurant.price = this._editForm.value.editCurrencies[ cur ];

                    if( this._editForm.value.editTaxes[ cur ] !== undefined ){
                        _lAdditionRestaurant.additionTax = this._editForm.value.editTaxes[ cur ];
                    }

                    _lAdditionRestaurantsToInsert.push( _lAdditionRestaurant );
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
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._additionSub.unsubscribe();
        this._restaurantSub.unsubscribe();
        this._currenciesSub.unsubscribe();
        this._countriesSub.unsubscribe();
    }
}