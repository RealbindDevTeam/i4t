import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MdDialogRef, MdDialog } from '@angular/material';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';

import { Restaurant } from '../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../both/collections/restaurant/restaurant.collection';
import { Role } from '../../../../../../both/models/auth/role.model';
import { Roles } from '../../../../../../both/collections/auth/role.collection';
import { UserDetail } from '../../../../../../both/models/auth/user-detail.model';
import { UserDetails } from '../../../../../../both/collections/auth/user-detail.collection';
import { User } from '../../../../../../both/models/auth/user.model';
import { Users } from '../../../../../../both/collections/auth/user.collection';
import { CollaboratorsEditionComponent } from './collaborators-edition/collaborators-edition.component';

import template from './collaborators.component.html';
import style from './collaborators.component.scss';

@Component({
    selector: 'collaborators',
    template,
    styles: [ style ]
})
export class CollaboratorsComponent implements OnInit, OnDestroy{

    private _restaurants : Observable<Restaurant[]>;
    private _userDetails : Observable<UserDetail[]>;
    private _users: Observable<User[]>;
    private _roles : Observable<Role[]>;
    private _restaurantSub : Subscription;
    private _userDetailsSub : Subscription;
    private _roleSub : Subscription;
    private _usersSub : Subscription;
    private _form : FormGroup;

    public _dialogRef: MdDialogRef<any>;

    /**
     * CollaboratorsComponent contructor
     * @param router 
     * @param _formBuilder 
     * @param translate 
     * @param _dialog 
     */
    constructor( private _router: Router, 
                 private _formBuilder: FormBuilder, 
                 private _translate: TranslateService, 
                 public _dialog: MdDialog )
    {
        var userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(userLang);
    } 

    /**
     * ngOnInit Implementation
     */
    ngOnInit() {
        this._form = new FormGroup({
            restaurant: new FormControl('', [Validators.required]),
        });
        this._restaurants = Restaurants.find({}).zone();
        this._restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe();
        this._roles = Roles.find({}).zone();
        this._roleSub = MeteorObservable.subscribe('getRoleCollaborators').subscribe();
        this._userDetailsSub = MeteorObservable.subscribe('getUsersDetailsForRestaurant', '' ).subscribe();
        this._usersSub = MeteorObservable.subscribe( 'getUsersByRestaurant', '' ).subscribe(); 
    }

    /**
     * This method allow search collaborators by restaurant id
     */
    collaboratorsSearch(){
        if ( this._form.valid ) {
            let id_restaurant : string;
            id_restaurant = this._form.value.restaurant;
            this._userDetailsSub = MeteorObservable.subscribe('getUsersDetailsForRestaurant', id_restaurant ).subscribe(() => {
                this._userDetails = UserDetails.find({}).zone();
            });

            this._usersSub = MeteorObservable.subscribe( 'getUsersByRestaurant' , id_restaurant ).subscribe( () => {
                this._users = Users.find({}).zone();
            });

        } else {
            alert('Seleccione un restaurante para consultar');
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
     */
    changeUserState(){

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
        this._router.navigate(['/app/restaurantRegister']);
    }

    /**
     * ngOnDestroy implementation
     */
    ngOnDestroy(){
        this._restaurantSub.unsubscribe();
        this._userDetailsSub.unsubscribe();
        this._usersSub.unsubscribe();
        this._roleSub.unsubscribe();
    }
}