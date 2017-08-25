import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { MeteorObservable } from 'meteor-rxjs';
import { PageScrollService, PageScrollInstance, PageScrollConfig } from 'ng2-page-scroll';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';

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
     */
    constructor( @Inject(DOCUMENT) private document: Document,
                 private pageScrollService: PageScrollService,
                 private translate: TranslateService) {
                    PageScrollConfig.defaultScrollOffset = 64;
                    PageScrollConfig.defaultDuration = 900; 
        
                    let userLang = navigator.language.split('-')[0];
                    translate.setDefaultLang('en');
                    translate.use( userLang );
    }

    /**
     * ngOnDestroy Implementation
     */
    ngOnDestroy(){
        this.removeSubscriptions();
    }

    /**
     * ngOnInit Implementation
     */
    ngOnInit(){
        this.removeSubscriptions();
        this._languages = Languages.find({}).zone();
        this._subscription = MeteorObservable.subscribe('languages').subscribe();
    }

    /**
     * Remove all subscriptions
     */
    removeSubscriptions():void{
        if( this._subscription ){ this._subscription.unsubscribe(); }
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