import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserLanguageService } from '../../../shared/services/user-language.service';

@Component({
    selector: 'go-to-store',
    templateUrl: './go-to-store.component.html',
    styleUrls: [ './go-to-store.component.scss' ]
})

export class GoToStoreComponent {

    private _userLang     : string  = "";

    /**
     * GoToStoreComponent Constructor
     * @param {TranslateService} translate 
     * @param {UserLanguageService} _userLanguageService
     */
    public constructor( private translate: TranslateService,
                        public _userLanguageService: UserLanguageService ) {
        this._userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use( this._userLang );
    }
}