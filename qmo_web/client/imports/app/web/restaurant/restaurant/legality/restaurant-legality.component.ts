import { Component, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../../shared/services/user-language.service';

import template from './restaurant-legality.component.html';
import style from './restaurant-legality.component.scss';

@Component({
    selector: 'restaurant-legality',
    template,
    styles: [ style ]
})
export class RestaurantLegalityComponent {

    @Input() countryId: string;

    /**
     * RestaurantLegality Constructor
     * @param {TranslateService} _translate 
     * @param {UserLanguageService} _userLanguageService
     */
    constructor( private _translate: TranslateService,
                 private _userLanguageService: UserLanguageService ) {
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }
}