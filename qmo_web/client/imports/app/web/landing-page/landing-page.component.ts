import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { MeteorObservable } from 'meteor-rxjs';
import { PageScrollService, PageScrollInstance, PageScrollConfig } from 'ng2-page-scroll';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { UserLanguageService } from '../../shared/services/user-language.service';

import { Language } from '../../../../../both/models/settings/language.model';
import { Languages } from '../../../../../both/collections/settings/language.collection';

import template from './landing-page.component.html';
import style    from './landing-page.component.scss';

@Component({
    selector: 'landing-page',
    template,
    styles: [ style ]
})
export class LandingPageComponent implements OnInit, OnDestroy {

    private _languages : Observable<Language[]>;
    private _subscription : Subscription;

    /**
     * LandingPageComponent Constructor
     * @param {Document} document 
     * @param {PageScrollService} pageScrollService 
     * @param {TranslateService} translate 
     * @param {UserLanguageService} _userLanguageService 
     */
    constructor( @Inject(DOCUMENT) private document: Document,
                 private pageScrollService: PageScrollService,
                 private translate: TranslateService, 
                 private _userLanguageService: UserLanguageService ) {
                    PageScrollConfig.defaultScrollOffset = 64;
                    PageScrollConfig.defaultDuration = 900; 
        
                    translate.use( this._userLanguageService.getNavigationLanguage() );
                    translate.setDefaultLang( 'en' );
    }

    ngOnDestroy(){
        this._subscription.unsubscribe();
    }

    ngOnInit(){
        this._languages = Languages.find({}).zone();
        this._subscription = MeteorObservable.subscribe('languages').subscribe();
    }

    public goToSection(section) {
        let pageScrollInstance: PageScrollInstance = PageScrollInstance.simpleInstance(this.document, "#" + section);
        this.pageScrollService.start(pageScrollInstance);
    }

    openNav(){
        document.getElementById("sidenav-dev").style.width = "100%";
    }

    closeNav() {
        document.getElementById("sidenav-dev").style.width = "0";
    }

    changeLang(lang) {
        this.translate.use(lang);
    }

}