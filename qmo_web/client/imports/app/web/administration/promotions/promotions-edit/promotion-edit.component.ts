import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { Promotions, PromotionImages, PromotionImagesThumbs } from '../../../../../../../both/collections/administration/promotion.collection';
import { Promotion, PromotionImage, PromotionImageThumb } from '../../../../../../../both/models/administration/promotion.model';
import { uploadPromotionImage } from '../../../../../../../both/methods/administration/promotion.methods';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { AlertConfirmComponent } from '../../../../web/general/alert-confirm/alert-confirm.component';

import template from './promotion-edit.component.html';
import style from './promotion-edit.component.scss';

@Component({
    selector: 'promotion-edit',
    template,
    styles: [ style ],
    providers:[ UserLanguageService ]
})
export class PromotionEditComponent implements OnInit, OnDestroy {

    public _promotionToEdit                 : Promotion;
    private _editForm                       : FormGroup;
    private _restaurantsFormGroup           : FormGroup = new FormGroup({});
    private _mdDialogRef                    : MdDialogRef<any>;

    private _promotions                     : Observable<Promotion[]>;
    private _restaurants                    : Observable<Restaurant[]>;
    private _promotionThumb                 : Observable<PromotionImageThumb[]>;

    private _promotionsSub                  : Subscription;
    private _restaurantSub                  : Subscription;
    private _promotionImagesSub             : Subscription;
    private _promotionThumbsSub             : Subscription;

    private _promotionEditImage             : string;
    private _showImage                      : boolean = true;
    private _editImage                      : boolean;
    private _editFilesToUpload              :Array<File>;
    private _editPromotionImageToInsert     : File;
            
    private _restaurantsList                : Restaurant[];
    private _promotionRestaurants           :string[];
    private _restaurantCreation             : Restaurant[];

    private titleMsg                        : string;
    private btnAcceptLbl                    : string;
    private _edition_restaurants            : string[];
    private _nameImageFileEdit              : string;
    
    /**
     * PromotionEditComponent constructor
     * @param {FormBuilder} _formBuilder
     * @param {TranslateService} _translate
     * @param {MdDialogRef<any>} _dialogRef
     * @param {NgZone} _ngZone
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _formBuilder: FormBuilder, 
                 private _translate: TranslateService, 
                 public _dialogRef: MdDialogRef<any>, 
                 private _ngZone: NgZone,
                 private _userLanguageService: UserLanguageService,
                 protected _mdDialog: MdDialog ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
        this._editFilesToUpload = [];
        this._editImage = false;
        this._edition_restaurants = [];
        this._restaurantsList = [];
        this._promotionRestaurants = [];
        this._restaurantCreation = [];
        this.titleMsg = 'SIGNUP.SYSTEM_MSG';
        this.btnAcceptLbl = 'SIGNUP.ACCEPT';
    }

    /**
     * Implements ngOnInit function
     */
    ngOnInit(){
        this.removeSubscriptions();
        this._editForm = this._formBuilder.group({
            editId: [ this._promotionToEdit._id ],
            editName: [ this._promotionToEdit.name, Validators.required ],
            editDesc: [ this._promotionToEdit.description ],
            editIsActive: [ this._promotionToEdit.is_active ],
            editImage: [ '' ],
            editRestaurants: this._restaurantsFormGroup
        });
        this._promotionRestaurants = this._promotionToEdit.restaurants;

        this._promotions = Promotions.find( { } ).zone();
        this._promotionsSub = MeteorObservable.subscribe( 'promotions', Meteor.userId() ).subscribe();
        this._promotionImagesSub = MeteorObservable.subscribe( 'promotionImages', Meteor.userId() ).subscribe();
        this._promotionThumbsSub = MeteorObservable.subscribe( 'promotionImageThumbs', Meteor.userId() ).subscribe();
        this._restaurantSub = MeteorObservable.subscribe( 'restaurants', Meteor.userId() ).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find( { } );
                this._restaurantCreation = Restaurants.collection.find().fetch();
                for( let rest of this._restaurantCreation ){ 
                    let restaurant:Restaurant = rest;    
                    let find = this._promotionRestaurants.filter( r => r == restaurant._id );

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

        let _lPromotionThumb: PromotionImageThumb = PromotionImagesThumbs.findOne( { promotionId: this._promotionToEdit._id } );

        this._promotionEditImage = _lPromotionThumb.url;
        if( _lPromotionThumb ){
            this._showImage = true;
        } else {
            this._showImage = false;
        }
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._promotionsSub ){ this._promotionsSub.unsubscribe(); }
        if( this._restaurantSub ){ this._restaurantSub.unsubscribe(); }
        if( this._promotionImagesSub ){ this._promotionImagesSub.unsubscribe(); }
        if( this._promotionThumbsSub ){ this._promotionThumbsSub.unsubscribe(); }
    }

    /**
     * Function to edit Promotion
     */
    editPromotion(){
        if( !Meteor.userId() ){
            var error : string = 'LOGIN_SYSTEM_OPERATIONS_MSG';
            this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
            return;
        }

        if( this._editForm.valid ){
            let arr:any[] = Object.keys( this._editForm.value.editRestaurants );
            arr.forEach( ( rest )=> {
                if( this._editForm.value.editRestaurants[ rest ] ){
                    let restau:Restaurant = Restaurants.findOne( { name: rest } );
                    this._edition_restaurants.push( restau._id );               
                }            
            });

            Promotions.update( this._editForm.value.editId, {
                $set:{
                    modification_user: Meteor.userId(),
                    modification_date: new Date(),
                    name: this._editForm.value.editName,
                    description: this._editForm.value.editDesc,
                    is_active: this._editForm.value.editIsActive,
                    restaurants: this._edition_restaurants
                }
            });

            if( this._editImage ){
                let _lPromotionImage: PromotionImage = PromotionImages.findOne( { promotionId: this._editForm.value.editId } );
                PromotionImages.remove( { _id: _lPromotionImage._id } );
                let _lPromotionImageThumb: PromotionImageThumb = PromotionImagesThumbs.findOne( { promotionId: this._editForm.value.editId } );
                PromotionImagesThumbs.remove( { _id: _lPromotionImageThumb._id } );

                uploadPromotionImage( this._editPromotionImageToInsert, 
                                      Meteor.userId(), 
                                      this._editForm.value.editId )
                                      .then( ( result ) => {
                      
                }).catch( ( err ) => {
                    var error : string = this.itemNameTraduction('UPLOAD_IMG_ERROR');
                    this.openDialog(this.titleMsg, '', error, '', this.btnAcceptLbl, false);
                });
            }
            this._dialogRef.close();
        }
    }

    /**
     * When user wants change Promotion image, this function allow insert the image in the store
     */
    onChangeEditImage( fileInput:any ):void{
        this._editImage = true;
        this._editFilesToUpload = <Array<File>> fileInput.target.files;
        this._editPromotionImageToInsert = this._editFilesToUpload[0];
        this._nameImageFileEdit = this._editPromotionImageToInsert.name;
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