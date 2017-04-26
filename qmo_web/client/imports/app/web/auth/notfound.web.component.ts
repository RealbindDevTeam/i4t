import { Component, NgZone, ViewContainerRef } from '@angular/core';
import { TranslateService } from 'ng2-translate';

import template from './notfound.web.component.html';
import style from './notfound.web.component.scss';

@Component({
    selector: 'notfound',
    template,
    styles: [style]
})

export class NotFoundWebComponent {

    private userLang: string;

    constructor(protected zone: NgZone, protected translate: TranslateService) {
        this.userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(this.userLang);
    }
}