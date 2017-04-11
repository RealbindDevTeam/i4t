import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { GarnishFoodCol } from '../../../../../../../both/collections/administration/garnish-food.collection';
import { GarnishFood } from '../../../../../../../both/models/administration/garnish-food.model';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';

import template from './garnish-food-edit.component.html';
import style from './garnish-food-edit.component.scss';

@Component({
    selector: 'garnishFood-edit',
    template,
    styles: [ style ]
})
export class GarnishFoodEditComponent implements OnInit, OnDestroy {

    public _garnishFoodToEdit: GarnishFood;
    private _editForm: FormGroup;
    private _restaurantsFormGroup: FormGroup = new FormGroup({});

    private _garnishFoodCol: Observable<GarnishFood[]>;
    private _restaurants: Observable<Restaurant[]>;

    private _garnishFoodSub: Subscription;
    private _restaurantSub: Subscription;

    private _restaurantsList: Restaurant[];
    private _garnishFoodRestaurants:string[];
    private _restaurantCreation: Restaurant[];
    private _edition_restaurants: string[];

    private _showImage: boolean = true;
    private _createRestaurants: boolean = false;

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
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._editForm = this._formBuilder.group({
            editId: [ this._garnishFoodToEdit._id ],
            editName: [ this._garnishFoodToEdit.name, Validators.required ],
            editDesc: [ this._garnishFoodToEdit.description ],
            editIsActive: [ this._garnishFoodToEdit.is_active ],
            editPrice: [ this._garnishFoodToEdit.price, Validators.required ],
            editRestaurants: this._restaurantsFormGroup
        });
        this._garnishFoodRestaurants = this._garnishFoodToEdit.restaurants;

        this._garnishFoodCol = GarnishFoodCol.find( { } ).zone();
        this._garnishFoodSub = MeteorObservable.subscribe( 'garnishFood', Meteor.userId() ).subscribe();
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', Meteor.userId() ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { } );
                this._restaurantCreation = Restaurants.collection.find( { } ).fetch();
                for( let rest of this._restaurantCreation ){
                    let restaurant:Restaurant = rest;   
                    let find = this._garnishFoodRestaurants.filter( r => r == restaurant._id );

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
            let arr:any[] = Object.keys( this._editForm.value.editRestaurants );

            arr.forEach( ( rest ) => {
                if( this._editForm.value.editRestaurants[ rest ] ) {
                    let restau:Restaurant = Restaurants.findOne( { name: rest } );
                    this._edition_restaurants.push( restau._id );               
                }            
            });

            GarnishFoodCol.update( this._editForm.value.editId, {
                $set: {
                    modification_user: Meteor.userId(),
                    modification_date: new Date(),
                    name: this._editForm.value.editName,
                    description: this._editForm.value.editDesc,
                    is_active: this._editForm.value.editIsActive,
                    price: this._editForm.value.editPrice,
                    restaurants: this._edition_restaurants
                }
            });
            this._dialogRef.close();
        }
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._garnishFoodSub.unsubscribe();
        this._restaurantSub.unsubscribe();
    }
}