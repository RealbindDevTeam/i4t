import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { Additions } from '../../../../../../../both/collections/administration/addition.collection';
import { Addition } from '../../../../../../../both/models/administration/addition.model';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';

import template from './addition-edit.component.html';
import style from './addition-edit.component.scss';

@Component({
    selector: 'addition-edit',
    template,
    styles: [ style ]
})
export class AdditionEditComponent implements OnInit, OnDestroy {
    
    public _additionToEdit: Addition;
    private _editForm: FormGroup;
    private _restaurantsFormGroup: FormGroup = new FormGroup({});

    private _additions: Observable<Addition[]>;
    private _restaurants: Observable<Restaurant[]>;

    private _additionSub: Subscription;
    private _restaurantSub: Subscription;

    private _restaurantsList: Restaurant[];
    private _additionRestaurants:string[];
    private _restaurantCreation: Restaurant[];
    private _edition_restaurants: string[];

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
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._editForm = this._formBuilder.group({
            editId: [ this._additionToEdit._id ],
            editName: [ this._additionToEdit.name, Validators.required ],
            editIsActive: [ this._additionToEdit.is_active ],
            //editPrice: [ this._additionToEdit.price, Validators.required ],
            editRestaurants: this._restaurantsFormGroup
        });
        //this._additionRestaurants = this._additionToEdit.restaurants;

        this._additions = Additions.find( { } ).zone();
        this._additionSub = MeteorObservable.subscribe( 'additions', Meteor.userId() ).subscribe();
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', Meteor.userId() ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { } );
                this._restaurantCreation = Restaurants.collection.find().fetch();
                for( let rest of this._restaurantCreation ){ 
                    let restaurant:Restaurant = rest;    
                    let find = this._additionRestaurants.filter( r => r == restaurant._id );

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
            let arr:any[] = Object.keys( this._editForm.value.editRestaurants );
            arr.forEach( ( rest ) => {
                if( this._editForm.value.editRestaurants[ rest ] ) {
                    let restau:Restaurant = Restaurants.findOne( { name: rest } );
                    this._edition_restaurants.push( restau._id );               
                }            
            });

            /*Additions.update( this._editForm.value.editId,{
                $set: {
                    modification_user: Meteor.userId(),
                    modification_date: new Date(),
                    name: this._editForm.value.editName,
                    description: this._editForm.value.editDesc,
                    is_active: this._editForm.value.editIsActive,
                    price: this._editForm.value.editPrice,
                    restaurants: this._edition_restaurants
                }
            });*/
            this._dialogRef.close();          
        }
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._additionSub.unsubscribe();
        this._restaurantSub.unsubscribe();
    }
}