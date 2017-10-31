import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { TranslateService } from '@ngx-translate/core';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';

@Component({
    selector: 'resturant-schedule',
    templateUrl: './restaurant-schedule.component.html',
    styles: [ './restaurant-schedule.component.scss' ],
    providers: [ UserLanguageService ]
})
export class RestaurantScheduleComponent{

    public _restaurantSchedule: Restaurant;

    /**
     * RestaurantScheduleComponent constructor
     * @param {MatDialogRef<any>} _dialogRef
     * @param {TranslateService} _translate
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( public _dialogRef: MatDialogRef<any>, 
                 private _translate: TranslateService, 
                 private _userLanguageService: UserLanguageService ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }
}