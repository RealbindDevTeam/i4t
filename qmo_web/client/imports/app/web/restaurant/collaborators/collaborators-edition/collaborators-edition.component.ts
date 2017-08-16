import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MdDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { CustomValidators } from '../../../../../../../both/shared-components/validators/custom-validator';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { Role } from '../../../../../../../both/models/auth/role.model';
import { Roles } from '../../../../../../../both/collections/auth/role.collection';
import { Table } from '../../../../../../../both/models/restaurant/table.model';
import { Tables } from '../../../../../../../both/collections/restaurant/table.collection';
import { UserProfile, UserProfileImage } from '../../../../../../../both/models/auth/user-profile.model';
import { UserDetails } from '../../../../../../../both/collections/auth/user-detail.collection';
import { UserDetail } from '../../../../../../../both/models/auth/user-detail.model';
import { User } from '../../../../../../../both/models/auth/user.model';
import { Users } from '../../../../../../../both/collections/auth/user.collection';
import template from './collaborators-edition.component.html';

@Component({
    selector: 'collaborators-edition',
    template,
    providers: [ UserLanguageService ]
})
export class CollaboratorsEditionComponent implements OnInit, OnDestroy {

    private _userProfile      = new UserProfile();
    private _userProfileImage = new UserProfileImage();
    public selectUser                 : User;  
    public selectUserDetail           : UserDetail;
    private _roleSub                  : Subscription;
    private _tableSub                 : Subscription;
    private _restaurantSub            : Subscription;
    private _restaurants              : Observable<Restaurant[]>;
    private _roles                    : Observable<Role[]>;
    private _tables                   : Observable<Table[]>;
    private _collaboratorEditionForm  : FormGroup;
    private _tablesNumber             : number[] = [];
    private _userLang                 : string;
    private _error                    : string
    private _message                  : string;
    private _selectedRestaurant       : string;
    private _showConfirmError         : boolean = false;
    private _showTablesSelect         : boolean = false;
    private _disabledTablesAssignment : boolean = true;
    public _selectedIndex             : number = 0;
    public _tableInit                 : number = 0;
    public _tableEnd                  : number = 0;

    /**
     * CollaboratorsEditionComponent constructor
     * @param {Router} _router 
     * @param {FormBuilder} _formBuilder 
     * @param {TranslateService} _translate 
     * @param {NgZone} _zone 
     * @param {MdDialogRef<any>} _dialogRef 
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _router: Router, 
                 private _formBuilder: FormBuilder, 
                 private _translate: TranslateService,
                 private _zone: NgZone,
                 public _dialogRef: MdDialogRef<any>,
                 private _userLanguageService: UserLanguageService )
    {
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }

    /**
     * ngOnInit implementation
     */
    ngOnInit() {
        this.validateWaiterRole(this.selectUserDetail.role_id);
        this._collaboratorEditionForm = this._formBuilder.group({
            name: [ this.selectUser.profile.first_name, [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 70 ) ] ],
            last_name: [ this.selectUser.profile.last_name, [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 70 ) ] ],
            birthdate_dd: [ (this.selectUserDetail.birthdate.getDate() <= 9 ? '0' + this.selectUserDetail.birthdate.getDate() : this.selectUserDetail.birthdate.getDate() ), [ Validators.required, CustomValidators.dayOfDateValidator ] ],
            birthdate_mm: [ ((this.selectUserDetail.birthdate.getMonth() + 1) <= 9 ? '0' + (this.selectUserDetail.birthdate.getMonth() + 1) : (this.selectUserDetail.birthdate.getMonth() + 1) ), [ Validators.required, CustomValidators.monthOfDateValidator ] ],
            birthdate_yyyy: [ this.selectUserDetail.birthdate.getFullYear() ],
            restaurant_work: [ this.selectUserDetail.restaurant_work ],
            role: [ this.selectUserDetail.role_id ],
            phone: [ this.selectUserDetail.phone ],
            username: [ this.selectUser.username ],
            email : [],
            password: [],
            confirmPassword: [],
            table_init : [ this.selectUserDetail.table_assignment_init ],
            table_end : [ this.selectUserDetail.table_assignment_end ],
        });
        this._tableInit = this.selectUserDetail.table_assignment_init;
        this._tableEnd  = this.selectUserDetail.table_assignment_end;
        this._restaurants = Restaurants.find({}).zone();
        this._restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe();
        this._roles = Roles.find({}).zone();
        this._roleSub = MeteorObservable.subscribe('getRoleCollaborators').subscribe();
        this._tableSub = MeteorObservable.subscribe('tables', Meteor.userId()).subscribe(()=>{
            this._tables = Tables.find({});
        });
        
    }
    
    /**
     * Validate waiter role is select to enabled tables assignment
     * @param _roleId 
     */
    validateWaiterRole( _roleId : string ) {
        if(_roleId === '200') {
            this._showTablesSelect = true;
        } else {
             this._showConfirmError = false ;
             this._showTablesSelect = false ;
             this._disabledTablesAssignment = true ;
        }
    }

    /**
     * Enabled tables assignment
     * @param _pEvent 
     */
    pushSelectArray( _pEvent : any ){
        this._tablesNumber = [];
        if(_pEvent.checked){
            this._disabledTablesAssignment = false;
            let tablesCount : number = 0;
            tablesCount = Tables.collection.find({}).count();
            for (var index = 1; index <= tablesCount; index++) {
                this._tablesNumber.push(index);
            }
        } else {
            this._disabledTablesAssignment = true;
        }
    }

    /**
     * This function validate date format
     */
    validateFormatDate(){
        let re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    }

    /**
     * Collaborator update
     */
    updateUser(){
        if(Meteor.userId()){
            if(this._collaboratorEditionForm.valid){
                if (this._collaboratorEditionForm.value.password == this._collaboratorEditionForm.value.confirmPassword) {
                    if (this._collaboratorEditionForm.valid) {

                        if( this._collaboratorEditionForm.value.role === '200' ) {
                            
                            if ( this._disabledTablesAssignment || (this._collaboratorEditionForm.value.table_init === 0 && this._collaboratorEditionForm.value.table_end === 0) ){
                                this._collaboratorEditionForm.value.table_end = Tables.collection.find({}).count();
                                if (this._collaboratorEditionForm.value.table_end > 0 ){
                                    this._collaboratorEditionForm.value.table_init = 1;
                                }
                            }
                            if(!this._disabledTablesAssignment && this._collaboratorEditionForm.value.table_end < this._collaboratorEditionForm.value.table_init){
                                this._message = this.itemNameTraduction('COLLABORATORS_REGISTER.SELECT_RANGE_VALID_TABLES');
                                alert(this._message);
                                return;
                            }
                        }

                        Users.update({ _id : this.selectUser._id }, { $set : {
                                profile: {  first_name: this._collaboratorEditionForm.value.name,
                                            last_name: this._collaboratorEditionForm.value.last_name,
                                            language_code: this.selectUser.profile.language_code,
                                            image: this.selectUser.profile.image  }
                            }
                        });
                        if ( this._collaboratorEditionForm.value.role === '200' ) {
                            UserDetails.update({ _id : this.selectUserDetail._id }, { $set : {
                                    restaurant_work: this._collaboratorEditionForm.value.restaurant_work,
                                    birthdate : new Date("<" + this._collaboratorEditionForm.value.birthdate_yyyy + "-" + 
                                                        this._collaboratorEditionForm.value.birthdate_mm + "-" + 
                                                        this._collaboratorEditionForm.value.birthdate_dd + ">"),
                                    phone : this._collaboratorEditionForm.value.phone,
                                    table_assignment_init : Number.parseInt(this._collaboratorEditionForm.value.table_init.toString()),
                                    table_assignment_end  : Number.parseInt(this._collaboratorEditionForm.value.table_end.toString())
                                }
                            });
                        } else {
                            UserDetails.update({ _id : this.selectUserDetail._id }, { $set : {
                                    restaurant_work: this._collaboratorEditionForm.value.restaurant_work,
                                    birthdate : new Date("<" + this._collaboratorEditionForm.value.birthdate_yyyy + "-" + 
                                                        this._collaboratorEditionForm.value.birthdate_mm + "-" + 
                                                        this._collaboratorEditionForm.value.birthdate_dd + ">"),
                                    phone : this._collaboratorEditionForm.value.phone
                                }
                            });
                        }
                        this._dialogRef.close();
                        this._message = this.itemNameTraduction('COLLABORATORS_REGISTER.MESSAGE_COLLABORATOR_EDIT');
                        alert(this._message);
                        this.cancel();
                    }
                } else {
                    this._message = this.itemNameTraduction('SIGNUP.PASSWORD_NOT_MATCH');
                    alert(this._message);
                }
            } else {
                this._message = this.itemNameTraduction('COLLABORATORS_REGISTER.MESSAGE_FORM_INVALID');
                alert(this._message);
            }
        } else {
            this._message = this.itemNameTraduction('COLLABORATORS_REGISTER.MESSAGE_NOT_LOGIN');
            alert(this._message);
            return;
        }
    }

    /**
     * Form reset
     */
    cancel(){
        this._collaboratorEditionForm.controls['name'].reset();
        this._collaboratorEditionForm.controls['last_name'].reset();
        this._collaboratorEditionForm.controls['birthdate_dd'].reset();
        this._collaboratorEditionForm.controls['birthdate_mm'].reset();
        this._collaboratorEditionForm.controls['birthdate_yyyy'].reset();
        this._collaboratorEditionForm.controls['restaurant_work'].reset();
        this._collaboratorEditionForm.controls['phone'].reset();
        this._collaboratorEditionForm.controls['username'].reset();
        this._collaboratorEditionForm.controls['email'].reset();
        this._collaboratorEditionForm.controls['password'].reset();
        this._collaboratorEditionForm.controls['confirmPassword'].reset();

        this._router.navigate( [ 'app/collaborators' ] );
    }

    /**
     * This function allow translate strings
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
        this._restaurantSub.unsubscribe();
        this._roleSub.unsubscribe();
        this._tableSub.unsubscribe();
    }
}