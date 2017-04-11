import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';

import template from './go-to-store.component.html';
import style from './go-to-store.component.scss';

@Component({
    selector: 'go-to-store',
    template,
    styles: [style]
})

export class GoToStoreComponent {
    public constructor(private translate: TranslateService) 
    {
        var userLang = navigator.language.split('-')[0];
        translate.use(userLang);
    }
}