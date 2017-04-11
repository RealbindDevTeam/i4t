import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from 'ng2-translate';
import { MdDialogRef } from '@angular/material';
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

    constructor( private _translate: TranslateService, public _dialogRef: MdDialogRef<any> ){
        var _userLang = navigator.language.split( '-' )[0];
        _translate.setDefaultLang( 'en' );
        _translate.use( _userLang );
    }
}