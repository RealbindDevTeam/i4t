import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { Meteor } from 'meteor/meteor';
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

    public _sectionToEdit: Section;
    private _editForm: FormGroup;
    private _restaurantsFormGroup: FormGroup = new FormGroup({});

    private _sections: Observable<Section[]>;
    private _restaurants: Observable<Restaurant[]>;

    private _sectionsSub: Subscription;
    private _restaurantSub: Subscription;

    private _sectionRestaurants:string[];    
    private _restaurantsList: Restaurant[];
    private _edition_restaurants: string[];
    private _createdRestaurants: Restaurant[];
        
    /**
     * SectionEditComponent constructor
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {MdDialogRef<any>} _dialogRef 
     */    
    constructor( private _formBuilder: FormBuilder, private _translate: TranslateService, public _dialogRef: MdDialogRef<any>, private _ngZone: NgZone ){
        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(userLang);
        this._sectionRestaurants = [];
        this._restaurantsList = [];
        this._edition_restaurants = [];
        this._createdRestaurants = [];
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._editForm = this._formBuilder.group({
            editId: [ this._sectionToEdit._id ],
            editName: [ this._sectionToEdit.name, Validators.required ],
            editDesc: [ this._sectionToEdit.description ],
            editIsActive: [ this._sectionToEdit.is_active ],
            editRestaurants: this._restaurantsFormGroup
        });
        this._sectionRestaurants = this._sectionToEdit.restaurants;
        this._sections = Sections.find( { } ).zone();
        this._sectionsSub = MeteorObservable.subscribe( 'sections', Meteor.userId() ).subscribe();

        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', Meteor.userId() ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { } );
                this._createdRestaurants = Restaurants.collection.find({}).fetch();
                for( let rest of this._createdRestaurants ){ 
                    let restaurant:Restaurant = rest;    
                    let find = this._sectionRestaurants.filter( r => r == restaurant._id );

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
     * Function to edit Section
     */
    editSection():void{
        if( !Meteor.userId() ){
            alert( 'Please log in to add a restaurant' );
            return;
        }

        if( this._editForm.valid ){
            let arr:any[] = Object.keys( this._editForm.value.editRestaurants );

            arr.forEach( ( rest ) => {
                if( this._editForm.value.editRestaurants[ rest ] ){
                    let restau:Restaurant = Restaurants.findOne( { name: rest } );
                    this._edition_restaurants.push( restau._id );               
                }            
            });
            
            Sections.update( this._editForm.value.editId,{ 
                $set: {
                    modification_user: Meteor.userId(),
                    modification_date: new Date(),
                    name: this._editForm.value.editName,
                    description: this._editForm.value.editDesc,
                    is_active: this._editForm.value.editIsActive,
                    restaurants: this._edition_restaurants
                }
            });
        }
        this._dialogRef.close();
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._sectionsSub.unsubscribe();
        this._restaurantSub.unsubscribe();
    }
}