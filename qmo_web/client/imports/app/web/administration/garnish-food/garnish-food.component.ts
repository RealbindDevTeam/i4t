import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Meteor } from 'meteor/meteor';
import { GarnishFoodCol } from '../../../../../../both/collections/administration/garnish-food.collection';
import { GarnishFood, GarnishFoodPrice, GarnishFoodRestaurant } from '../../../../../../both/models/administration/garnish-food.model';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Currency } from '../../../../../../both/models/general/currency.model';
import { Currencies } from '../../../../../../both/collections/general/currency.collection';
import { GarnishFoodEditComponent } from './garnish-food-edit/garnish-food-edit.component';

import template from './garnish-food.component.html';
import style from './garnish-food.component.scss';

@Component({
    selector:'garnish-food',
    template,
    styles: [ style ]
})
export class GarnishFoodComponent implements OnInit, OnDestroy {

    private _garnishFoodForm: FormGroup;
    private _restaurantsFormGroup: FormGroup = new FormGroup({});
    private _currenciesFormGroup: FormGroup = new FormGroup({});

    private _garnishFoodCol: Observable<GarnishFood[]>;
    private _restaurantList: Observable<Restaurant[]>;
    private _currencies: Observable<Currency[]>;

    private _garnishFoodSub: Subscription;    
    private _restaurantsSub: Subscription;
    private _currenciesSub: Subscription;

    private _restaurants: Restaurant[];            
    public _dialogRef: MdDialogRef<any>;    
    private _showRestaurants: boolean = true;
    private _restaurantCurrencies: string[] = [];
    private _showCurrencies: boolean = false;

    /**
     * GarnishFoodComponent constructor
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {MdDialog} _dialog
     * @param {NgZone} _ngZone
     */
    constructor( private _formBuilder: FormBuilder, private _translate: TranslateService, public _dialog: MdDialog, private _ngZone: NgZone ){
        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(userLang);
        this._restaurants = [];
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._garnishFoodForm = new FormGroup({
            name: new FormControl( '', [ Validators.required, Validators.minLength(1), Validators.maxLength(50) ] ),
            restaurants: this._restaurantsFormGroup,
            currencies: this._currenciesFormGroup
        });

        this._restaurantsSub = MeteorObservable.subscribe( 'restaurants', Meteor.userId() ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurantList = Restaurants.find( { } ).zone();
                this._restaurants = Restaurants.collection.find( { } ).fetch();
                for ( let res of this._restaurants ) {
                    let control: FormControl = new FormControl( false );
                    this._restaurantsFormGroup.addControl( res.name, control );
                }
                if( this._restaurants.length === 0){
                    this._showRestaurants = false;
                }
            });
        });

        this._garnishFoodCol = GarnishFoodCol.find( { } ).zone();
        this._garnishFoodSub = MeteorObservable.subscribe( 'garnishFood', Meteor.userId() ).subscribe();
        this._currenciesSub = MeteorObservable.subscribe( 'currencies' ).subscribe();
        this._currencies = Currencies.find( { } ).zone();
    }

    /**
     * Function to add Garnish Food
     */
    addGarnishFood():void{
        if( !Meteor.userId() ){
            alert( 'Please log in to add a restaurant' );
            return;
        }

        if( this._garnishFoodForm.valid ){
            let arrCur:any[] = Object.keys( this._garnishFoodForm.value.currencies );
            let _lGarnishFoodRestaurantsToInsert: GarnishFoodRestaurant[] = [];
            let _lGarnishFoodPricesToInsert: GarnishFoodPrice[] = [];

            arrCur.forEach( ( cur ) => {
                let find: Restaurant[] = this._restaurants.filter( r => r.currencyId === cur );
                for( let res of find ){
                    if( this._garnishFoodForm.value.restaurants[ res.name ] ){
                        let _lGarnishFoodRestaurant: GarnishFoodRestaurant = { restaurantId: '', price: 0 };
                        let restau:Restaurant = Restaurants.findOne( { name: res.name } );
                        _lGarnishFoodRestaurant.restaurantId = restau._id;
                        _lGarnishFoodRestaurant.price = this._garnishFoodForm.value.currencies[ cur ];
                        _lGarnishFoodRestaurantsToInsert.push( _lGarnishFoodRestaurant );
                    }
                }
                let _lGarnishFoodPrice: GarnishFoodPrice = { currencyId: '', price: 0 };
                _lGarnishFoodPrice.currencyId = cur;
                _lGarnishFoodPrice.price = this._garnishFoodForm.value.currencies[ cur ];
                _lGarnishFoodPricesToInsert.push( _lGarnishFoodPrice );
            });

            GarnishFoodCol.insert({
                creation_user: Meteor.userId(),
                creation_date: new Date(),
                modification_user: '-',
                modification_date: new Date(),
                is_active: true,
                name: this._garnishFoodForm.value.name,
                restaurants: _lGarnishFoodRestaurantsToInsert,
                prices: _lGarnishFoodPricesToInsert
            });
        }
        this.cancel();
    }

    /**
     * Function to update Garnish Food status
     * @param {GarnishFood} _garnishFood
     */
    updateStatus( _garnishFood: GarnishFood ):void {
        GarnishFoodCol.update( _garnishFood._id, {
            $set: {
                is_active: !_garnishFood.is_active,
                modification_date: new Date(),
                modification_user: Meteor.userId()
            }
        });
    }

    /**
     * Function to cancel add Garnish Food
     */
    cancel():void{
        this._garnishFoodForm.reset();
        this._showCurrencies = false;
        this._restaurantCurrencies = [];
        this._restaurantsFormGroup.reset();
        this._currenciesFormGroup.reset();
    }

    /**
     * When user wants edit Garnish Food, this function open dialog with Garnish Food information
     * @param {GarnishFood} _garnishFood
     */
    open( _garnishFood: GarnishFood ){
        this._dialogRef = this._dialog.open( GarnishFoodEditComponent, {
            disableClose : true,
            width: '80%'
        } );
        this._dialogRef.componentInstance._garnishFoodToEdit = _garnishFood;
        this._dialogRef.afterClosed().subscribe( result => {
            this._dialogRef = null;
        });
    }

    /**
     * This function allow create garnish food price with diferent currencies
     * @param {string} _pRestaurantName 
     * @param {any} _pEvent 
     */
    onCheckRestaurant( _pRestaurantName: string, _pEvent:any ):void{
        let _lRestaurant: Restaurant = this._restaurants.filter( r => r.name === _pRestaurantName )[0];
        if( _pEvent.checked ){
            if( this._restaurantCurrencies.indexOf( _lRestaurant.currencyId ) <= -1 ){
                let _lCurrency: Currency = Currencies.findOne( { _id: _lRestaurant.currencyId } );
                let _initValue: string = '';
                if( _lCurrency.decimal !== 0 ){
                    for( let i = 0; i < ( _lCurrency.decimal ).toString().slice( ( _lCurrency.decimal.toString().indexOf( '.' ) ), ( _lCurrency.decimal.toString().length ) ).length - 1; i++ ){
                        _initValue += '0';
                    }
                    _initValue = '.' + _initValue;
                }
                let control: FormControl = new FormControl( _initValue, [ Validators.required ] );
                this._currenciesFormGroup.addControl( _lRestaurant.currencyId, control );
                this._restaurantCurrencies.push( _lRestaurant.currencyId );
            }
        } else {
            let _aux:number = 0;
            let arr:any[] = Object.keys( this._garnishFoodForm.value.restaurants );
             arr.forEach( ( rest ) => {
                if( this._garnishFoodForm.value.restaurants[ rest ] ){
                    let _lRes: Restaurant = this._restaurants.filter( r => r.name === rest )[0];
                    if( _lRestaurant.currencyId === _lRes.currencyId ){
                        _aux ++;             
                    }
                }            
            });
            if( _aux === 0 ){
                this._restaurantCurrencies.splice( this._restaurantCurrencies.indexOf( _lRestaurant.currencyId ), 1 );
            }
        }

        if( this._restaurantCurrencies.length > 0 ){
            this._showCurrencies = true;            
        } else {
            this._showCurrencies = false;            
        }
    }

    /**
     * Function to show Garnish Food Prices
     * @param {GarnishFoodPrice[]} _pGarnishFoodPrices
     */
    showGarnishFoodPrices( _pGarnishFoodPrices:GarnishFoodPrice[] ):string{
        let _lPrices: string = '';
        _pGarnishFoodPrices.forEach( ( g ) => {
            let _lCurrency: Currency = Currencies.findOne( { _id: g.currencyId } );
            if( _lCurrency ){
                let price: string = g.price + ' ' + _lCurrency.code + ' / '
                _lPrices += price;
            }
        });
        return _lPrices;
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._garnishFoodSub.unsubscribe();
        this._restaurantsSub.unsubscribe();
        this._currenciesSub.unsubscribe();
    }
}