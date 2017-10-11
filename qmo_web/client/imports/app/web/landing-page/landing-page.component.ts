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

    private _showIconMenu : boolean = true;

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

    /**
     * Go to section
     * @param _pSection 
     * @param _pMobileFlag 
     */
    goToSection( _pSection : string, _pMobileFlag : boolean ) {
        let pageScrollInstance: PageScrollInstance = PageScrollInstance.simpleInstance(this.document, "#" + _pSection);
        this.pageScrollService.start(pageScrollInstance);
        if(_pMobileFlag) this.openNav();
    }

    /**
     * Open sidenav
     */
    openNav(){
        document.getElementById("sidenav-dev").classList.remove('active-sidenav');
        document.getElementById("sidenav-bg").classList.remove('active-sidenav-bg');
        
        if(this._showIconMenu){
            document.getElementById("sidenav-dev").classList.add('active-sidenav');
            document.getElementById("sidenav-bg").classList.add('active-sidenav-bg');
        }

        this._showIconMenu = !this._showIconMenu;
    }

    /**
     * Language change
     * @param lang 
     */
    langChange(lang) {
        this.translate.use(lang);
    }

}