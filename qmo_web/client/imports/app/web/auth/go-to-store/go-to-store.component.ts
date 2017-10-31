import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserLanguageService } from '../../../shared/services/user-language.service';

@Component({
    selector: 'go-to-store',
    templateUrl: './go-to-store.component.html',
    styles: [ './go-to-store.component.scss' ]
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