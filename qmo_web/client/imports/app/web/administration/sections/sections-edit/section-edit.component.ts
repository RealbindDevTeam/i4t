import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { Meteor } from 'meteor/meteor';
import { MdSnackBar } from '@angular/material';
import { Sections } from '../../../../../../../both/collections/administration/section.collection';
import { Section } from '../../../../../../../both/models/administration/section.model';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';

import template from './section-edit.component.html';
import style from './section-edit.component.scss';

@Component({
    selector: 'section-edit',
    template,
    styles: [ style ]
})
export class SectionEditComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    public _sectionToEdit           : Section;
    private _editForm               : FormGroup;
    private _restaurantsFormGroup   : FormGroup = new FormGroup({});

    private _sections               : Observable<Section[]>;
    private _restaurants            : Observable<Restaurant[]>;

    private _sectionsSub            : Subscription;
    private _restaurantSub          : Subscription;

    private _sectionRestaurants     : string[];    

    /**
     * SectionEditComponent constructor
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {MdDialogRef<any>} _dialogRef 
     * @param {NgZone} _ngZone
     * @param {MdSnackBar} snackBar
     */    
    constructor( private _formBuilder: FormBuilder, 
                 private _translate: TranslateService, 
                 public _dialogRef: MdDialogRef<any>, 
                 private _ngZone: NgZone, 
                 public snackBar: MdSnackBar ){
        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(userLang);
        this._sectionRestaurants = [];
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._editForm = this._formBuilder.group({
            editId: [ this._sectionToEdit._id ],
            editName: [ this._sectionToEdit.name, Validators.required ],
            editIsActive: [ this._sectionToEdit.is_active ],
            editRestaurants: this._restaurantsFormGroup
        });
        this._sectionRestaurants = this._sectionToEdit.restaurants;
        this._sectionsSub = MeteorObservable.subscribe( 'sections', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._sections = Sections.find( { } ).zone();
            });
        });

        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { } ).zone();
                this._restaurants.subscribe( () => { this.createRestaurantForm(); });
            });
        });
    }

    /**
     * Create restaurants controls in form
     */
    createRestaurantForm():void{
        Restaurants.collection.find( { } ).fetch().forEach( ( res ) => {
            let find = this._sectionRestaurants.filter( r => r == res._id );
            if( find.length > 0 ){
                let control: FormControl = new FormControl( true );                                          
                this._restaurantsFormGroup.addControl( res._id, control );  
            } else {
                let control: FormControl = new FormControl( false );                                          
                this._restaurantsFormGroup.addControl( res._id, control );  
            }                 
        });
    }

    /**
     * Function to edit Section
     */
    editSection():void{
        if( !Meteor.userId() ){
            alert( 'Please log in to add a restaurant' );
            return;
        }

        if( this._editForm.valid ){
            let _edition_restaurants: string[] = [];
            let arr:any[] = Object.keys( this._editForm.value.editRestaurants );

            arr.forEach( ( rest ) => {
                if( this._editForm.value.editRestaurants[ rest ] ){
                    _edition_restaurants.push( rest );               
                }            
            });
            
            Sections.update( this._editForm.value.editId,{ 
                $set: {
                    modification_user: this._user,
                    modification_date: new Date(),
                    name: this._editForm.value.editName,
                    is_active: this._editForm.value.editIsActive,
                    restaurants: _edition_restaurants
                }
            });

            let _lMessage:string = this.itemNameTraduction( 'SECTIONS.SECTION_EDITED' );
            this.snackBar.open( _lMessage, '',{
                duration: 2500
            });
        }
        this._dialogRef.close();
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
        this._sectionsSub.unsubscribe();
        this._restaurantSub.unsubscribe();
    }
}