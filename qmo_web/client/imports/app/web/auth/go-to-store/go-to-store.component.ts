import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserLanguageService } from '../../../shared/services/user-language.service';

import template from './go-to-store.component.html';
import style from './go-to-store.component.scss';

@Component({
    selector: 'go-to-store',
    template,
    styles: [style]
})

export class GoToStoreComponent {

    /**
     * GoToStoreComponent Constructor
     * @param {TranslateService} translate 
     * @param {UserLanguageService} _userLanguageService
     */
    public constructor( private translate: TranslateService,
                        public _userLanguageService: UserLanguageService ) {
        translate.use( this._userLanguageService.getNavigationLanguage() );
        translate.setDefaultLang( 'en' );
    }
}