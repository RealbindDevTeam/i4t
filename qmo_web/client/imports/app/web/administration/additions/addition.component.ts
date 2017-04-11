import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Additions } from '../../../../../../both/collections/administration/addition.collection';
import { Addition } from '../../../../../../both/models/administration/addition.model';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Meteor } from 'meteor/meteor';
import { AdditionEditComponent } from './additions-edit/addition-edit.component';

import template from './addition.component.html';
import style from './addition.component.scss';

@Component({
    selector: 'addition',
    template,
    styles: [ style ]
})
export class AdditionComponent implements OnInit, OnDestroy{

    private _additionForm: FormGroup;
    private _restaurantsFormGroup: FormGroup = new FormGroup({});

    private _additions: Observable<Addition[]>;
    private _restaurants: Observable<Restaurant[]>;

    private _additionsSub: Subscription;
    private _restaurantSub: Subscription;
    
    private _restaurantList:Restaurant[];
    public _dialogRef: MdDialogRef<any>;
    private _showRestaurants: boolean = true;

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
        this._additionForm = new FormGroup({
            name: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 50 ) ] ),
            isActive: new FormControl( false ),
            price: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 20 ) ] ),
            restaurants: this._restaurantsFormGroup         
        });        

        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', Meteor.userId() ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { } );
                this._restaurantList = Restaurants.collection.find({}).fetch();
                for( let res of this._restaurantList ){
                    let control: FormControl = new FormControl( false );
                    this._restaurantsFormGroup.addControl( res.name, control );
                }
                if( this._restaurantList.length === 0 ){
                    this._showRestaurants = false;
                }
            });
        });

        this._additions = Additions.find( { } ).zone();
        this._additionsSub = MeteorObservable.subscribe( 'additions', Meteor.userId() ).subscribe();
    }

    /**
     * Function to add Addition
     */
    addAddition():void{
        if( !Meteor.userId() ){
            alert( 'Please log in to add a restaurant' );
            return;
        }

        if( this._additionForm.valid ){
            let arr:any[] = Object.keys( this._additionForm.value.restaurants );
            let _lRestaurantsToInsert:string[] = [];

            arr.forEach( ( rest ) => {
                if( this._additionForm.value.restaurants[ rest ] ){
                    let restau:Restaurant = Restaurants.findOne( { name: rest } );
                    _lRestaurantsToInsert.push( restau._id );               
                }            
            });

            Additions.insert({
                creation_user: Meteor.userId(),
                creation_date: new Date(),
                modification_user: '-',
                modification_date: new Date(),
                is_active: true,
                name: this._additionForm.value.name,
                price: this._additionForm.value.price,
                restaurants: _lRestaurantsToInsert
            });
        }
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
                modification_user: Meteor.userId()
            }
        });
    }

    /**
     * Function to cancel add Addition
     */
    cancel():void{
        this._additionForm.reset();    
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
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._additionsSub.unsubscribe();
        this._restaurantSub.unsubscribe();
    }
}