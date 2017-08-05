import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
import { UserLanguageService } from '../../../../shared/services/user-language.service';
import { Restaurant } from '../../../../../../../both/models/restaurant/restaurant.model';

import template from './restaurant-info-detail.component.html';
import style from './restaurant-info-detail.component.scss';

@Component({
    selector: 'restaurant-info-detail',
    template,
    styles: [ style ]
})
export class RestaurantInfoDetailComponent {

    public _restaurant: Restaurant;

    /**
     * RestaurantInfoDetailComponent Constructor
     * @param {TranslateService} _translate 
     * @param {MdDialogRef<any>} _dialogRef 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( private _translate: TranslateService, 
                 public _dialogRef: MdDialogRef<any>, 
                 private _userLanguageService: UserLanguageService ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }
}