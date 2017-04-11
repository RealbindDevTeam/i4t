import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { GarnishFoodCol } from '../../../../../../both/collections/administration/garnish-food.collection';
import { GarnishFood } from '../../../../../../both/models/administration/garnish-food.model';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Meteor } from 'meteor/meteor';
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

    private _garnishFoodCol: Observable<GarnishFood[]>;
    private _restaurantList: Observable<Restaurant[]>;

    private _garnishFoodSub: Subscription;    
    private _restaurantsSub: Subscription;

    private _restaurants: Restaurant[];            
    public _dialogRef: MdDialogRef<any>;    
    private _showRestaurants: boolean = true;

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
            description: new FormControl( '', [ Validators.maxLength( 150 ) ] ),
            price: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 20 ) ] ),
            image: new FormControl( '' ),
            restaurants: this._restaurantsFormGroup
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
            let arr:any[] = Object.keys( this._garnishFoodForm.value.restaurants );
            let _lRestaurants:string[] = [];

            arr.forEach( ( rest )=> {
                if( this._garnishFoodForm.value.restaurants[ rest ] ){
                    let restau:Restaurant = Restaurants.findOne( { name: rest } );
                    _lRestaurants.push( restau._id );               
                }            
            });

            GarnishFoodCol.insert({
                creation_user: Meteor.userId(),
                creation_date: new Date(),
                modification_user: '-',
                modification_date: new Date(),
                is_active: true,
                name: this._garnishFoodForm.value.name,
                description: this._garnishFoodForm.value.description,
                price: this._garnishFoodForm.value.price,
                restaurants: _lRestaurants
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
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._garnishFoodSub.unsubscribe();
        this._restaurantsSub.unsubscribe();
    }
}