import { Component, NgZone, ViewContainerRef } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { UserLanguageService } from '../../shared/services/user-language.service';

import template from './notfound.web.component.html';
import style from './notfound.web.component.scss';

@Component({
    selector: 'notfound',
    template,
    styles: [style]
})

export class NotFoundWebComponent {

    private userLang: string;

    /**
     * NotFoundWebComponent Constructor
     * @param {NgZone} zone 
     * @param {TranslateService} translate
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( protected zone: NgZone, 
                 protected translate: TranslateService, 
                 protected _userLanguageService: UserLanguageService ) {
        translate.use( this._userLanguageService.getNavigationLanguage() );
        translate.setDefaultLang( 'en' );
    }
}