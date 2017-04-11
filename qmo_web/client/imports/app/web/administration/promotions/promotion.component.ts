import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Meteor } from 'meteor/meteor';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Promotions, PromotionImages } from '../../../../../../both/collections/administration/promotion.collection';
import { Promotion } from '../../../../../../both/models/administration/promotion.model';
import { uploadPromotionImage } from '../../../../../../both/methods/administration/promotion.methods';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { PromotionEditComponent } from './promotions-edit/promotion-edit.component';

import template from './promotion.component.html';
import style from './promotion.component.scss';

@Component({
    selector: 'promotion',
    template,
    styles: [ style ]
})
export class PromotionComponent implements OnInit, OnDestroy {
    
    private _promotionForm: FormGroup;
    private _restaurantsFormGroup: FormGroup = new FormGroup({});

    private _promotions: Observable<Promotion[]>;
    private _restaurants: Observable<Restaurant[]>;

    private _promotionsSub: Subscription;
    private _promotionImagesSub: Subscription;    
    private _restaurantSub: Subscription;
    
    private _createImage: boolean;
    private _restaurantList:Restaurant[];
    _dialogRef: MdDialogRef<any>;
    private _nameImageFile: string;
    private _showRestaurants: boolean = true;

    private _filesToUpload: Array<File>;
    private _promotionImageToInsert: File;

    private _create_isActive: boolean;
    private _create_name: string;
    private _create_description;
        
    /**
     * PromotionComponent constructor
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {MdDialog} _dialog
     */
    constructor( private _formBuilder: FormBuilder, private _translate: TranslateService, public _dialog: MdDialog, private _ngZone: NgZone ) {
        var _userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
        this._filesToUpload = [];
        this._createImage = false;
        this._restaurantList = [];
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this._promotionForm = new FormGroup({
            name: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 50 ) ] ),
            description: new FormControl( '', [ Validators.maxLength( 150 ) ] ),
            image: new FormControl( '' ),
            restaurants: this._restaurantsFormGroup
        });

        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', Meteor.userId() ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { } ).zone();
                this._restaurantList = Restaurants.collection.find( { } ).fetch();
                for ( let res of this._restaurantList ) {
                    let control: FormControl = new FormControl( false );
                    this._restaurantsFormGroup.addControl( res.name, control );
                }
                if( this._restaurantList.length === 0 ){
                    this._showRestaurants = false;
                }
            });            
        });

        this._promotions = Promotions.find( { } ).zone();
        this._promotionsSub = MeteorObservable.subscribe( 'promotions', Meteor.userId() ).subscribe();
        this._promotionImagesSub = MeteorObservable.subscribe( 'promotionImages', Meteor.userId() ).subscribe();
    }

    /**
     * Function to add Promotion
     */
    addPromotion():void{
        if( !Meteor.userId() ){
            alert( 'Please log in to add a restaurant' );
            return;
        }

        if( this._promotionForm.valid ){
            let arr:any[] = Object.keys( this._promotionForm.value.restaurants );
            let _lRestaurantsToInsert:string[]= [];

            arr.forEach( ( rest )=> {
                if( this._promotionForm.value.restaurants[ rest ] ){
                    let restau:Restaurant = Restaurants.findOne( { name: rest } );
                    _lRestaurantsToInsert.push( restau._id );               
                }            
            });

            if( this._createImage ){
                this._create_isActive = true;
                this._create_name = this._promotionForm.value.name;
                this._create_description = this._promotionForm.value.description;

                uploadPromotionImage( this._promotionImageToInsert, Meteor.userId() ).then( ( result ) => {
                    this.insertNewPromotion( result, _lRestaurantsToInsert );
                }).catch( ( error ) => {
                    alert( 'Upload image error. Only accept .png, .jpg, .jpeg files.' );
                });                
            } else {
                this.insertNewPromotion( null, _lRestaurantsToInsert );
            }
        }
        this.cancel();
    }

    /**
     * This function insert new promotion
     * @param {any} _pFile
     * @param {string[]} _pRestaurants
     */
    insertNewPromotion( _pFile:any, _pRestaurants:string[] ):void{
        if( _pFile != null ){
            Promotions.insert({
                creation_user: Meteor.userId(),
                creation_date: new Date(),
                modification_user: '-',
                modification_date: new Date(),
                is_active: this._create_isActive,
                name: this._create_name,
                description: this._create_description,
                promotionImageId: _pFile._id,
                urlImage: _pFile.url,
                restaurants: _pRestaurants
            });
        } else {
            Promotions.insert({
                creation_user: Meteor.userId(),
                creation_date: new Date(),
                modification_user: '-',
                modification_date: new Date(),
                is_active: true,
                name: this._promotionForm.value.name,
                description: this._promotionForm.value.description,
                promotionImageId: '-',
                urlImage: '-',
                restaurants: _pRestaurants
            });
        }
    }

    /**
     * Function to update Promotion status
     * @param {Promotion} _promotion
     */
    updateStatus( _promotion:Promotion ):void {
        Promotions.update( _promotion._id, {
            $set: {
                is_active: !_promotion.is_active,
                modification_date: new Date(),
                modification_user: Meteor.userId()
            }
        });
    }

    /**
     * When user wants edit Promotion, this function open dialog with Promotion information
     * @param {Promotion} _promotion
     */
    open( _promotion: Promotion ){
        this._dialogRef = this._dialog.open( PromotionEditComponent, {
            disableClose : true,
            width: '60%'
        });
        this._dialogRef.componentInstance._promotionToEdit = _promotion;
        this._dialogRef.afterClosed().subscribe( result => {
            this._dialogRef = null;
        });
    }

    /**
     * Function to cancel add Promotion
     */
    cancel():void{
        this._createImage = false;
        this._filesToUpload = [];
        this._promotionImageToInsert = new File([""],"");
        this._promotionForm.reset();
    }

    /**
     * When user wants add Promotion image, this function allow inser the image in the store
     * @param {any} _fileInput
     */
    onChangeImage( _fileInput:any ):void{
        this._createImage = true;
        this._filesToUpload = <Array<File>> _fileInput.target.files;
        this._promotionImageToInsert = this._filesToUpload[0];
        this._nameImageFile = this._promotionImageToInsert.name;
    }

    /**
     * Implements ngOnDestroy function
     */
    ngOnDestroy(){
        this._promotionsSub.unsubscribe();
        this._promotionImagesSub.unsubscribe();    
        this._restaurantSub.unsubscribe();
    }
}