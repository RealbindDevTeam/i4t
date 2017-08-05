import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
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
import { Users } from '../../../../../../../both/collections/auth/user.collection';
import template from './collaborators-register.component.html';

@Component({
    selector: 'collaborators-register',
    template
})
export class CollaboratorsRegisterComponent implements OnInit, OnDestroy {

    public  _selectedIndex       : number = 0;
    
    private _restaurantSub : Subscription;
    private _roleSub       : Subscription;
    private _tableSub      : Subscription;
    private _collaboratorRegisterForm : FormGroup;
    private _restaurants               : Observable<Restaurant[]>;
    private _roles                     : Observable<Role[]>;
    private _tables                    : Observable<Table[]>;
    private _userProfile      = new UserProfile();
    private _userProfileImage = new UserProfileImage();
    private _tablesNumber       : number[] = [];
    private _userLang           : string;
    private _error              : string;
    private _selectedRestaurant : string;
    private _message            : string;
    private _showConfirmError         : boolean = false;
    private _showTablesSelect         : boolean = false;
    private _disabledTablesAssignment : boolean = true;

    /**
     * CollaboratorsRegisterComponent constructor
     * @param {Router} _router 
     * @param {FormBuilder} _formBuilder 
     * @param {TranslateService} _translate 
     * @param {NgZone} _zone 
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _router : Router, 
                 private _formBuilder : FormBuilder, 
                 private _translate : TranslateService,
                 private _zone : NgZone,
                 private _userLanguageService: UserLanguageService )
    {
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit() {
        this._collaboratorRegisterForm = new FormGroup({
            name: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 70 ) ] ),
            last_name: new FormControl( '', [ Validators.required, Validators.minLength( 1 ), Validators.maxLength( 70 ) ] ),
            birthdate_dd: new FormControl('', [ Validators.required, CustomValidators.dayOfDateValidator ]),
            birthdate_mm: new FormControl('', [ Validators.required, CustomValidators.monthOfDateValidator ]),
            birthdate_yyyy: new FormControl('', [ Validators.required, CustomValidators.yearOfDateValidator ]),
            restaurant_work: new FormControl( '', [ Validators.required ] ),
            role: new FormControl( '', [ Validators.required ] ),
            phone: new FormControl( '', [ Validators.minLength( 1 ), Validators.maxLength( 40 ) ] ),
            username: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
            email : new FormControl(''),
            password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
            confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
            table_init : new FormControl(0),
            table_end : new FormControl(0),
        });
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
     * This function validate Register form
     * @param _index 
     */
    canMove( _index: number ): boolean {
        switch ( _index ) {
        case 0:
            return true;
        case 1:
            if( this._collaboratorRegisterForm.controls['name'].valid 
                && this._collaboratorRegisterForm.controls['last_name'].valid 
                && this._collaboratorRegisterForm.controls['restaurant_work'].valid 
                && this._collaboratorRegisterForm.controls['role'].valid 
                && this._collaboratorRegisterForm.controls['birthdate_dd'].valid 
                && this._collaboratorRegisterForm.controls['birthdate_mm'].valid 
                && this._collaboratorRegisterForm.controls['birthdate_yyyy'].valid )
            {
                return true;
            } else {
                return false;
            }
        default:
            return true;
        }
    }

    /**
     * Validate Form date
     */
    validateFormatDate(){
        let re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    }

    /**
     * Show next page of the wizard
     */
    next(): void {
        if( this.canMove( this._selectedIndex + 1 ) ) {
            this._selectedIndex ++;
        }
    }

    /**
     * Previous page of the wizard
     */
    previous(): void {
        if( this._selectedIndex === 0 ) {
            return;
        }
        if( this.canMove( this._selectedIndex - 1 ) ) {
            this._selectedIndex --;
        }
    }

    /**
     * Form register collaborator
     */
    register(){
        if(Meteor.userId()){
            if(this._collaboratorRegisterForm.valid){
                if (this._collaboratorRegisterForm.value.password == this._collaboratorRegisterForm.value.confirmPassword) {
                    this._userProfile.first_name = this._collaboratorRegisterForm.value.name;
                    this._userProfile.last_name = this._collaboratorRegisterForm.value.last_name;
                    this._userProfile.language_code = this._userLang;

                    this._userProfileImage.complete = null;
                    this._userProfileImage.extension = null;
                    this._userProfileImage.name = null;
                    this._userProfileImage.progress = null;
                    this._userProfileImage.size = null;
                    this._userProfileImage.store = null;
                    this._userProfileImage.token = null;
                    this._userProfileImage.type = null;
                    this._userProfileImage.uploaded_at = null;
                    this._userProfileImage.uploading = null;
                    this._userProfileImage.url = null;

                    this._userProfile.image = this._userProfileImage;

                    if (this._collaboratorRegisterForm.valid) {
                        
                        if( this._collaboratorRegisterForm.value.role === '200' ){
                            if ( this._disabledTablesAssignment || (this._collaboratorRegisterForm.value.table_init === 0 && this._collaboratorRegisterForm.value.table_end === 0) ){
                                this._collaboratorRegisterForm.value.table_end = Tables.collection.find({}).count();
                                if (this._collaboratorRegisterForm.value.table_end > 0 ){
                                    this._collaboratorRegisterForm.value.table_init = 1;
                                }
                            }
                            if(!this._disabledTablesAssignment && this._collaboratorRegisterForm.value.table_end < this._collaboratorRegisterForm.value.table_init){
                                this._message = this.itemNameTraduction('COLLABORATORS_REGISTER.SELECT_RANGE_VALID_TABLES');
                                alert(this._message);
                                return;
                            }
                        }

                        let info : any = ({
                            "email": this._collaboratorRegisterForm.value.email,
                            "password": this._collaboratorRegisterForm.value.password,
                            "username": this._collaboratorRegisterForm.value.username,
                            "profile": this._userProfile,
                        });

                        MeteorObservable.call('createCollaboratorUser', info).subscribe((result) => {
                            var id_detail : string;
                            if( this._collaboratorRegisterForm.value.role === '200' ){
                                id_detail = UserDetails.collection.insert({
                                    user_id: result.toString(),
                                    role_id: this._collaboratorRegisterForm.value.role,
                                    is_active: true,
                                    restaurant_work: this._collaboratorRegisterForm.value.restaurant_work,
                                    jobs: 0,
                                    penalties: [],
                                    current_restaurant: "",
                                    current_table: '',
                                    birthdate : new Date("<" + this._collaboratorRegisterForm.value.birthdate_yyyy + "-" + 
                                                        this._collaboratorRegisterForm.value.birthdate_mm + "-" + 
                                                        this._collaboratorRegisterForm.value.birthdate_dd + ">"),
                                    phone : this._collaboratorRegisterForm.value.phone,
                                    enabled : true,
                                    table_assignment_init : Number.parseInt(this._collaboratorRegisterForm.value.table_init),
                                    table_assignment_end  : Number.parseInt(this._collaboratorRegisterForm.value.table_end),
                                });
                            } else {
                                id_detail = UserDetails.collection.insert({
                                    user_id: result.toString(),
                                    role_id: this._collaboratorRegisterForm.value.role,
                                    is_active: true,
                                    restaurant_work: this._collaboratorRegisterForm.value.restaurant_work,
                                    jobs: 0,
                                    penalties: [],
                                    current_restaurant: "",
                                    current_table: '',
                                    birthdate : new Date("<" + this._collaboratorRegisterForm.value.birthdate_yyyy + "-" + 
                                                        this._collaboratorRegisterForm.value.birthdate_mm + "-" + 
                                                        this._collaboratorRegisterForm.value.birthdate_dd + ">"),
                                    phone : this._collaboratorRegisterForm.value.phone,
                                    enabled : true,
                                });
                            }

                            if(id_detail) {
                                this._message = this.itemNameTraduction('COLLABORATORS_REGISTER.MESSAGE_COLLABORATOR');
                                alert(this._message);
                                this.cancel();
                            }
                            else {
                                this._message = this.itemNameTraduction('COLLABORATORS_REGISTER.ERROR_INSERT');
                                alert(this._message);
                            }
                        }, (error) => {
                            alert(error);
                        });
                        
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
     * Reset register form
     */
    cancel(){
        this._collaboratorRegisterForm.controls['name'].reset();
        this._collaboratorRegisterForm.controls['last_name'].reset();
        this._collaboratorRegisterForm.controls['birthdate_dd'].reset();
        this._collaboratorRegisterForm.controls['birthdate_mm'].reset();
        this._collaboratorRegisterForm.controls['birthdate_yyyy'].reset();
        this._collaboratorRegisterForm.controls['restaurant_work'].reset();
        this._collaboratorRegisterForm.controls['phone'].reset();
        this._collaboratorRegisterForm.controls['username'].reset();
        this._collaboratorRegisterForm.controls['email'].reset();
        this._collaboratorRegisterForm.controls['password'].reset();
        this._collaboratorRegisterForm.controls['confirmPassword'].reset();

        this._router.navigate( [ 'app/collaborators' ] );
    }

    /**
     * This function allow translate
     * @param itemName 
     */
    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
      this._restaurantSub.unsubscribe();
      this._roleSub.unsubscribe();
      this._tableSub.unsubscribe();
    }

}