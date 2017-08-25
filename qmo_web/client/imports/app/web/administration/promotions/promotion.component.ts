import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { Promotions, PromotionImagesThumbs } from '../../../../../../both/collections/administration/promotion.collection';
import { Promotion, PromotionImageThumb } from '../../../../../../both/models/administration/promotion.model';
import { uploadPromotionImage } from '../../../../../../both/methods/administration/promotion.methods';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { PromotionEditComponent } from './promotions-edit/promotion-edit.component';
import { AlertConfirmComponent } from '../../../web/general/alert-confirm/alert-confirm.component';

import template from './promotion.component.html';
import style from './promotion.component.scss';

@Component({
    selector: 'promotion',
    template,
    styles: [ style ]
})
export class PromotionComponent implements OnInit, OnDestroy {
    
    private _promotionForm                  : FormGroup;
    private _restaurantsFormGroup           : FormGroup = new FormGroup({});
    private _mdDialogRef                    : MdDialogRef<any>;

    private _promotions                     : Observable<Promotion[]>;
    private _restaurants                    : Observable<Restaurant[]>;
    private _promotionThumbs                : Observable<PromotionImageThumb[]>;

    private _promotionsSub                  : Subscription;
    private _restaurantSub                  : Subscription;
    private _promotionThumbsSubsription     : Subscription;
    
    private _createImage                    : boolean;
    private _restaurantList                 : Restaurant[];
    _dialogRef                              : MdDialogRef<any>;
    private _nameImageFile                  : string;
    private _showRestaurants                : boolean = true;

    private _filesToUpload                  : Array<File>;
    private _promotionImageToInsert         : File;
    private titleMsg                        : string;
    private btnAcceptLbl                    : string;

    /**
     * PromotionComponent constructor
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {MdDialog} _dialog
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _formBuilder: FormBuilder, 
                 private _translate: TranslateService, 
                 public _dialog: MdDialog, 
                 private _ngZone: NgZone,
                 private _userLanguageService: UserLanguageService,
                 protected _mdDialog: MdDialog ) {
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
        this._filesToUpload = [];
        this._createImage = false;
        this._restaurantList = [];
        this.titleMsg = 'SIGNUP.SYSTEM_MSG';
        this.btnAcceptLbl = 'SIGNUP.ACCEPT';
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this.removeSubscriptions();
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
        this._promotionThumbsSubsription = MeteorObservable.subscribe( 'promotionImageThumbs', Meteor.userId() ).subscribe();
        this._promotionThumbs = PromotionImagesThumbs.find( { } ).zone();
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._promotionsSub ){ this._promotionsSub.unsubscribe(); }
        if( this._restaurantSub ){ this._restaurantSub.unsubscribe(); }
        if( this._promotionThumbsSubsription ){ this._promotionThumbsSubsription.unsubscribe(); }
    }

    /**
     * Function to add Promotion
     */
    addPromotion():void{
        if( !Meteor.userId() ){
            var error : string = 'Please log in to add a restaurant';
            this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
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

            let _lNewPromotion = Promotions.collection.insert({
                creation_user: Meteor.userId(),
                creation_date: new Date(),
                modification_user: '-',
                modification_date: new Date(),
                is_active: true,
                name: this._promotionForm.value.name,
                description: this._promotionForm.value.description,
                restaurants: _lRestaurantsToInsert
            });

            if( this._createImage ){
                uploadPromotionImage( this._promotionImageToInsert, 
                                      Meteor.userId(), 
                                      _lNewPromotion )
                                      .then( ( result ) => {

                }).catch( ( err ) => {
                    var error : string = this.itemNameTraduction('UPLOAD_IMG_ERROR');
                    this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
                });                
            } else {
                
            }
        }
        this.cancel();
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
            width: '65%'
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
    * This function open de error dialog according to parameters 
    * @param {string} title
    * @param {string} subtitle
    * @param {string} content
    * @param {string} btnCancelLbl
    * @param {string} btnAcceptLbl
    * @param {boolean} showBtnCancel
    */
    openDialog(title: string, subtitle: string, content: string, btnCancelLbl: string, btnAcceptLbl: string, showBtnCancel: boolean) {
        
        this._mdDialogRef = this._mdDialog.open(AlertConfirmComponent, {
            disableClose: true,
            data: {
                title: title,
                subtitle: subtitle,
                content: content,
                buttonCancel: btnCancelLbl,
                buttonAccept: btnAcceptLbl,
                showBtnCancel: showBtnCancel
            }
        });
        this._mdDialogRef.afterClosed().subscribe(result => {
            this._mdDialogRef = result;
            if (result.success) {

            }
        });
    }

    /**
     * This function allow translate
     * @param itemName 
     */
    itemNameTraduction(itemName: string): string {
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
        this.removeSubscriptions();
    }
}