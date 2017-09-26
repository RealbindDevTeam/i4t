import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Meteor } from 'meteor/meteor';
import { UserLanguageService } from '../../../../../shared/services/user-language.service';

import template from './table-detail.component.html';
import style from './table-detail.component.scss';

@Component({
    selector: 'table-detail',
    template,
    styles: [ style ]
})
export class TableDetailComponent implements OnInit, OnDestroy {

    private _user = Meteor.userId();

    /**
     * TableDetailComponent Constructor
     * @param {TranslateService} _translate 
     * @param {NgZone} _ngZone 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( private _translate: TranslateService,
                 private _ngZone: NgZone,
                 private _userLanguageService: UserLanguageService ){
        _translate.use( this._userLanguageService.getLanguage( Meteor.user() ) );
        _translate.setDefaultLang( 'en' );
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){

    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){

    }
}