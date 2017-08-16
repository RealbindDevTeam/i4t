import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { TranslateService } from '@ngx-translate/core';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';

import template from './restaurant-schedule.component.html';
import style from './restaurant-schedule.component.scss';

@Component({
    selector: 'resturant-schedule',
    template,
    styles: [ style ],
    providers: [ UserLanguageService ]
})
export class RestaurantScheduleComponent{

    public _restaurantSchedule: Restaurant;

    /**
     * RestaurantScheduleComponent constructor
     * @param {MdDialogRef<any>} _dialogRef
     * @param {TranslateService} _translate
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( public _dialogRef: MdDialogRef<any>, 
                 private _translate: TranslateService, 
                 private _userLanguageService: UserLanguageService ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }
}