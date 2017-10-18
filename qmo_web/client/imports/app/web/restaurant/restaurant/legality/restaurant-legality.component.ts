import { Component, Input, Output, EventEmitter } from '@angular/core';
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
    @Output() restaurantLegality = new EventEmitter();

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

    /**
     * Receive restaurant legality
     * @param {Object} _restaurantLegality 
     */
    setRestaurantLegality( _restaurantLegality: Object ):void {
        this.restaurantLegality.emit( _restaurantLegality );
    }
}