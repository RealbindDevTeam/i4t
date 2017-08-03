import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { MdSnackBar } from '@angular/material';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { Sections } from '../../../../../../both/collections/administration/section.collection';
import { Section } from '../../../../../../both/models/administration/section.model';
import { SectionEditComponent } from './sections-edit/section-edit.component';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';

import template from './section.component.html';
import style from './section.component.scss';

@Component({
    selector: 'section',
    template,
    styles: [ style ]
})
export class SectionComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();
    private _sectionForm            : FormGroup;    
    private _restaurantsFormGroup   : FormGroup = new FormGroup({});

    private _sections               : Observable<Section[]>;
    private _restaurants            : Observable<Restaurant[]>;

    private _sectionSub             : Subscription;
    private _restaurantSub          : Subscription;

    public _dialogRef               : MdDialogRef<any>;
    private _showRestaurants        : boolean = true;

    /**
     * SectionComponent constructor
     * @param {MdSnackBar} snackBar
     * @param {MdDialog} _dialog
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {NgZone} _ngZone
     * @param {Router} _router
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( public snackBar: MdSnackBar,
                 public _dialog: MdDialog, 
                 private _formBuilder: FormBuilder, 
                 private _translate: TranslateService, 
                 private _ngZone: NgZone, 
                 private _router: Router,
                 private _userLanguageService: UserLanguageService ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._sectionForm = new FormGroup({
            name: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 50 ) ] ),
            restaurants: this._restaurantsFormGroup
        });

        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', this._user ).subscribe( () => {
            this._ngZone.run(() => {
                this._restaurants = Restaurants.find( { } ).zone();
                this._restaurants.subscribe( () => { this.createRestaurantForm(); });
            });
        });

        this._sectionSub = MeteorObservable.subscribe( 'sections', this._user ).subscribe( () => {
            this._ngZone.run( () => {
                this._sections = Sections.find( { } ).zone();        
            });
        });
    }

    /**
     * Create restaurants controls in form
     */
    createRestaurantForm():void{
        Restaurants.collection.find( { } ).fetch().forEach( ( res ) => {
            if( this._restaurantsFormGroup.contains( res._id ) ){
                this._restaurantsFormGroup.controls[ res._id ].setValue( false );
            } else {
                let control: FormControl = new FormControl( false );
                this._restaurantsFormGroup.addControl( res._id, control );
            }
        });

        if( Restaurants.collection.find( { } ).count() === 0 ){
            this._showRestaurants = false;
        }
    }

    /**
     * Function to add Section
     */
    addSection():void{
        if( !Meteor.userId() ){
            alert( 'Please log in to add a restaurant' );
            return;
        }

        if( this._sectionForm.valid ){
            let _create_restaurants: string[] = [];
            let arr:any[] = Object.keys( this._sectionForm.value.restaurants );

            arr.forEach( ( rest ) => {
                if( this._sectionForm.value.restaurants[ rest ]){
                    _create_restaurants.push( rest);               
                }            
            });

            let _lNewSection = Sections.collection.insert({
                creation_user: this._user,
                creation_date: new Date(),
                modification_user: '-',
                modification_date: new Date(),
                restaurants: _create_restaurants,
                is_active: true,
                name: this._sectionForm.value.name
            });

            if( _lNewSection ){
                let _lMessage:string = this.itemNameTraduction( 'SECTIONS.SECTION_CREATED' );
                this.snackBar.open( _lMessage, '',{
                    duration: 2500
                });
            }

            this.cancel();
        }
    }

    /**
     * Function to update section status
     * @param {Section} _section
     */
    updateStatus( _section:Section ):void{
        Sections.update(_section._id,{
            $set: {
                is_active: !_section.is_active,
                modification_date: new Date(),
                modification_user: this._user
            }
        });
    }

    /**
     * Function to cancel add section
     */
    cancel():void{
        this._sectionForm.reset();
    }

    /**
     * When user wants edit Section, this function open dialog with section information
     * @param {Section} _section
     */
    open( _section: Section ){
        this._dialogRef = this._dialog.open( SectionEditComponent, {
            disableClose : true,
            width: '60%'
        });
        this._dialogRef.componentInstance._sectionToEdit = _section;
        this._dialogRef.afterClosed().subscribe(result => {
            this._dialogRef = null;
        });
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
     * Go to add new Restaurant
     */
    goToAddRestaurant(){
        this._router.navigate(['/app/restaurantRegister']);
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._sectionSub.unsubscribe();
        this._restaurantSub.unsubscribe();
    }
}