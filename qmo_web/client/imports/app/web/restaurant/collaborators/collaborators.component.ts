import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MdDialogRef, MdDialog } from '@angular/material';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { UserLanguageService } from '../../../shared/services/user-language.service';
import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Role } from '../../../../../../both/models/auth/role.model';
import { Roles } from '../../../../../../both/collections/auth/role.collection';
import { UserDetail } from '../../../../../../both/models/auth/user-detail.model';
import { UserDetails } from '../../../../../../both/collections/auth/user-detail.collection';
import { User } from '../../../../../../both/models/auth/user.model';
import { Users } from '../../../../../../both/collections/auth/user.collection';
import { CollaboratorsEditionComponent } from './collaborators-edition/collaborators-edition.component';
import { AlertConfirmComponent } from '../../../web/general/alert-confirm/alert-confirm.component';

import template from './collaborators.component.html';
import style from './collaborators.component.scss';

@Component({
    selector: 'collaborators',
    template,
    styles: [ style ]
})
export class CollaboratorsComponent implements OnInit, OnDestroy{

    private _restaurants            : Observable<Restaurant[]>;
    private _userDetails            : Observable<UserDetail[]>;
    private _users                  : Observable<User[]>;
    private _roles                  : Observable<Role[]>;

    private _restaurantSub          : Subscription;
    private _userDetailsSub         : Subscription;
    private _roleSub                : Subscription;
    private _usersSub               : Subscription;

    private _form                   : FormGroup;
    public _dialogRef               : MdDialogRef<any>;
    private _mdDialogRef            : MdDialogRef<any>;
    private titleMsg                : string;
    private btnAcceptLbl            : string;
    private _thereAreRestaurants    : boolean = true;

    /**
     * CollaboratorsComponent Constructor
     * @param {Router} _router 
     * @param {FormBuilder} _formBuilder 
     * @param {TranslateService} _translate 
     * @param {MdDialog} _dialog 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( private _router: Router, 
                 private _formBuilder: FormBuilder, 
                 private _translate: TranslateService, 
                 public _dialog: MdDialog,
                 private _userLanguageService: UserLanguageService,
                 protected _mdDialog: MdDialog,
                 private _ngZone: NgZone )
    {
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
        this.titleMsg = 'SIGNUP.SYSTEM_MSG';
        this.btnAcceptLbl = 'SIGNUP.ACCEPT';
    } 

    /**
     * ngOnInit Implementation
     */
    ngOnInit() {
        this.removeSubscriptions();
        this._form = new FormGroup({
            restaurant: new FormControl('', [Validators.required]),
        });
        this._restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe( () => {
            this._ngZone.run( () => {
                this._restaurants = Restaurants.find({}).zone();
                this.countRestaurants();
                this._restaurants.subscribe( () => { this.countRestaurants(); } );
            });
        });
        this._roleSub = MeteorObservable.subscribe('getRoleCollaborators').subscribe( () => {
            this._ngZone.run( () => {
                this._roles = Roles.find({}).zone();
            });
        });
    }

    /**
     * Validate if restaurants exists
     */
    countRestaurants():void{
        Restaurants.collection.find( { } ).count() > 0 ? this._thereAreRestaurants = true : this._thereAreRestaurants = false;
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._restaurantSub ){ this._restaurantSub.unsubscribe(); }
        if( this._roleSub ){ this._roleSub.unsubscribe(); }
        if(this._userDetailsSub){ this._userDetailsSub.unsubscribe(); }
        if(this._usersSub){ this._usersSub.unsubscribe();}
    }

    /**
     * This method allow search collaborators by restaurant id
     */
    collaboratorsSearch(){
        if ( this._form.valid ) {
            let id_restaurant : string;
            id_restaurant = this._form.value.restaurant;
            this._userDetailsSub = MeteorObservable.subscribe('getUsersDetailsForRestaurant', id_restaurant ).subscribe(() => {
                this._userDetails = UserDetails.find({restaurant_work : id_restaurant}).zone();
            });
            
            this._usersSub = MeteorObservable.subscribe( 'getUsersByRestaurant' , id_restaurant ).subscribe( () => {
                this._users = Users.find({}).zone();
            });

        } else {
            var message_translate = this.itemNameTraduction('COLLABORATORS.COLLABORATORS_TEXT');
            this.openDialog(this.titleMsg, '', message_translate, '', this.btnAcceptLbl, false);
        }
    }

    /**
     * Collaboratos edition
     * @param _userdetail 
     */
    editCollaborator( _userdetail : UserDetail, _user : User ){
        this._dialogRef = this._dialog.open( CollaboratorsEditionComponent, {
            disableClose : true,
            width: '75%'
        });
        this._dialogRef.componentInstance.selectUserDetail = _userdetail;
        this._dialogRef.componentInstance.selectUser       = _user;
        this._dialogRef.afterClosed().subscribe( result => {
            this._dialogRef = null;
        });
    }

    /**
     * Change user state
     * @param {string} _pUserDetailId
     */
    changeUserState( _pUserDetail: UserDetail ):void{
        UserDetails.update( { _id: _pUserDetail._id }, { $set: { is_active: !_pUserDetail.is_active } } );
    }
    
    /**
     * Open Collaborator register component
     */
    openCollaboratorstRegister(){
        this._router.navigate(['app/collaborators-register']);
    }

    /**
     * Go to add new Restaurant
     */
    goToAddRestaurant(){
        this._router.navigate(['/app/restaurant-register']);
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
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
        this.removeSubscriptions();
    }
}