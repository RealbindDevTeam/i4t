import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MdDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { Observable, Subscription } from 'rxjs';

import { CustomValidators } from '../../../../../../../both/shared-components/validators/custom-validator';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';
import { Restaurants } from '../../../../../../../both/collections/restaurant/restaurant.collection';
import { Role } from '../../../../../../../both/models/auth/role.model';
import { Roles } from '../../../../../../../both/collections/auth/role.collection';
import { UserProfile, UserProfileImage } from '../../../../../../../both/models/auth/user-profile.model';
import { UserDetails } from '../../../../../../../both/collections/auth/user-detail.collection';
import { UserDetail } from '../../../../../../../both/models/auth/user-detail.model';
import { User } from '../../../../../../../both/models/auth/user.model';
import { Users } from '../../../../../../../both/collections/auth/user.collection';
import template from './collaborators-edition.component.html';

@Component({
    selector: 'collaborators-edition',
    template
})
export class CollaboratorsEditionComponent implements OnInit, OnDestroy {

    public _selectedIndex: number = 0;
    public _selectUserDetail : UserDetail;

    private _user: User;
    private _userSubscription: Subscription;

    private _restaurants: Observable<Restaurant[]>;
    private _restaurantSub: Subscription;
    private _roles : Observable<Role[]>;
    private _roleSub : Subscription;
    private _collaboratorEditionForm : FormGroup;
    private _userProfile = new UserProfile();
    private _userProfileImage = new UserProfileImage();
    
    private _userLang : string;
    private _error : string
    private _message: string;
    private _showConfirmError: boolean = false;

    private _selectedRestaurant : string;

    constructor( private _router: Router, 
                 private _formBuilder: FormBuilder, 
                 private _translate: TranslateService,
                 private _zone: NgZone,
                 public _dialogRef: MdDialogRef<any> )
    {
        this._userLang = navigator.language.split('-')[0];
        _translate.setDefaultLang('en');
        _translate.use(this._userLang);
    }

     ngOnInit() {
        this._userSubscription = MeteorObservable.subscribe('getUserSettings').subscribe(() =>{
            this._user = Users.collection.findOne({ _id: this._selectUserDetail.user_id });
            
        });

        this._collaboratorEditionForm = this._formBuilder.group({
            name: [ this._user.profile.first_name ],
            last_name: [ this._user.profile.last_name ],
            birthdate_dd: [],
            birthdate_mm: [],
            birthdate_yyyy: [],
            restaurant_work: [],
            role: [ this._selectUserDetail.role_id ],
            phone: [ this._selectUserDetail.phone ],
            username: [ this._user.username ],
            email : [  ],
            password: [  ],
            confirmPassword: []
        });
        //if(this._user.emails){

        //}



        this._restaurants = Restaurants.find({}).zone();
        this._restaurantSub = MeteorObservable.subscribe('restaurants', Meteor.userId()).subscribe();
        this._roles = Roles.find({}).zone();
        this._roleSub = MeteorObservable.subscribe('getRoleCollaborators').subscribe();
    }

    canMove( _index: number ): boolean {
        switch ( _index ) {
        case 0:
            return true;
        case 1:
            if( this._collaboratorEditionForm.controls['name'].valid 
                && this._collaboratorEditionForm.controls['last_name'].valid 
                && this._collaboratorEditionForm.controls['restaurant_work'].valid 
                && this._collaboratorEditionForm.controls['role'].valid 
                && this._collaboratorEditionForm.controls['birthdate_dd'].valid 
                && this._collaboratorEditionForm.controls['birthdate_mm'].valid 
                && this._collaboratorEditionForm.controls['birthdate_yyyy'].valid 
                )
            {
                return true;
            } else {
                return false;
            }
        default:
            return true;
        }
    }

    validateFormatDate(){
        let re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

    }

    next(): void {
        if( this.canMove( this._selectedIndex + 1 ) ) {
            this._selectedIndex ++;
        }
    }

    previous(): void {
        if( this._selectedIndex === 0 ) {
            return;
        }
        if( this.canMove( this._selectedIndex - 1 ) ) {
            this._selectedIndex --;
        }
    }

    register(){
        if(Meteor.userId()){
            if(this._collaboratorEditionForm.valid){
                if (this._collaboratorEditionForm.value.password == this._collaboratorEditionForm.value.confirmPassword) {
                    this._userProfile.first_name = this._collaboratorEditionForm.value.name;
                    this._userProfile.last_name = this._collaboratorEditionForm.value.last_name;
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

                    if (this._collaboratorEditionForm.valid) {
                        
                        let info : any = ({
                            "email": this._collaboratorEditionForm.value.email,
                            "password": this._collaboratorEditionForm.value.password,
                            "username": this._collaboratorEditionForm.value.username,
                            "profile": this._userProfile,
                        });

                        MeteorObservable.call('createCollaboratorUser', info).subscribe((result) => {

                            var id_detail = UserDetails.collection.insert({
                                user_id: result.toString(),
                                role_id: this._collaboratorEditionForm.value.role,
                                is_active: true,
                                restaurant_work: this._collaboratorEditionForm.value.restaurant_work,
                                penalties: [],
                                current_restaurant: "",
                                current_table: '',
                                birthdate : new Date("<" + this._collaboratorEditionForm.value.birthdate_yyyy + "-" + 
                                                     this._collaboratorEditionForm.value.birthdate_mm + "-" + 
                                                     this._collaboratorEditionForm.value.birthdate_dd + ">"),
                                phone : this._collaboratorEditionForm.value.phone
                            });

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

    itemNameTraduction(itemName: string): string{
        var wordTraduced: string;
        this._translate.get(itemName).subscribe((res: string) => {
            wordTraduced = res; 
        });
        return wordTraduced;
    }

    ngOnDestroy(){
        this._userSubscription.unsubscribe();
        this._restaurantSub.unsubscribe();
        this._roleSub.unsubscribe();
    }

}